import { useState, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
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
const safeVisit = (tree: any, callback: (node: any, index: number | null, parent: any | null) => void) => {
    if (!tree || typeof tree !== 'object') {
        console.warn('Invalid tree structure:', tree);
        return;
    }

    const visitNode = (node: any, index: number | null, parent: any | null) => {
        if (!node || typeof node !== 'object') {
            console.warn('Encountered invalid node:', node);
            return;
        }

        try {
            callback(node, index, parent);
        } catch (error) {
            console.error("Error during node visit:", error);
            console.warn("Problematic node:", node);
        }

        if (Array.isArray(node.children)) {
            node.children.forEach((child: any, childIndex: number) => {
                visitNode(child, childIndex, node);
            });
        }
    };

    visitNode(tree, null, null);
};

// HTML PreProcessor: Simplify and sanitize HTML before processing
const htmlPreProcessor = (content: string): string => {
    try {
        let processedContent = content.replace(/<([a-zA-Z]+)(?:\s[^>]*)?>/g, (match, tag) => {
            return `<${tag}>${match.endsWith('/>') ? '' : `</${tag}>`}`;
        });

        processedContent = processedContent.replace(/<video[^>]*>/g, '<div class="video-container">');
        processedContent = processedContent.replace(/<\/video>/g, '</div>');
        processedContent = processedContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '<!-- Script removed -->');
        processedContent = processedContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '<!-- Style removed -->');

        return processedContent;
    } catch (error) {
        console.error("Error in htmlPreProcessor:", error);
        return content;
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

// Router: Choose parsing method based on syntax check
export const parseContentBasedOnSyntax = (content: string, parseMDX: (content: string) => void) => {
    const cleanedContent = htmlPreProcessor(content);
    if (checkMDXSyntax(cleanedContent)) {
        console.log("Syntax is valid. Proceeding with standard MDX parsing.");
        parseMDX(cleanedContent);
    } else {
        console.warn("Syntax issues detected. Switching to fallback parsing approach.");
        fallbackParse(cleanedContent);
    }
};

// Node Mapper: Maps and transforms nodes for easier processing
const mapNodes = (node: any): any => {
    if (!node) {
        console.warn("mapNodes received an undefined node");
        return;
    }

    try {
        if (isNodeType(node, 'element')) {
            if (node.tagName === 'script') {
                node.tagName = 'div';
                node.children = [{ type: 'text', value: '[Script removed]' }];
            }

            if (node.tagName === 'img' && node.properties) {
                node.properties.loading = 'lazy';
            }

            // Add additional tag transformations as necessary
        }

    } catch (error) {
        console.error("Error in mapNodes:", error);
        console.warn("Problematic node:", node);
    }

    return node;
};

// Function to handle HTML nodes specifically
const htmlNodeHandler = (tree: any) => {
    if (!tree) {
        console.warn("Invalid tree structure: undefined in htmlNodeHandler");
        return;
    }

    safeVisit(tree, (node, index, parent) => {
        if (isNodeType(node, 'html')) {
            try {
                console.log(`Processing HTML node: ${node.value}`);

                if (node.value.includes('<video')) {
                    node.type = 'html';
                    node.value = node.value.replace(/<video/g, '<div class="video-container"');
                }

            } catch (error) {
                console.error("Error handling HTML node:", error);
                console.warn("Problematic HTML node:", node);
            }
        }
    });
};

// Hook to map nodes within the MDX AST
export const useNodeMapper = () => {
    const nodeMapper = (tree: any) => {
        if (!tree) {
            console.warn("Invalid tree structure: undefined in nodeMapper");
            return;
        }

        safeVisit(tree, (node) => {
            mapNodes(node);
        });

        htmlNodeHandler(tree);
    };

    return { nodeMapper };
};

// Remove unsupported nodes like 'mdxjsEsm'
const removeUnsupportedNodes = () => {
    return (tree: any) => {
        if (!tree) {
            console.warn("Invalid tree structure: undefined in removeUnsupportedNodes");
            return;
        }

        safeVisit(tree, (node, index, parent) => {
            if (
                safeHasProperty(node, 'type') &&
                (isNodeType(node, 'mdxjsEsm') || isNodeType(node, 'mdxJsxFlowElement'))
            ) {
                if (parent && hasChildren(parent)) {
                    parent.children[index] = {
                        type: 'html',
                        value: `<!-- Unsupported node type: ${node.type} -->`
                    };
                }
            }
        });
    };
};

// Handle custom imports and components
const handleCustomImports = () => {
    return (tree: any) => {
        if (!tree) {
            console.warn("Invalid tree structure: undefined in handleCustomImports");
            return;
        }

        safeVisit(tree, (node) => {
            if (isNodeType(node, 'import') || isNodeType(node, 'mdxjsEsm')) {
                node.type = 'html';
                node.value = `<!-- Import: ${node.value} -->`;
            }
            if (isNodeType(node, 'mdxJsxFlowElement') || isNodeType(node, 'mdxJsxTextElement')) {
                node.type = 'html';
                node.value = `<!-- Custom component: ${node.name} -->`;
            }
            if (isNodeType(node, 'mdxFlowExpression') || isNodeType(node, 'mdxTextExpression')) {
                node.type = 'html';
                node.value = `<!-- JSX Expression: ${node.value} -->`;
            }
        });
    };
};

// Handle special comment syntax
const handleSpecialComments = () => {
    return (tree: any) => {
        if (!tree) {
            console.warn("Invalid tree structure: undefined in handleSpecialComments");
            return;
        }

        safeVisit(tree, (node) => {
            if (isNodeType(node, 'html') && typeof node.value === 'string') {
                node.value = node.value.replace(/{\/\*\s*(.*?)\s*\*\/}/g, '<!-- $1 -->');
            }
        });
    };
};

// Hook to parse MDX content with enhanced error handling
export const useParseMDX = () => {
    const [parsedContent, setParsedContent] = useState<{ content: string; metadata: any } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const { nodeMapper } = useNodeMapper();

    const parseMDX = useCallback((content: string) => {
        setIsLoading(true);
        setError(null);

        try {
            console.log("Parsing content:", content);

            const cleanedContent = htmlPreProcessor(content);
            console.log("Content after HTML preprocessing:", cleanedContent);

            const { data: metadata, content: mdxContent } = matter(cleanedContent);
            console.log("Extracted metadata:", metadata);
            console.log("MDX content after frontmatter extraction:", mdxContent);

            const processor = unified()
                .use(remarkParse)
                .use(remarkMdx)
                .use(remarkRehype)
                .use(handleCustomImports)
                .use(handleSpecialComments)
                .use(removeUnsupportedNodes)
                .use(rehypeSanitize);

            const tree = processor.parse(mdxContent);
            console.log("Tree parsed:", tree);

            if (tree) {
                nodeMapper(tree);
            } else {
                throw new Error("Failed to generate a valid tree structure from the MDX content.");
            }

            const file = processor.stringify(tree);
            console.log("File processed:", file);

            const contentString = String(file);
            console.log("Processed content string:", contentString);

            if (contentString && metadata) {
                setParsedContent({ content: contentString, metadata });
            } else {
                throw new Error("Parsed content is null or incomplete.");
            }
        } catch (error) {
            console.error("Error parsing MDX content:", error);
            setError(error instanceof Error ? error : new Error('Unknown error occurred'));
        } finally {
            setIsLoading(false);
        }
    }, [nodeMapper]);

    return {
        parsedContent,
        isLoading,
        error,
        parseMDX,
    };
};
