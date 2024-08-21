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
            // Example: You can add more formatting rules here if needed
            const formattedEntry = {
                ...entry,
                title: entry.title.trim(), // Trim whitespace in title
                content: entry.content.trim(), // Trim whitespace in content
                // You can add more formatting operations here
            };

            // Stringify the entry to JSON with 2-space indentation
            return JSON.parse(JSON.stringify(formattedEntry, null, 2));
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
