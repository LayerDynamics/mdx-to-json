import React, { useState, useCallback, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useParseMDX, parseContentBasedOnSyntax } from "./hooks/parseMDX";
import { Container, Button, DropzoneArea, PreviewContainer } from "./styles";
import FileList from "./components/FileList";
import FormatButton from "./components/FormatButton";
import DOMPurify from "dompurify";
import { createKnowledgeBaseEntry } from "./utils/mdxUtils";
import Spinner from "./components/Spinner";

interface KnowledgeBaseEntry {
    title: string;
    tags: string[];
    category: string;
    content: string;
    metadata: {
        created_at: string;
        author: string;
    };
}

const safeJSONStringify = (obj: any) => {
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'string') {
            return value.replace(/\\n/g, ' ').replace(/\\/g, '');
        }
        return value;
    }, 2);
};

const sanitizeContent = (content: string) => {
    return DOMPurify.sanitize(content);
};

const App: React.FC = () => {
    const [mdxFiles, setMdxFiles] = useState<File[]>([]);
    const [jsonEntries, setJsonEntries] = useState<KnowledgeBaseEntry[]>([]);
    const [combinedJson, setCombinedJson] = useState<Record<string, KnowledgeBaseEntry> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isPreviewReady, setIsPreviewReady] = useState<boolean>(false);

    const { parsedContent, isLoading, error: parseError, parseMDX } = useParseMDX();

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            console.log("Accepted files:", acceptedFiles);
            console.log("Rejected files:", rejectedFiles);
            setMdxFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
            if (rejectedFiles.length > 0) {
                setError("Some files were rejected. Please ensure all files are .md or .mdx format.");
            }
            setIsPreviewReady(false);
        },
        []
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'text/markdown': ['.md', '.mdx'],
        },
        validator: (file) => {
            if (file.name && (file.name.endsWith('.md') || file.name.endsWith('.mdx'))) {
                return null; // accept the file
            }
            return {
                code: "invalid-extension",
                message: "File must have a .md or .mdx extension",
            };
        },
    });

    const processFiles = useCallback(async () => {
        setIsProcessing(true);
        setIsPreviewReady(false);
        setError(null);
        const entries: KnowledgeBaseEntry[] = [];

        for (const file of mdxFiles) {
            try {
                const content = await file.text();
                const sanitizedContent = sanitizeContent(content);

                parseMDX(sanitizedContent);

                // Wait for parsedContent to be available
                if (parsedContent) {
                    const entry = createKnowledgeBaseEntry(parsedContent.metadata, parsedContent.content);
                    if (entry) {
                        entries.push(entry);
                    } else {
                        console.error("Failed to create knowledge base entry for file:", file.name);
                    }
                }
            } catch (error) {
                console.error(`Failed to parse file ${file.name}:`, error);
                setError(`Failed to parse file ${file.name}. Please check the file content.`);
            }
        }

        setJsonEntries(entries);
        setIsProcessing(false);
        setIsPreviewReady(true);
    }, [mdxFiles, parseMDX, parsedContent]);

    const handleCombine = useCallback(() => {
        if (jsonEntries.length === 0) {
            setError("No JSON entries to combine.");
            return;
        }

        setIsProcessing(true);
        setIsPreviewReady(false);

        try {
            const combined = jsonEntries.reduce((acc, entry) => {
                acc[entry.title] = {
                    tags: entry.tags,
                    category: entry.category,
                    content: entry.content,
                    metadata: entry.metadata,
                };
                return acc;
            }, {} as Record<string, KnowledgeBaseEntry>);

            setCombinedJson(combined);
        } finally {
            setIsProcessing(false);
            setIsPreviewReady(true);
        }
    }, [jsonEntries]);

    const handleSave = useCallback(() => {
        const dataToSave = combinedJson || jsonEntries;

        if (Object.keys(dataToSave).length === 0) {
            setError("No data to save. Please combine files first.");
            return;
        }

        setIsProcessing(true);

        try {
            const blob = new Blob(
                [safeJSONStringify(dataToSave)],
                { type: "application/json" }
            );
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "knowledge_base.json";
            link.click();
            URL.revokeObjectURL(url);
        } finally {
            setIsProcessing(false);
        }
    }, [combinedJson, jsonEntries]);

    const handleDeleteFile = useCallback((index: number) => {
        setMdxFiles(prevFiles => {
            const newFiles = [...prevFiles];
            newFiles.splice(index, 1);
            return newFiles;
        });
        setIsPreviewReady(false);
    }, []);

    const handleFormat = useCallback((formattedEntries: KnowledgeBaseEntry[]) => {
        setJsonEntries(formattedEntries);
        setIsPreviewReady(true);
    }, []);

    return (
        <Container>
            <h1>MDX to JSON Converter</h1>
            <DropzoneArea {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag & drop some .mdx or .md files here, or click to select files</p>
            </DropzoneArea>

            <FileList files={mdxFiles} onDelete={handleDeleteFile} />

            <Button onClick={handleCombine} disabled={jsonEntries.length === 0 || isProcessing}>Combine Files</Button>
            <FormatButton jsonEntries={jsonEntries} onFormat={handleFormat} disabled={isProcessing} />
            <Button onClick={handleSave} disabled={(!combinedJson && jsonEntries.length === 0) || isProcessing}>Save JSON</Button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {parseError && <p style={{ color: 'red' }}>Parse error: {parseError.message}</p>}

            <PreviewContainer>
                {isProcessing || isLoading ? (
                    <Spinner />
                ) : isPreviewReady && jsonEntries.length > 0 ? (
                    jsonEntries.map((entry, index) => (
                        <MDXRenderer key={index} content={entry.content} metadata={entry.metadata} />
                    ))
                ) : (
                    <p>No files previewed yet.</p>
                )}
            </PreviewContainer>
        </Container>
    );
};

export default App;