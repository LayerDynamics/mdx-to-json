import { useState, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { Node } from 'unist';

// A generalized transformer function
const customTransformer = (transformFunction: (node: Node) => Node) => (tree: Node) => {
    const visit = (node: Node) => {
        // Apply the transformation function to the node
        transformFunction(node);

        // Recursively visit all children nodes
        if (node.children) {
            node.children.forEach(visit);
        }
    };

    visit(tree);
    return tree;
};

// Example transformation function: Remove backslashes and unexpected characters
const transformContent = (node: Node) => {
    if (node.type === 'text' && typeof node.value === 'string') {
        node.value = node.value
            .replace(/\\/g, '') // Remove all backslashes
            .replace(/[^\x20-\x7E]/g, ''); // Remove non-ASCII characters (if needed)
    }
};

// Hook to parse MDX content
export const useParseMDX = () => {
    const [parsedContent, setParsedContent] = useState<string | null>(null);

    const parseMDX = useCallback((content: string, transformFunction: (node: Node) => Node = transformContent) => {
        const processor = unified()
            .use(remarkParse) // Parse Markdown to AST
            .use(customTransformer(transformFunction)) // Apply the custom transformation
            .use(remarkStringify); // Convert AST back to Markdown

        const file = processor.processSync(content);
        setParsedContent(file.toString());
    }, []);

    return {
        parsedContent,
        parseMDX,
    };
};
