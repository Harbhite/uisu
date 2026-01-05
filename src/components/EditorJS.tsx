import React, { useEffect, useRef } from 'react';
import EditorJS, { OutputData, ToolConstructable, ToolSettings } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
// @ts-expect-error - No types available
import Code from '@editorjs/code';
// @ts-expect-error - No types available
import InlineCode from '@editorjs/inline-code';
// @ts-expect-error - No types available
import Marker from '@editorjs/marker';
// @ts-expect-error - No types available
import Underline from '@editorjs/underline';
// @ts-expect-error - No types available
import Delimiter from '@editorjs/delimiter';
// @ts-expect-error - No types available
import Table from '@editorjs/table';
// @ts-expect-error - No types available
import Checklist from '@editorjs/checklist';
// @ts-expect-error - No types available
import Warning from '@editorjs/warning';
// @ts-expect-error - No types available
import LinkTool from '@editorjs/link';
// @ts-expect-error - No types available
import Embed from '@editorjs/embed';
// @ts-expect-error - No types available
import Raw from '@editorjs/raw';

type PieceType = 'Article' | 'Blog' | 'Report' | 'Essay' | 'Poetry' | 'Opinion' | 'Interview' | 'Fiction';

type EditorTools = { [toolName: string]: ToolConstructable | ToolSettings };

interface EditorJSComponentProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  readOnly?: boolean;
  placeholder?: string;
  pieceType?: PieceType;
}

// Base tools available for all types
const getBaseTools = (): EditorTools => ({
  header: {
    class: Header as unknown as ToolConstructable,
    config: {
      levels: [2, 3, 4],
      defaultLevel: 2
    },
    inlineToolbar: true
  },
  paragraph: {
    class: Paragraph as unknown as ToolConstructable,
    inlineToolbar: true
  },
  list: {
    class: List as unknown as ToolConstructable,
    inlineToolbar: true,
    config: {
      defaultStyle: 'unordered'
    }
  },
  quote: {
    class: Quote as unknown as ToolConstructable,
    inlineToolbar: true,
    config: {
      quotePlaceholder: 'Enter a quote',
      captionPlaceholder: 'Quote author'
    }
  },
  delimiter: {
    class: Delimiter as unknown as ToolConstructable
  },
  marker: {
    class: Marker as unknown as ToolConstructable,
    shortcut: 'CMD+SHIFT+M'
  },
  inlineCode: {
    class: InlineCode as unknown as ToolConstructable,
    shortcut: 'CMD+SHIFT+C'
  },
  underline: {
    class: Underline as unknown as ToolConstructable
  }
});

// Additional tools for technical/report writing
const getTechnicalTools = (): EditorTools => ({
  code: {
    class: Code as unknown as ToolConstructable,
    config: {
      placeholder: 'Enter code here...'
    }
  },
  table: {
    class: Table as unknown as ToolConstructable,
    inlineToolbar: true,
    config: {
      rows: 3,
      cols: 3
    }
  },
  checklist: {
    class: Checklist as unknown as ToolConstructable,
    inlineToolbar: true
  },
  warning: {
    class: Warning as unknown as ToolConstructable,
    inlineToolbar: true,
    config: {
      titlePlaceholder: 'Title',
      messagePlaceholder: 'Message'
    }
  },
  raw: {
    class: Raw as unknown as ToolConstructable,
    config: {
      placeholder: 'Enter raw HTML...'
    }
  }
});

// Media/embed tools
const getMediaTools = (): EditorTools => ({
  embed: {
    class: Embed as unknown as ToolConstructable,
    config: {
      services: {
        youtube: true,
        vimeo: true,
        twitter: true,
        instagram: true,
        codepen: true,
        github: true
      }
    }
  },
  linkTool: {
    class: LinkTool as unknown as ToolConstructable,
    config: {
      endpoint: '' // No server-side link preview
    }
  }
});

// Get tools based on piece type
const getToolsForType = (pieceType?: PieceType): EditorTools => {
  const base = getBaseTools();
  const technical = getTechnicalTools();
  const media = getMediaTools();

  switch (pieceType) {
    case 'Report':
      // Reports get all tools for comprehensive documentation
      return { ...base, ...technical, ...media };
    
    case 'Blog':
    case 'Article':
      // Blogs and articles get most tools for rich content
      return { 
        ...base, 
        ...media,
        table: technical.table,
        checklist: technical.checklist,
        code: technical.code
      };
    
    case 'Essay':
    case 'Opinion':
      // Essays and opinions focus on prose - minimal technical tools
      return { 
        ...base,
        embed: media.embed
      };
    
    case 'Poetry':
    case 'Fiction':
      // Creative writing needs clean, distraction-free tools
      return base;
    
    case 'Interview':
      // Interviews need quotes, basic formatting, and embeds
      return { 
        ...base,
        embed: media.embed
      };
    
    default:
      // Default - all tools
      return { ...base, ...technical, ...media };
  }
};

const EditorJSComponent: React.FC<EditorJSComponentProps> = ({
  data,
  onChange,
  readOnly = false,
  placeholder = 'Start writing your piece...',
  pieceType
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

    const tools = getToolsForType(pieceType);

    const editor = new EditorJS({
      holder: holderRef.current,
      readOnly,
      placeholder,
      data: data || undefined,
      minHeight: 200,
      tools,
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
  }, [readOnly, placeholder, pieceType]);

  return (
    <div 
      ref={holderRef} 
      className="prose prose-slate max-w-none min-h-[400px] bg-card border border-border p-6 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all [&_.ce-block__content]:max-w-none [&_.ce-toolbar__content]:max-w-none [&_.codex-editor__redactor]:pb-6"
    />
  );
};

export default EditorJSComponent;
