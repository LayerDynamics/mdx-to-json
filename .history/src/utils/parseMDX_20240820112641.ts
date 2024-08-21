import { useState, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { Node } from 'unist';
import visit from 'unist-util-visit';

// A generalized transformer function
const customTransformer = (transformFunction: (node: Node) => void) => {
    return (tree: Node) => {
        visit(tree, 'text', (node) => {
            transformFunction(node);
        });
    };
};

// Example transformation function: Remove backslashes and unexpected characters
const transformContent = (node: Node) => {
    if (typeof node.value === 'string') {
        node.value = node.value
            .replace(/\\/g, '') // Remove all backslashes
            .replace(/[^\x20-\x7E]/g, ''); // Remove non-ASCII characters (if needed)
    }
};

// Hook to parse MDX content
export const useParseMDX = () => {
    const [parsedContent, setParsedContent] = useState<string | null>(null);

    const parseMDX = useCallback(
        (content: string, transformFunction: (node: Node) => void = transformContent) => {
            const processor = unified()
                .use(remarkParse) // Parse Markdown to AST
                .use(customTransformer(transformFunction)) // Apply the custom transformation
                .use(remarkStringify); // Convert AST back to Markdown

            const file = processor.processSync(content);
            setParsedContent(file.toString());
        },
        []
    );

    return {
        parsedContent,
        parseMDX,
    };
};
