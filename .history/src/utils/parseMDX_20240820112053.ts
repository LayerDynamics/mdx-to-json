import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { Node } from 'unist';

// Example function to modify AST nodes
const customTransformer = () => (tree: Node) => {
    // Example: Traverse the tree and modify nodes as needed
    const visit = (node: Node) => {
        if (node.type === 'text') {
            // Modify text nodes, e.g., removing slashes
            node.value = (node.value as string).replace(/\\/g, '');
        }
        if (node.children) {
            node.children.forEach(visit);
        }
    };
    visit(tree);
    return tree;
};

export const parseMDX = (content: string): string => {
    const processor = unified()
        .use(remarkParse)  // Parse Markdown to AST
        .use(customTransformer)  // Custom transformer
        .use(remarkStringify);  // Convert AST back to Markdown

    const file = processor.processSync(content);
    return file.toString();
};

// Usage example
const mdxContent = `# Example Title

Some \\backslash \\text that needs formatting.

Another paragraph.`;

console.log(parseMDX(mdxContent));
