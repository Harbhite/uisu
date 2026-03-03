import { useRef, useCallback, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link, Heading1, Heading2, Heading3,
  Quote, Minus, Undo, Redo, Type, Image, Code, Palette, RemoveFormatting,
  Subscript, Superscript, IndentIncrease, IndentDecrease, Table, Smile
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

const FONT_SIZES = [
  { label: "Small", value: "1" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "X-Large", value: "6" },
  { label: "Huge", value: "7" },
];

const TEXT_COLORS = [
  "#000000", "#333333", "#666666", "#999999",
  "#003366", "#C5A059", "#1a5276", "#0e6655",
  "#922b21", "#7d3c98", "#d4ac0d", "#e67e22",
  "#2e86c1", "#17a589", "#cb4335", "#8e44ad",
];

const BG_COLORS = [
  "transparent", "#fff9c4", "#f8bbd0", "#c8e6c9",
  "#bbdefb", "#e1bee7", "#ffe0b2", "#d7ccc8",
  "#f5f5f5", "#e0f7fa", "#fce4ec", "#e8f5e9",
];

const EMOJI_LIST = [
  "👋", "🎓", "📚", "🏛️", "⚡", "🔥", "✨", "💡",
  "📢", "🎯", "🏆", "💪", "🙌", "❤️", "👏", "🤝",
  "📌", "⭐", "🎉", "🗳️", "📝", "🔔", "💼", "🌟",
];

export const NewsletterRichEditor = ({ value, onChange }: NewsletterRichEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    setTimeout(() => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }, 0);
  }, [onChange]);

  const updateStats = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateStats();
    }
  }, [onChange, updateStats]);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      exec("createLink", url);
    }
  }, [exec]);

  const insertImage = useCallback(() => {
    const url = prompt("Enter image URL:");
    if (url) {
      exec("insertImage", url);
    }
  }, [exec]);

  const insertTable = useCallback(() => {
    const html = `<table style="width:100%;border-collapse:collapse;margin:12px 0"><tr><td style="border:1px solid #ccc;padding:8px">Cell 1</td><td style="border:1px solid #ccc;padding:8px">Cell 2</td><td style="border:1px solid #ccc;padding:8px">Cell 3</td></tr><tr><td style="border:1px solid #ccc;padding:8px">Cell 4</td><td style="border:1px solid #ccc;padding:8px">Cell 5</td><td style="border:1px solid #ccc;padding:8px">Cell 6</td></tr></table>`;
    exec("insertHTML", html);
  }, [exec]);

  const insertEmoji = useCallback((emoji: string) => {
    exec("insertText", emoji);
  }, [exec]);

  const insertCodeBlock = useCallback(() => {
    exec("insertHTML", `<pre style="background:#1e293b;color:#e2e8f0;padding:16px;border-radius:4px;font-family:monospace;font-size:13px;overflow-x:auto;margin:12px 0"><code>// your code here</code></pre>`);
  }, [exec]);

  const insertCallout = useCallback((type: "info" | "warning" | "success") => {
    const styles: Record<string, { bg: string; border: string; icon: string }> = {
      info: { bg: "#eff6ff", border: "#3b82f6", icon: "ℹ️" },
      warning: { bg: "#fffbeb", border: "#f59e0b", icon: "⚠️" },
      success: { bg: "#f0fdf4", border: "#22c55e", icon: "✅" },
    };
    const s = styles[type];
    exec("insertHTML", `<div style="background:${s.bg};border-left:4px solid ${s.border};padding:12px 16px;margin:12px 0;border-radius:4px">${s.icon} <strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong> Your message here</div>`);
  }, [exec]);

  const insertButton = useCallback(() => {
    const url = prompt("Enter button link URL:");
    const text = prompt("Enter button text:", "Click Here");
    if (url && text) {
      exec("insertHTML", `<a href="${url}" style="display:inline-block;background:#003366;color:#ffffff;padding:12px 24px;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:8px 0">${text}</a>`);
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
      {/* Toolbar Row 1 */}
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
        <ToolbarButton onClick={() => exec("formatBlock", "<h3>")} title="Heading 3">
          <Heading3 size={14} />
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
        <ToolbarButton onClick={() => exec("subscript")} active={isActive("subscript")} title="Subscript">
          <Subscript size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("superscript")} active={isActive("superscript")} title="Superscript">
          <Superscript size={14} />
        </ToolbarButton>

        <Separator />

        {/* Font Size */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Font Size" className="px-1.5 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              A<span className="text-[10px]">↕</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-1" align="start">
            {FONT_SIZES.map((fs) => (
              <button
                key={fs.value}
                type="button"
                onClick={() => exec("fontSize", fs.value)}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded transition-colors"
              >
                {fs.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Text Color" className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Palette size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="start">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Text Color</p>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => exec("foreColor", color)}
                  className="w-8 h-8 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Highlight</p>
            <div className="grid grid-cols-4 gap-1.5">
              {BG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => exec("hiliteColor", color)}
                  className="w-8 h-8 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color === "transparent" ? "#fff" : color }}
                  title={color === "transparent" ? "None" : color}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Toolbar Row 2 */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-muted/40 border-b border-border">
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
        <ToolbarButton onClick={() => exec("indent")} title="Indent">
          <IndentIncrease size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("outdent")} title="Outdent">
          <IndentDecrease size={14} />
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
        <ToolbarButton onClick={insertImage} title="Insert Image">
          <Image size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={insertTable} title="Insert Table">
          <Table size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={insertCodeBlock} title="Code Block">
          <Code size={14} />
        </ToolbarButton>

        <Separator />

        {/* Emoji Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Insert Emoji" className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Smile size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="grid grid-cols-6 gap-1">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Callouts & Button */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Insert Block" className="px-1.5 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              + Block
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="start">
            <button type="button" onClick={() => insertCallout("info")} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded transition-colors">ℹ️ Info Callout</button>
            <button type="button" onClick={() => insertCallout("warning")} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded transition-colors">⚠️ Warning Callout</button>
            <button type="button" onClick={() => insertCallout("success")} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded transition-colors">✅ Success Callout</button>
            <button type="button" onClick={insertButton} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded transition-colors">🔘 CTA Button</button>
          </PopoverContent>
        </Popover>

        <Separator />

        <ToolbarButton onClick={() => exec("removeFormat")} title="Clear Formatting">
          <RemoveFormatting size={14} />
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
        className="min-h-[250px] max-h-[500px] overflow-y-auto px-4 py-3 font-serif text-foreground focus:outline-none prose prose-sm max-w-none
          [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-3
          [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3
          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2
          [&_p]:mb-2 [&_p]:leading-relaxed
          [&_blockquote]:border-l-4 [&_blockquote]:border-nobel-gold [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
          [&_a]:text-ui-blue [&_a]:underline
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
          [&_li]:mb-1
          [&_hr]:my-4 [&_hr]:border-border
          [&_pre]:bg-slate-800 [&_pre]:text-slate-200 [&_pre]:p-4 [&_pre]:rounded [&_pre]:text-sm [&_pre]:my-3 [&_pre]:overflow-x-auto
          [&_code]:font-mono [&_code]:text-sm
          [&_table]:w-full [&_table]:border-collapse [&_table]:my-3
          [&_td]:border [&_td]:border-border [&_td]:p-2
          [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:font-semibold
          [&_img]:max-w-full [&_img]:h-auto [&_img]:my-3 [&_img]:rounded"
        data-placeholder="Write your newsletter content here..."
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-t border-border">
        <span className="text-[10px] text-muted-foreground">{wordCount} words</span>
        <span className="text-[10px] text-muted-foreground">Rich Text Editor</span>
      </div>

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
