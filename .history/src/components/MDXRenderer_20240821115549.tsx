import React from 'react';

interface MDXRendererProps {
  content: string;
  metadata: any;
}

const MDXRenderer: React.FC<MDXRendererProps> = ({ content, metadata }) => {
  return (
    <div>
      <h1>{metadata.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};
