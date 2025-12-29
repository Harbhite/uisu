import React, { useEffect, useRef, useCallback } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';

interface EditorJSComponentProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const EditorJSComponent: React.FC<EditorJSComponentProps> = ({
  data,
  onChange,
  readOnly = false,
  placeholder = 'Start writing your piece...'
}) => {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const isReady = useRef(false);

  const initEditor = useCallback(async () => {
    if (!holderRef.current || isReady.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      readOnly,
      placeholder,
      data: data || undefined,
      tools: {
        header: {
          class: Header,
          config: {
            levels: [2, 3, 4],
            defaultLevel: 2
          }
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true
        },
        list: {
          class: List,
          inlineToolbar: true
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote author'
          }
        }
      },
      onChange: async () => {
        if (onChange && editorRef.current) {
          const outputData = await editorRef.current.save();
          onChange(outputData);
        }
      },
      onReady: () => {
        isReady.current = true;
      }
    });

    editorRef.current = editor;
  }, [data, onChange, readOnly, placeholder]);

  useEffect(() => {
    initEditor();

    return () => {
      if (editorRef.current && isReady.current) {
        editorRef.current.destroy();
        editorRef.current = null;
        isReady.current = false;
      }
    };
  }, [initEditor]);

  return (
    <div 
      ref={holderRef} 
      className="prose prose-slate max-w-none min-h-[300px] bg-white border border-slate-200 rounded-lg p-4 focus-within:border-ui-blue focus-within:ring-1 focus-within:ring-ui-blue transition-colors"
    />
  );
};

export default EditorJSComponent;
