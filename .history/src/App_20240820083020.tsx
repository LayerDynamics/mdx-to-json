import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseMDX, createKnowledgeBaseEntry } from './utils/mdxUtils';
import { Container, Button, DropzoneArea, PreviewContainer } from './styles';
import FileList from './components/FileList';
import FormatButton from './components/FormatButton';

interface KnowledgeBaseEntry {
    title: string;
    content: string;
    tags: string[];
    category: string;
    metadata: {
        created_at: string;
        author: string;
    };
}

const App: React.FC = () => {
    const [mdxFiles, setMdxFiles] = useState<File[]>([]);
    const [jsonEntries, setJsonEntries] = useState<KnowledgeBaseEntry[]>([]);
    const [combinedJson, setCombinedJson] = useState<KnowledgeBaseEntry[] | null>(null);

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

        console.log('Preview JSON entries:', entries);  // Debugging line

        setJsonEntries(entries);
    };

    const handleCombine = () => {
        console.log('JSON entries before combine:', jsonEntries);  // Debugging line

        const combined = jsonEntries.map(entry => ({
            title: entry.title,
            content: entry.content,
            tags: entry.tags,
            category: entry.category,
            metadata: {
                created_at: entry.metadata.created_at,
                author: entry.metadata.author,
            },
        }));

        console.log('Combined JSON:', combined);  // Debugging line

        setCombinedJson(combined);
    };

    const handleSave = () => {
        console.log('Saving JSON:', combinedJson || jsonEntries);  // Debugging line

        const jsonToSave = combinedJson || jsonEntries;

        const blob = new Blob([JSON.stringify(jsonToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'knowledge_base.json';
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

    return (
        <Container>
            <h1>MDX to JSON Converter</h1>
            <DropzoneArea {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag & drop some .mdx files here, or click to select files</p>
            </DropzoneArea>

            <FileList files={mdxFiles} onDelete={handleDeleteFile} />

            <Button onClick={handlePreview}>Preview JSON</Button>
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
