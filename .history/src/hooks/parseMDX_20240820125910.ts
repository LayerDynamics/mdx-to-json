// /src/hooks/parseMDX.ts
import { useState, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import rehypeStringify from 'rehype-stringify';
import rehypeMdx from 'rehype-mdx';
import matter from 'gray-matter'; // Import gray-matter for parsing frontmatter

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

                // Parse the frontmatter using gray-matter
                const { data: metadata, content: mdxContent } = matter(content);
                console.log("Extracted metadata:", metadata); // Debugging log

                const processor = unified()
                    .use(remarkParse)
                    .use(remarkMdx)
                    .use(rehypeMdx); // Add this line to handle MDX nodes

                if (applyTransform) {
                    processor.use(customTransformer(transformFunction));
                }

                processor.use(rehypeStringify); // Convert the AST to an HTML string

                const file = processor.processSync(mdxContent);
                const contentString = file.toString();
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
