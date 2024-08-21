// src/styles.ts
import styled from 'styled-components';

export const Container = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
    border: 2px dashed #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
    color: #000543;
    position: relative;
    z-index: 1;
`;

export const Button = styled.button`
    padding: 10px 20px;
    margin-top: 20px;
    margin-right: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 10;
    position: relative;

    &:hover {
        background-color: #0056b3;
    }

    &:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
`;

export const DropzoneArea = styled.div`
    padding: 20px;
    border: 2px dashed #007bff;
    border-radius: 10px;
    background-color: #e9ecef;
    margin-bottom: 20px;
    cursor: pointer;
    position: relative;
    z-index: 2;

    &:hover {
        background-color: #dee2e6;
    }
`;


export const PreviewContainer = styled.div`
    max-width: 100%;
    overflow-x: auto; /* Allow horizontal scroll if necessary */
    word-wrap: break-word; /* Break long words and ensure they stay within the container */
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    pre {
        white-space: pre-wrap; /* Ensures that the content respects the container width */
        word-break: break-word; /* Forces long words to break and wrap within the container */
    }

    h3 {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
        color: #333;
    }

    hr {
        border-top: 1px solid #ccc;
        margin: 1rem 0;
    }
`;
