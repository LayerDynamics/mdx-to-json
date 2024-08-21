// src/App.tsx
import React, { useState } from 'react';
import { parseMDX, createKnowledgeBaseEntry } from './utils/mdxUtils';
import { Container, UploadButton, DropzoneArea, PreviewContainer } from './styles';

interface KnowledgeBaseEntry {
    title: string;
    tags: string[];
    category: string;
    content: string;
    updatedAt: string;
}

const App: React.FC = () => {
    const [mdxFiles, setMdxFiles] = useState<File[]>([]);
    const [jsonEntries, setJsonEntries] = useState<KnowledgeBaseEntry[]>([]);
    const [combinedJson, setCombinedJson] = useState<KnowledgeBaseEntry | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setMdxFiles([...mdxFiles, ...acceptedFiles]);
    }, [mdxFiles]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.mdx' });

    const handlePreview = async () => {
        const entries: KnowledgeBaseEntry[] = [];

        for (const file of mdxFiles) {
            const content = await file.text();
            const parsed = await parseMDX(content);
            const entry = createKnowledgeBaseEntry(parsed.metadata, parsed.content);
            entries.push(entry);
        }

        setJsonEntries(entries);
    };

    const handleCombine = () => {
        const combined = jsonEntries.reduce(
            (acc, curr) => ({
                ...acc,
                title: acc.title + ' & ' + curr.title,
                tags: [...new Set([...acc.tags, ...curr.tags])],
                category: acc.category + ' & ' + curr.category,
                content: acc.content + '\n' + curr.content,
                updatedAt: new Date().toISOString(),
            }),
            { title: '', tags: [], category: '', content: '', updatedAt: '' }
        );

        setCombinedJson(combined);
    };

    const handleSave = () => {
        const blob = new Blob([JSON.stringify(combinedJson || jsonEntries, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'knowledge_base.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Container>
            <h1>MDX to JSON Converter</h1>
            <DropzoneArea {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag & drop some .mdx files here, or click to select files</p>
            </DropzoneArea>
            <UploadButton onClick={handlePreview}>Preview JSON</UploadButton>
            <UploadButton onClick={handleCombine} disabled={jsonEntries.length < 2}>
                Combine Files
            </UploadButton>
            <UploadButton onClick={handleSave} disabled={jsonEntries.length === 0 && !combinedJson}>
                Save JSON
            </UploadButton>

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