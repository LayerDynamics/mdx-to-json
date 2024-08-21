import React, { useState, useCallback, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useParseMDX } from "./hooks/parseMDX";
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
        async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            console.log("Accepted files:", acceptedFiles);
            console.log("Rejected files:", rejectedFiles);

            // Display feedback to the user
            setIsProcessing(true);

            try {
                const processedFiles = await Promise.all(
                    acceptedFiles.map(async (file) => {
                        const content = await file.text();
                        const sanitizedContent = sanitizeContent(content);

                        // Process each file asynchronously
                        await parseMDX(sanitizedContent);

                        // Return the parsed content to be used later
                        return {
                            file,
                            parsedContent: parsedContent ? { ...parsedContent } : null
                        };
                    })
                );

                const newEntries = processedFiles
                    .map(({ parsedContent }) => {
                        if (parsedContent) {
                            return createKnowledgeBaseEntry(parsedContent.metadata, parsedContent.content);
                        }
                        return null;
                    })
                    .filter((entry) => entry !== null);

                setJsonEntries((prevEntries) => [...prevEntries, ...newEntries]);
            } catch (error) {
                console.error("Error processing files:", error);
                setError("An error occurred while processing the files.");
            } finally {
                setIsProcessing(false);
            }

            if (rejectedFiles.length > 0) {
                setError("Some files were rejected. Please ensure all files are .md or .mdx format.");
            }

            setIsPreviewReady(false);
        },
        [parseMDX, sanitizeContent]
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
