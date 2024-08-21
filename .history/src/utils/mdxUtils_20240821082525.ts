// /src/utils/mdxUtils.ts
// /src/utils/mdxUtils.ts
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { compile } from '@mdx-js/mdx';
import matter from 'gray-matter';
import { Buffer } from 'buffer';

globalThis.Buffer = Buffer;

export async function parseMDX(mdxContent: string) {
    try {
        const { content, data } = matter(mdxContent);

        if (!content || !data) {
            throw new Error("MDX content or frontmatter is missing or invalid.");
        }

        // Compile MDX to JSX
        const jsx = await compile(content);
        return { content: String(jsx), metadata: data };
    } catch (error) {
        console.error("Error during MDX parsing:", error);
        throw error;
    }
}

export function convertToPlainText(jsxContent: string) {
    try {
        return unified()
            .use(rehypeParse, { fragment: true })  // Parse the JSX
            .use(rehypeStringify)  // Convert back to text
            .processSync(jsxContent)
            .toString()
            .replace(/<[^>]*>/g, '')  // Strip any remaining HTML tags
            .replace(/\\n/g, '\n')  // Normalize line breaks
            .trim();  // Remove leading/trailing whitespace
    } catch (error) {
        console.error("Error converting JSX to plain text:", error);
        return '';
    }
}

export function createKnowledgeBaseEntry(metadata: any, content: string) {
    if (!metadata || !content) {
        console.error("Invalid metadata or content for creating a knowledge base entry.");
        return null;
    }
    return {
        title: metadata.title || 'Untitled',
        content: convertToPlainText(content),  // Ensure the content is plain text
        tags: metadata.tags || [],
        category: metadata.category || 'General',
        metadata: {
            created_at: metadata.date || new Date().toISOString(),
            author: metadata.author || 'Unknown',
        },
    };
}
