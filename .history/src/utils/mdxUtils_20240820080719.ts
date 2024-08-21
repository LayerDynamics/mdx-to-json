// src/utils/mdxUtils.ts
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { compile } from '@mdx-js/mdx';
import matter from 'gray-matter';
import { Buffer } from 'buffer';

globalThis.Buffer = Buffer;

export async function parseMDX(mdxContent: string) {
    const { content, data } = matter(mdxContent);

    const jsx = await compile(content);
    return { content: String(jsx), metadata: data };
}

export function convertToPlainText(jsxContent: string) {
    return unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeRemark)
        .use(remarkParse)
        .use(remarkStringify)
        .processSync(jsxContent).toString();
}

export function createKnowledgeBaseEntry(metadata: any, content: string) {
    return {
        title: metadata.title || 'Untitled',
        tags: metadata.tags || [],
        category: metadata.category || 'General',
        content: convertToPlainText(content),
        updatedAt: metadata.date || new Date().toISOString(),
    };
}
