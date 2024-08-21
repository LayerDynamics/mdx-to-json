// src/components/FileList.tsx
import React from 'react';

interface FileListProps {
    files: File[];
    onDelete: (index: number) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onDelete }) => {
    return (
        <div>
            <h3>Uploaded Files</h3>
            <ul>
                {files.map((file, index) => (
                    <li key={index}>
                        {file.name}
                        <button onClick={() => onDelete(index)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileList;
