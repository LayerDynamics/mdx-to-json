// src/components/FormatButton.tsx
import React from 'react';
import { Button } from '../styles';

interface FormatButtonProps {
    jsonEntries: any[];
    onFormat: (formattedEntries: any[]) => void;
}

const FormatButton: React.FC<FormatButtonProps> = ({ jsonEntries, onFormat }) => {
    const handleFormat = () => {
        const formatted = jsonEntries.map((entry: any) => {
            // Format and remove any unnecessary characters
            return {
                ...entry,
                title: entry.title.trim(),
                content: entry.content.trim(),
                tags: entry.tags.map((tag: string) => tag.trim()),
                category: entry.category.trim(),
                metadata: {
                    ...entry.metadata,
                    author: entry.metadata.author.trim(),
                }
            };
        });

        onFormat(formatted);
    };

    return (
        <Button onClick={handleFormat} disabled={!jsonEntries.length}>
            Format/Lint JSON
        </Button>
    );
};

export default FormatButton;
