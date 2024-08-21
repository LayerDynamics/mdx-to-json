// /src/hooks/parseMDX.t
import { useState, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';

// A generalized transformer function
const customTransformer = (transformFunction: (node: any) => void) => (tree: any) => {
    const visitNode = (node: any) => {
        // Apply the transformation function to the node
        transformFunction(node);

        // Recursively visit all children nodes, but first ensure they exist
        if (node.children && Array.isArray(node.children)) {
            node.children.forEach(visitNode);
        }
    };

    visitNode(tree);
    return tree;
};

// Example transformation function: Remove backslashes and unexpected characters
const transformContent = (node: any) => {
    if (node.type === 'text' && typeof node.value === 'string') {
        node.value = node.value
            .replace(/\\/g, '') // Remove all backslashes
            .replace(/[^\x20-\x7E]/g, ''); // Remove non-ASCII characters (if needed)
    }
};

// Hook to parse MDX content
export const useParseMDX = () => {
    const [parsedContent, setParsedContent] = useState<string | null>(null);

    const parseMDX = useCallback((content: string, transformFunction: (node: any) => void = transformContent) => {
        try {
            const processor = unified()
                .use(remarkParse) // Parse Markdown to AST
                .use(customTransformer(transformFunction)) // Apply the custom transformation
                .use(remarkStringify); // Convert AST back to Markdown

            const file = processor.processSync(content);
            setParsedContent(file.toString());
        } catch (error) {
            console.error("Error parsing MDX content:", error);
            setParsedContent(null);
        }
    }, []);

    return {
        parsedContent,
        parseMDX,
    };
};
