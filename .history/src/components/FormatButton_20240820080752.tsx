// src/components/FormatButton.tsx
import React from 'react';

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
        <button onClick={handleFormat} disabled={!jsonEntries.length}>
            Format/Lint JSON
        </button>
    );
};

export default FormatButton;
