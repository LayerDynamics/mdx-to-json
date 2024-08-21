// src/components/FormatButton.tsx
import React from 'react';
import { Button } from '../styles';

interface FormatButtonProps {
    jsonEntries: any;
    onFormat: (formattedEntries: any) => void;
}

const FormatButton: React.FC<FormatButtonProps> = ({ jsonEntries, onFormat }) => {
    const handleFormat = () => {
        const formatted = jsonEntries.map((entry: any) =>
            JSON.parse(JSON.stringify(entry, null, 2))
        );
        onFormat(formatted);
    };

    return (
        <Button onClick={handleFormat} disabled={!jsonEntries.length}>
            Format/Lint JSON
        </Button>
    );
};

export default FormatButton;
