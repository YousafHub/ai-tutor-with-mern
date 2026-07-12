// app/ai-cover-letter/_components/cover-letter-preview.tsx
"use client";

import MarkdownEditor from '@uiw/react-markdown-editor';

interface CoverLetterPreviewProps {
  content: string;
}

export default function CoverLetterPreview({ content }: CoverLetterPreviewProps) {
  return (
    <div className="py-4">
      <MarkdownEditor 
        value={content} 
        height="700" 
      />
    </div>
  );
}