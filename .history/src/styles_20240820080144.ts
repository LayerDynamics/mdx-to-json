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
    color: #0
`;

export const UploadButton = styled.button`
    padding: 10px 20px;
    margin-top: 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

export const DropzoneArea = styled.div`
    padding: 20px;
    border: 2px dashed #007bff;
    border-radius: 10px;
    background-color: #e9ecef;
    margin-bottom: 20px;
    cursor: pointer;

    &:hover {
        background-color: #dee2e6;
    }
`;

export const PreviewContainer = styled.div`
    margin-top: 20px;
    text-align: left;
    white-space: pre-wrap;
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #ccc;
`;
