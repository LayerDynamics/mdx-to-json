import React, { useState, useCallback, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { parseMDX, createKnowledgeBaseEntry } from "./utils/mdxUtils";
import { Container, Button, DropzoneArea, PreviewContainer } from "./styles";
import FileList from "./components/FileList";
import FormatButton from "./components/FormatButton";

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

const App: React.FC = () => {
    const [mdxFiles, setMdxFiles] = useState<File[]>([]);
    const [jsonEntries, setJsonEntries] = useState<KnowledgeBaseEntry[]>([]);
    const [combinedJson, setCombinedJson] = useState<any | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            console.log("Accepted files:", acceptedFiles);
            console.log("Rejected files:", rejectedFiles);
            setMdxFiles([...mdxFiles, ...acceptedFiles]);
        },
        [mdxFiles],
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'text/markdown': ['.md', '.mdx'],
        },
        validator: (file) => {
            if (file.name.endsWith('.md') || file.name.endsWith('.mdx')) {
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
            const content = await file.text();
            const parsed = await parseMDX(content);
            const entry = createKnowledgeBaseEntry(parsed.metadata, parsed.content);
            entries.push(entry);
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
        }, {});

        console.log('Combined JSON:', combined);
        setCombinedJson(combined);
    };

    const handleSave = () => {
        console.log("Saving JSON:", combinedJson || jsonEntries);

        const blob = new Blob(
            [JSON.stringify(combinedJson || jsonEntries, null, 2)],
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
                {combinedJson
                    ? JSON.stringify(combinedJson, null, 2)
                    : jsonEntries.map((entry, index) => (
                            <div key={index}>
                                <h3>{entry.title}</h3>
                                <pre>{JSON.stringify(entry, null, 2)}</pre>
                                <hr />
                            </div>
                        ))}
            </PreviewContainer>
        </Container>
    );
};

export default App;
