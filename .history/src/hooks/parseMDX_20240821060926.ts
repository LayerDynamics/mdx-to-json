// /src/
import { useState, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import matter from 'gray-matter';
import cloneDeep from 'lodash.clonedeep';
import { visit } from 'unist-util-visit'; // Import the visit function

// Function to remove unsupported nodes
const removeUnsupportedNodes = () => {
    return (tree: any) => {
        visit(tree, (node, index, parent) => {
            if (node.type === 'mdxjsEsm') {
                parent.children.splice(index, 1);
            }
        });
    };
};

// A generalized transformer function
const customTransformer = (transformFunction: (node: any) => void) => (tree: any) => {
    const visitNode = (node: any) => {
        if (node && typeof node === 'object') {
            transformFunction(node);
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

                // Parse the frontmatter using gray-matter
                const { data: metadata, content: mdxContent } = matter(content);
                console.log("Extracted metadata:", metadata); // Debugging log

                const processor = unified()
                    .use(remarkParse)
                    .use(remarkMdx)
                    .use(removeUnsupportedNodes()) // Add the node removal function here
                    .use(rehypeRaw) // To handle raw HTML
                    .use(rehypeStringify); // Stringifies the content back to HTML or text

                if (applyTransform) {
                    processor.use(customTransformer(transformFunction));
                }

                const file = processor.processSync(mdxContent);
                const contentString = String(file);
                console.log("Processed content string:", contentString); // Debugging log

                setParsedContent({ content: contentString, metadata });
            } catch (error) {
                console.error("Error parsing MDX content:", error.message, error.stack);
                setParsedContent(null);
            }
        },
        []
    );

    return {
        parsedContent,
        parseMDX,
    };
};
