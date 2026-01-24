import React, { useEffect, useRef } from 'react';
import EditorJS, { OutputData, ToolConstructable, ToolSettings } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import Underline from '@editorjs/underline';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import Checklist from '@editorjs/checklist';
import Warning from '@editorjs/warning';
import LinkTool from '@editorjs/link';
import Embed from '@editorjs/embed';
import Raw from '@editorjs/raw';
import { supabase } from '@/integrations/supabase/client';

type PieceType = 'Article' | 'Blog' | 'Report' | 'Essay' | 'Poetry' | 'Opinion' | 'Interview' | 'Fiction';

type EditorTools = { [toolName: string]: ToolConstructable | ToolSettings };

interface EditorJSComponentProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  readOnly?: boolean;
  placeholder?: string;
  pieceType?: PieceType;
}

// Custom Image Tool class for Supabase storage
class SimpleImageTool {
  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    };
  }

  private wrapper: HTMLDivElement | null = null;
  private data: { url?: string; caption?: string };
  private config: { onUpload?: (file: File) => Promise<string> };

  constructor({ data, config }: { data?: { url?: string; caption?: string }; config?: { onUpload?: (file: File) => Promise<string> } }) {
    this.data = data || {};
    this.config = config || {};
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('simple-image');

    if (this.data.url) {
      this._createImage(this.data.url, this.data.caption);
    } else {
      this._createUploadArea();
    }

    return this.wrapper;
  }

  private _createUploadArea() {
    if (!this.wrapper) return;

    const uploadArea = document.createElement('div');
    uploadArea.style.cssText = 'border: 2px dashed hsl(var(--border)); border-radius: 8px; padding: 40px; text-align: center; cursor: pointer; transition: border-color 0.2s;';
    uploadArea.innerHTML = `
      <div style="color: hsl(var(--muted-foreground)); font-size: 14px;">
        <svg style="width: 32px; height: 32px; margin: 0 auto 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21,15 16,10 5,21"></polyline>
        </svg>
        <div>Click or drag to upload image</div>
      </div>
    `;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'hsl(var(--accent))';
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = 'hsl(var(--border))';
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'hsl(var(--border))';
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) {
        this._uploadFile(file);
      }
    });

    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this._uploadFile(file);
      }
    });

    this.wrapper.appendChild(uploadArea);
    this.wrapper.appendChild(fileInput);
  }

  private async _uploadFile(file: File) {
    if (!this.wrapper) return;

    // Show loading state
    this.wrapper.innerHTML = `
      <div style="border: 2px solid hsl(var(--border)); border-radius: 8px; padding: 40px; text-align: center;">
        <div style="color: hsl(var(--muted-foreground)); font-size: 14px;">
          <svg style="width: 24px; height: 24px; margin: 0 auto 8px; animation: spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"></path>
          </svg>
          <div>Uploading...</div>
        </div>
      </div>
      <style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
    `;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ink-images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('club-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('club-images')
        .getPublicUrl(fileName);

      this.data.url = publicUrl;
      this._createImage(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      this.wrapper.innerHTML = `
        <div style="border: 2px solid hsl(var(--destructive)); border-radius: 8px; padding: 20px; text-align: center; color: hsl(var(--destructive));">
          Upload failed. Click to try again.
        </div>
      `;
      this.wrapper.addEventListener('click', () => {
        this._createUploadArea();
      }, { once: true });
    }
  }

  private _createImage(url: string, caption?: string) {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = '';
    
    const figure = document.createElement('figure');
    figure.style.cssText = 'margin: 0; position: relative;';

    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = 'max-width: 100%; border-radius: 8px; display: block;';
    
    const captionInput = document.createElement('input');
    captionInput.type = 'text';
    captionInput.placeholder = 'Add a caption...';
    captionInput.value = caption || '';
    captionInput.style.cssText = 'width: 100%; border: none; text-align: center; font-size: 13px; color: hsl(var(--muted-foreground)); padding: 8px 0; background: transparent; outline: none;';
    captionInput.addEventListener('input', (e) => {
      this.data.caption = (e.target as HTMLInputElement).value;
    });

    figure.appendChild(img);
    figure.appendChild(captionInput);
    this.wrapper.appendChild(figure);
  }

  save() {
    return {
      url: this.data.url || '',
      caption: this.data.caption || ''
    };
  }

  validate(savedData: { url?: string }) {
    return !!savedData.url;
  }

  static get pasteConfig() {
    return {
      tags: ['IMG'],
      patterns: {
        image: /https?:\/\/\S+\.(gif|jpe?g|tiff|png|webp)$/i
      }
    };
  }
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

// Media/embed tools (now includes image)
const getMediaTools = (): EditorTools => ({
  image: {
    class: SimpleImageTool as unknown as ToolConstructable
  },
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
      // Essays and opinions focus on prose - minimal technical tools but keep images
      return { 
        ...base,
        image: media.image,
        embed: media.embed
      };
    
    case 'Poetry':
    case 'Fiction':
      // Creative writing - clean tools with optional images
      return { ...base, image: media.image };
    
    case 'Interview':
      // Interviews need quotes, basic formatting, embeds, and images
      return { 
        ...base,
        image: media.image,
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
      className="prose prose-slate max-w-none min-h-[400px] bg-card border border-border rounded-lg p-6 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all [&_.ce-block__content]:max-w-none [&_.ce-toolbar__content]:max-w-none [&_.codex-editor__redactor]:pb-6 [&_.simple-image]:my-4"
    />
  );
};

export default EditorJSComponent;
