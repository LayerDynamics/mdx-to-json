import { useState, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import rehypeStringify from 'rehype-stringify'; // Add this for stringifying
import rehypeParse from 'rehype-parse'; // For parsing HTML
import matter from 'gray-matter';
import cloneDeep from 'lodash.clonedeep';

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

const transformContent = (node: any) => {
    if (!node) {
        console.warn("Encountered undefined or null node during transformation.");
        return;
    }

    if (node.type === 'text' && typeof node.value === 'string') {
        node.value = node.value
            .replace(/\\/g, '')
            .replace(/[^\x20-\x7E]/g, '');
    }
};

export const useParseMDX = () => {
    const [parsedContent, setParsedContent] = useState<{ content: string; metadata: any } | null>(null);

    const parseMDX = useCallback(
        (content: string, transformFunction: (node: any) => void = transformContent, applyTransform: boolean = true) => {
            try {
                console.log("Parsing content:", content);
                const { data: metadata, content: mdxContent } = matter(content);
                console.log("Extracted metadata:", metadata);

                const processor = unified()
                    .use(remarkParse)
                    .use(remarkMdx)
                    .use(rehypeStringify); // Stringifies the content back to HTML or text

                if (applyTransform) {
                    processor.use(customTransformer(transformFunction));
                }

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
