// /src/hooks/parseMDX.ts
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

// Utility Function: Safe check if a property exists in the node
const safeHasProperty = (node: any, prop: string): boolean => {
    return node && typeof node === 'object' && prop in node;
};

// Safe version of `visit` to handle potential undefined nodes
const safeVisit = (tree: any, callback: (node: any, index: number, parent: any) => void) => {
    visit(tree, (node, index, parent) => {
        if (!node || typeof node !== 'object') {
            console.warn('Encountered invalid node:', node);
            return;
        }
        
        if (parent && !Array.isArray(parent.children)) {
            console.warn('Parent node has no valid children array:', parent);
            return;
        }
        
        callback(node, index, parent);
    });
};

// Updated visit2 function with improved error handling
const visit2 = (node: any) => {
    if (!node) {
        console.warn('Node is undefined in visit2');
        return;
    }

    if (typeof node !== 'object') {
        console.warn('Node is not an object in visit2:', node);
        return;
    }

    if ('children' in node && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
            visit2(child);
        });
    } else if ('children' in node) {
        console.warn('Node has children property but it is not an array:', node);
    } else {
        console.debug('Node does not have children property:', node);
    }
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
export const parseContentBasedOnSyntax = (content: string, parseMDX: (content: string) => void) => {
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
    try {
        const simpleProcessor = unified()
            .use(remarkParse)
            .use(remarkMdx)
            .use(rehypeStringify);

        const file = simpleProcessor.processSync(content);
        console.log("Fallback Parsed content string:", String(file));
    } catch (error) {
        console.error("Error in fallback parsing:", error);
    }
};

// Node Mapper: Maps and transforms nodes for easier processing
const mapNodes = (node: any): any => {
    if (!node) return;

    if (isNodeType(node, 'element')) {
        if (node.tagName === 'script') {
            node.tagName = 'div';
            node.children = [{ type: 'text', value: '[Script removed]' }];
        }

        if (node.tagName === 'img' && node.properties) {
            node.properties.loading = 'lazy';
        }
    }

    return node;
};

// Hook to map nodes within the MDX AST
export const useNodeMapper = () => {
    const nodeMapper = (tree: any) => {
        safeVisit(tree, (node) => {
            mapNodes(node);
            visit2(node);
        });
    };

    return { nodeMapper };
};

// Remove unsupported nodes like 'mdxjsEsm'
const removeUnsupportedNodes = () => {
    return (tree: any) => {
        safeVisit(tree, (node, index, parent) => {
            if (
                safeHasProperty(node, 'type') &&
                isNodeType(node, 'mdxjsEsm') &&
                parent &&
                hasChildren(parent)
            ) {
                parent.children.splice(index, 1);
            }
        });
    };
};

// Hook to parse MDX content with enhanced error handling
export const useParseMDX = () => {
    const { nodeMapper } = useNodeMapper();
    const [parsedContent, setParsedContent] = useState<{ content: string; metadata: any } | null>(null);

    const parseMDX = useCallback(
        (content: string) => {
            try {
                console.log("Parsing content:", content);

                const { data: metadata, content: mdxContent } = matter(content);
                console.log("Extracted metadata:", metadata);

                const processor = unified()
                    .use(remarkParse)
                    .use(remarkMdx)
                    .use(removeUnsupportedNodes())
                    .use(rehypeRaw)
                    .use(rehypeSanitize)
                    .use(nodeMapper)
                    .use(rehypeStringify);

                const file = processor.processSync(mdxContent);
                const contentString = String(file);
                console.log("Processed content string:", contentString);

                if (contentString && metadata) {
                    setParsedContent({ content: contentString, metadata });
                } else {
                    console.error("Parsed content is null or incomplete.");
                    setParsedContent(null);
                }
            } catch (error) {
                console.error("Error parsing MDX content:", error.message, error.stack);
                console.error("Content that caused the error:", content);
                setParsedContent(null);
            }
        },
        [nodeMapper]
    );

    return {
        parsedContent,
        parseMDX,
    };
};