// /src/hooks/parseMDX.ts
import { useState, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import cloneDeep from 'lodash.clonedeep'; // For deep cloning the AST

// A generalized transformer function
const customTransformer = (transformFunction: (node: any) => void) => (tree: any) => {
    const visitNode = (node: any) => {
        // Check if node exists and is an object before proceeding
        if (node && typeof node === 'object') {
            // Apply the transformation function to the node
            transformFunction(node);

            // Recursively visit all children nodes, but first ensure they exist
            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(visitNode);
            }
        } else {
            console.warn("Skipped processing a node due to undefined or unexpected structure:", node);
        }
    };

    visitNode(tree);
    return tree;
};

// Example transformation function: Remove backslashes and unexpected characters
const transformContent = (node: any) => {
    if (!node) {
        console.warn("Encountered undefined or null node during transformation.");
        return;
    }

    if (node.type === 'text' && typeof node.value === 'string') {
        node.value = node.value
            .replace(/\\/g, '') // Remove all backslashes
            .replace(/[^\x20-\x7E]/g, ''); // Remove non-ASCII characters (if needed)
    }
};

// Hook to parse MDX content
export const useParseMDX = () => {
    const [parsedContent, setParsedContent] = useState<{ content: string; metadata: any } | null>(null);

    const parseMDX = useCallback(
        (content: string, transformFunction: (node: any) => void = transformContent, applyTransform: boolean = true) => {
            try {
                console.log("Parsing content:", content); // Debugging log
                const processor = unified()
                    .use(remarkParse);

                if (applyTransform) {
                    processor.use(customTransformer(transformFunction));
                }

                const file = processor.processSync(content);
                const contentString = file.toString();
                console.log("Processed content string:", contentString); // Debugging log

                const metadata = extractMetadata(contentString);
                console.log("Extracted metadata:", metadata); // Debugging log

                setParsedContent({ content: contentString, metadata });
            } catch (error) {
                console.error("Error parsing MDX content:", error.message, error.stack);
                setParsedContent(null);
            }
        },
        []
    );

    // Helper function to extract frontmatter metadata
    const extractMetadata = (content: string) => {
        // Simple regex to extract frontmatter metadata
        const frontmatterRegex = /---\n([\s\S]*?)\n---/;
        const match = content.match(frontmatterRegex);
        if (match && match[1]) {
            try {
                return JSON.parse(match[1]);
            } catch (error) {
                console.warn("Failed to parse frontmatter metadata:", error);
                return {};
            }
        }
        return {};
    };

    return {
        parsedContent,
        parseMDX,
    };
};
