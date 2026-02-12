import { useRef, useCallback } from "react";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link, Heading1, Heading2,
  Quote, Minus, Undo, Redo, Type
} from "lucide-react";

interface NewsletterRichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      active
        ? "bg-nobel-gold/20 text-nobel-gold"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

const Separator = () => (
  <div className="w-px h-5 bg-border mx-1" />
);

export const NewsletterRichEditor = ({ value, onChange }: NewsletterRichEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    // Trigger onChange after command
    setTimeout(() => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }, 0);
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      exec("createLink", url);
    }
  }, [exec]);

  const isActive = (command: string) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  return (
    <div className="border border-border focus-within:border-nobel-gold transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-muted/40 border-b border-border">
        <ToolbarButton onClick={() => exec("undo")} title="Undo">
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("redo")} title="Redo">
          <Redo size={14} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => exec("formatBlock", "<h1>")} title="Heading 1">
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "<h2>")} title="Heading 2">
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "<p>")} title="Paragraph">
          <Type size={14} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => exec("bold")} active={isActive("bold")} title="Bold">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} active={isActive("italic")} title="Italic">
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} active={isActive("underline")} title="Underline">
          <Underline size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("strikeThrough")} active={isActive("strikeThrough")} title="Strikethrough">
          <Strikethrough size={14} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => exec("justifyLeft")} title="Align Left">
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyCenter")} title="Align Center">
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyRight")} title="Align Right">
          <AlignRight size={14} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Bullet List">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} title="Numbered List">
          <ListOrdered size={14} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => exec("formatBlock", "<blockquote>")} title="Quote">
          <Quote size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertHorizontalRule")} title="Divider">
          <Minus size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={insertLink} title="Insert Link">
          <Link size={14} />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        suppressContentEditableWarning
        className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 font-serif text-foreground focus:outline-none prose prose-sm max-w-none
          [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-3
          [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3
          [&_p]:mb-2 [&_p]:leading-relaxed
          [&_blockquote]:border-l-4 [&_blockquote]:border-nobel-gold [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
          [&_a]:text-ui-blue [&_a]:underline
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
          [&_li]:mb-1
          [&_hr]:my-4 [&_hr]:border-border"
        data-placeholder="Write your newsletter content here..."
      />

      {/* Placeholder styles */}
      <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #94A3B8;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};
