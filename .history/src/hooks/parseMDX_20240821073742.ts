// /src/hooks/parseMDX.ts
import { useState, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { visit } from 'unist-util-visit';
import matter from 'gray-matter';

// Utility Function: Check if a node is of a certain type
const isNodeType = (node: any, type: string): boolean => {
    return node && node.type === type;
};

// Utility Function: Ensure the node has children
const hasChildren = (node: any): boolean => {
    return node && Array.isArray(node.children);
};

// Syntax Checker: Check if the MDX content is syntactically correct
const checkMDXSyntax = (content: string): boolean => {
    try {
        const unclosedTag = /<([a-zA-Z]+)(?:\s[^>]*)?>[^<]*$/.test(content);
        const unmatchedBraces = content.split('{').length !== content.split('}').length;
        return !(unclosedTag || unmatchedBraces);
    } catch (error) {
        console.error("Syntax checking failed:", error);
        return false;
    }
};

// Router: Choose parsing method based on syntax check
const parseContentBasedOnSyntax = (content: string, parseMDX: (content: string) => void) => {
    if (checkMDXSyntax(content)) {
        console.log("Syntax is valid. Proceeding with standard MDX parsing.");
        parseMDX(content);
    } else {
        console.warn("Syntax issues detected. Switching to fallback parsing approach.");
        fallbackParse(content);
    }
};

// Fallback Parsing Method: Simple parsing for less complex MDX
const fallbackParse = (content: string) => {
    const simpleProcessor = unified()
        .use(remarkParse)
        .use(remarkMdx)
        .use(rehypeStringify);

    const file = simpleProcessor.processSync(content);
    console.log("Fallback Parsed content string:", String(file));
};

// Remove unsupported nodes like 'mdxjsEsm'
const removeUnsupportedNodes = () => {
    return (tree: any) => {
        visit(tree, (node, index, parent) => {
            if (node && isNodeType(node, 'mdxjsEsm') && parent && hasChildren(parent)) {
                parent.children.splice(index, 1);
            }
        });
    };
};

// Real-world Transformation: Sanitize HTML and handle specific nodes
const realWorldTransformer = () => {
    return (tree: any) => {
        visit(tree, 'element', (node) => {
            if (!node) return; // Check if node is defined

            if (node.tagName === 'script') {
                node.tagName = 'div';
                node.children = [{ type: 'text', value: '[Script removed]' }];
            }

            if (node.tagName === 'img' && node.properties) {
                node.properties.loading = 'lazy';
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
                console.log("Parsing content:", content);

                // Parse the frontmatter using gray-matter
                const { data: metadata, content: mdxContent } = matter(content);
                console.log("Extracted metadata:", metadata);

                const processor = unified()
                    .use(remarkParse)
                    .use(remarkMdx)
                    .use(removeUnsupportedNodes())
                    .use(rehypeRaw)
                    .use(rehypeSanitize)
                    .use(realWorldTransformer())
                    .use(rehypeStringify);

                const file = processor.processSync(mdxContent);
                const contentString = String(file);
                console.log("Processed content string:", contentString);

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

// Example usage of the router in an application context
const handlePreview = (content: string) => {
    const { parseMDX } = useParseMDX();
    parseContentBasedOnSyntax(content, parseMDX);
};
