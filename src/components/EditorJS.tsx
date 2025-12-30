import React, { useEffect, useRef } from 'react';
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
  const isInitialized = useRef(false);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref updated without triggering re-init
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!holderRef.current || isInitialized.current) return;

    isInitialized.current = true;

    const editor = new EditorJS({
      holder: holderRef.current,
      readOnly,
      placeholder,
      data: data || undefined,
      minHeight: 200,
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
        if (onChangeRef.current && editorRef.current) {
          try {
            const outputData = await editorRef.current.save();
            onChangeRef.current(outputData);
          } catch (e) {
            console.error('Editor save error:', e);
          }
        }
      }
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
        isInitialized.current = false;
      }
    };
  // Only initialize once - do not include data or onChange in deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, placeholder]);

  return (
    <div 
      ref={holderRef} 
      className="prose prose-slate max-w-none min-h-[400px] bg-white border border-slate-200 rounded-xl p-6 focus-within:border-ui-blue focus-within:ring-2 focus-within:ring-ui-blue/20 transition-all"
    />
  );
};

export default EditorJSComponent;
