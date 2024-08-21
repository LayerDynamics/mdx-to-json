import { visit } from 'unist-util-visit';

// Define the node mapping logic
const mapNodes = (node: any): any => {
    if (node.type === 'element') {
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
        visit(tree, (node) => {
            if (node) {
                mapNodes(node);
            }
        });
    };

    return { nodeMapper };
};
