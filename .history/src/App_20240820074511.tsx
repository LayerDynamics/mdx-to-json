// src/App.tsx
import React, { useState } from 'react';
import { parseMDX, createKnowledgeBaseEntry } from './mdxUtils';

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

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setMdxFiles(Array.from(files));
        }
    };

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
        <div>
            <h1>MDX to JSON Converter</h1>
            <input type="file" accept=".mdx" multiple onChange={handleFileUpload} />
            <button onClick={handlePreview}>Preview JSON</button>
            <button onClick={handleCombine} disabled={jsonEntries.length < 2}>
                Combine Files
            </button>
            <button onClick={handleSave} disabled={jsonEntries.length === 0 && !combinedJson}>
                Save JSON
            </button>

            <pre>{combinedJson ? JSON.stringify(combinedJson, null, 2) : jsonEntries.map(entry => JSON.stringify(entry, null, 2)).join('\n\n')}</pre>
        </div>
    );
};

export default App;
