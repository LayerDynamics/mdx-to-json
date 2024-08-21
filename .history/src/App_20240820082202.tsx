import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseMDX, createKnowledgeBaseEntry } from './utils/mdxUtils';
import { Container, Button, DropzoneArea, PreviewContainer } from './styles';
import FileList from './components/FileList';
import FormatButton from './components/FormatButton';

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

        console.log('Preview JSON entries:', entries);  // Debugging line

        setJsonEntries(entries);
    };

    const handleCombine = () => {
        console.log('JSON entries before combine:', jsonEntries);  // Debugging line

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

        console.log('Combined JSON:', combined);  // Debugging line

        setCombinedJson(combined);
    };

    const handleSave = () => {
        console.log('Saving JSON:', combinedJson || jsonEntries);  // Debugging line

        const blob = new Blob([JSON.stringify(combinedJson || jsonEntries, null, 2)], { type: 'application/json' });
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

    // For debugging, you can set some initial dummy data to test
    // useEffect(() => {
    //     setJsonEntries([{
    //         title: 'Test',
    //         tags: ['tag1'],
    //         category: 'Category',
    //         content: 'Test content',
    //         updatedAt: '2024-08-20T12:00:00Z'
    //     }]);
    // }, []);

    return (
        <Container>
            <h1>MDX to JSON Converter</h1>
            <DropzoneArea {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag & drop some .mdx files here, or click to select files</p>
            </DropzoneArea>

            <FileList files={mdxFiles} onDelete={handleDeleteFile} />

            <Button onClick={handlePreview} disabled={mdxFiles.length === 0}>Preview JSON</Button>
            <Button onClick={handleCombine} disabled={jsonEntries.length < 2}>Combine Files</Button>
            <FormatButton jsonEntries={jsonEntries} onFormat={handleFormat} />
            <Button onClick={handleSave} disabled={jsonEntries.length === 0 && !combinedJson}>Save JSON</Button>

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
