// /src/hooks/parseMDX.ts
import { useState, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize'; // To sanitize HTML
import matter from 'gray-matter';
import { visit } from 'unist-util-visit'; // Import the visit function

// Function to remove unsupported nodes like 'mdxjsEsm'
const removeUnsupportedNodes = () => {
    return (tree: any) => {
        visit(tree, (node, index, parent) => {
            if (node && 'type' in node && node.type === 'mdxjsEsm') {
                if (parent && 'children' in parent) {
                    parent.children.splice(index, 1);
                }
            }
        });
    };
};

// Real-world transformation: Sanitize HTML and transform specific nodes
const realWorldTransformer = () => {
    return (tree: any) => {
        visit(tree, (node, index, parent) => {
     console.log("Current Node: ", node);
     if (node && 'type' in node && node.type === 'mdxjsEsm') {
        console.log("Removing node: ", node);
        if (parent && 'children' in parent) {
            parent.children.splice(index, 1);
        }
     }
    });

    };
};

// Hook to parse MDX content
export const useParseMDX = () => {
    const [parsedContent, setParsedContent] = useState<{ content: string; metadata: any } | null>(null);

    const parseMDX = useCallback(
        (content: string) => {
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
                    .use(rehypeSanitize) // Sanitize HTML
                    .use(realWorldTransformer()) // Apply the real-world transformations
                    .use(rehypeStringify); // Stringifies the content back to HTML or text

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
