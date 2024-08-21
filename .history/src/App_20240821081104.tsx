// /src/App.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useParseMDX } from "./hooks/parseMDX";
import { Container, Button, DropzoneArea, PreviewContainer } from "./styles";
import FileList from "./components/FileList";
import FormatButton from "./components/FormatButton";
import DOMPurify from "dompurify";

// Import the router function
import { parseContentBasedOnSyntax } from "./hooks/parseMDX";

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

    // Use the useParseMDX hook
    const { parsedContent, parseMDX } = useParseMDX();

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            console.log("Accepted files:", acceptedFiles);
            console.log("Rejected files:", rejectedFiles);
            setMdxFiles([...mdxFiles, ...acceptedFiles]);
        },
        [mdxFiles]
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

    const handlePreview = async () => {
        const entries: KnowledgeBaseEntry[] = [];

        for (const file of mdxFiles) {
            try {
                const content = await file.text();
                console.log("File content:", content); // Debugging log
                const sanitizedContent = sanitizeContent(content);
                console.log("Sanitized content:", sanitizedContent); // Debugging log

                // Use the router function to handle content parsing based on syntax
                parseContentBasedOnSyntax(sanitizedContent, parseMDX);

                if (parsedContent) {
                    console.log("Parsed MDX:", parsedContent); // Debugging log
                    const entry = createKnowledgeBaseEntry(parsedContent.metadata, parsedContent.content);
                    entries.push(entry);
                } else {
                    console.error("Parsed content is null or undefined for file:", file.name);
                }
            } catch (error) {
                console.error(`Failed to parse file ${file.name}:`, error);
            }
        }

        console.log("Preview JSON entries:", entries);
        setJsonEntries(entries);
    };

    useEffect(() => {
        if (mdxFiles.length > 0) {
            handlePreview();  // Automatically preview files when they are uploaded
        }
    }, [mdxFiles]);

    const handleCombine = () => {
        console.log('JSON entries before combine:', jsonEntries);

        if (jsonEntries.length === 0) {
            console.error("No JSON entries to combine.");
            return;
        }

        const combined = jsonEntries.reduce((acc, entry) => {
            acc[entry.title] = {
                tags: entry.tags,
                category: entry.category,
                content: entry.content,
                metadata: entry.metadata,
            };
            return acc;
        }, {} as Record<string, KnowledgeBaseEntry>);

        console.log('Combined JSON:', combined);
        setCombinedJson(combined);
    };

    const handleSave = () => {
        console.log("Saving JSON:", combinedJson || jsonEntries);

        const blob = new Blob(
            [safeJSONStringify(combinedJson || jsonEntries)],
            { type: "application/json" },
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "knowledge_base.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteFile = (index: number) => {
        const newFiles = [...mdxFiles];
        newFiles.splice(index, 1);
        setMdxFiles(newFiles);
    };

    const handleFormat = (formattedEntries: KnowledgeBaseEntry[]) => {
        setJsonEntries(formattedEntries);
    };

    // Debugging logs to check conditions
    console.log("MDX Files:", mdxFiles.length);
    console.log("JSON Entries:", jsonEntries.length);
    console.log("Combined JSON:", combinedJson);

    return (
        <Container>
            <h1>MDX to JSON Converter</h1>
            <DropzoneArea {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag & drop some .mdx or .md files here, or click to select files</p>
            </DropzoneArea>

            <FileList files={mdxFiles} onDelete={handleDeleteFile} />

            <Button onClick={handleCombine}>Combine Files</Button>
            <FormatButton jsonEntries={jsonEntries} onFormat={handleFormat} />
            <Button onClick={handleSave}>Save JSON</Button>

            <PreviewContainer>
                {jsonEntries.length > 0 ? (
                    jsonEntries.map((entry, index) => (
                        <div key={index}>
                            <h3>{entry.title}</h3>
                            <pre>{safeJSONStringify(entry)}</pre>
                            <hr />
                        </div>
                    ))
                ) : (
                    <p>No files previewed yet.</p>
                )}
            </PreviewContainer>
        </Container>
    );
};

export default App;
