import { useRef, useCallback, useState, useEffect } from "react";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link, Heading1, Heading2, Heading3,
  Quote, Minus, Undo, Redo, Type, Image, Code, Palette, RemoveFormatting,
  Subscript, Superscript, IndentIncrease, IndentDecrease, Table, Smile,
  Upload, Plus, Trash2, Loader2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewsletterRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  tokens?: { label: string; token: string }[];
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const onChangeRef = useRef(onChange);
  const isInitializedRef = useRef(false);

  // Keep onChange ref current without triggering re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync external value into the editor only on first mount
  // or when the value changes while the editor is NOT focused
  useEffect(() => {
    if (!editorRef.current) return;
    if (!isInitializedRef.current) {
      editorRef.current.innerHTML = value || '';
      isInitializedRef.current = true;
      return;
    }
    // Only sync if editor is not focused (external reset)
    if (document.activeElement !== editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      if (currentHtml !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    setTimeout(() => {
      if (editorRef.current) {
        onChangeRef.current(editorRef.current.innerHTML);
      }
    }, 0);
  }, []);

  const updateStats = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChangeRef.current(editorRef.current.innerHTML);
      updateStats();
    }
  }, [updateStats]);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      exec("createLink", url);
    }
  }, [exec]);

  const insertImageUrl = useCallback(() => {
    const url = prompt("Enter image URL:");
    if (url) {
      exec("insertHTML", `<img src="${url}" alt="Newsletter image" style="max-width:100%;height:auto;margin:12px 0;border-radius:4px" />`);
    }
  }, [exec]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const fileName = `newsletter/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("club-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("club-images")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      exec("insertHTML", `<img src="${publicUrl}" alt="Newsletter image" style="max-width:100%;height:auto;margin:12px 0;border-radius:4px" />`);
      toast.success("Image uploaded");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }, [exec]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  }, [handleImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Table helpers
  const insertTable = useCallback((rows: number, cols: number) => {
    let html = `<table style="width:100%;border-collapse:collapse;margin:12px 0">`;
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        const tag = r === 0 ? "th" : "td";
        html += `<${tag} style="border:1px solid #ccc;padding:8px;${r === 0 ? "background:#f1f5f9;font-weight:bold;" : ""}">${r === 0 ? `Header ${c + 1}` : `Cell`}</${tag}>`;
      }
      html += "</tr>";
    }
    html += "</table><p><br></p>";
    exec("insertHTML", html);
  }, [exec]);

  const addTableRow = useCallback(() => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return;
    const td = (sel.anchorNode as HTMLElement).closest?.("td, th") || 
               (sel.anchorNode.parentElement as HTMLElement)?.closest?.("td, th");
    if (!td) { toast.error("Place cursor inside a table first"); return; }
    const tr = td.closest("tr");
    if (!tr) return;
    const cols = tr.children.length;
    const newRow = document.createElement("tr");
    for (let i = 0; i < cols; i++) {
      const newTd = document.createElement("td");
      newTd.style.cssText = "border:1px solid #ccc;padding:8px";
      newTd.textContent = "Cell";
      newRow.appendChild(newTd);
    }
    tr.parentNode?.insertBefore(newRow, tr.nextSibling);
    handleInput();
  }, [handleInput]);

  const addTableCol = useCallback(() => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return;
    const td = (sel.anchorNode as HTMLElement).closest?.("td, th") || 
               (sel.anchorNode.parentElement as HTMLElement)?.closest?.("td, th");
    if (!td) { toast.error("Place cursor inside a table first"); return; }
    const table = td.closest("table");
    if (!table) return;
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, i) => {
      const cell = document.createElement(i === 0 ? "th" : "td");
      cell.style.cssText = `border:1px solid #ccc;padding:8px;${i === 0 ? "background:#f1f5f9;font-weight:bold;" : ""}`;
      cell.textContent = i === 0 ? "Header" : "Cell";
      row.appendChild(cell);
    });
    handleInput();
  }, [handleInput]);

  const deleteTableRow = useCallback(() => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return;
    const td = (sel.anchorNode as HTMLElement).closest?.("td, th") || 
               (sel.anchorNode.parentElement as HTMLElement)?.closest?.("td, th");
    if (!td) { toast.error("Place cursor inside a table first"); return; }
    const tr = td.closest("tr");
    const table = td.closest("table");
    if (!tr || !table) return;
    if (table.querySelectorAll("tr").length <= 1) {
      table.remove();
    } else {
      tr.remove();
    }
    handleInput();
  }, [handleInput]);

  const deleteTable = useCallback(() => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return;
    const td = (sel.anchorNode as HTMLElement).closest?.("td, th") || 
               (sel.anchorNode.parentElement as HTMLElement)?.closest?.("td, th");
    if (!td) { toast.error("Place cursor inside a table first"); return; }
    const table = td.closest("table");
    table?.remove();
    handleInput();
  }, [handleInput]);

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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelect}
      />

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

        {/* Image with upload + URL options */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Insert Image" className={`p-1.5 rounded transition-colors ${uploading ? "text-nobel-gold" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors flex items-center gap-2"
            >
              <Upload size={14} /> Upload Image
            </button>
            <button
              type="button"
              onClick={insertImageUrl}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors flex items-center gap-2"
            >
              <Link size={14} /> Image from URL
            </button>
          </PopoverContent>
        </Popover>

        {/* Table with size options */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Table" className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Table size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2" align="start">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Insert Table</p>
            <div className="grid grid-cols-3 gap-1 mb-3">
              {[
                { r: 2, c: 2, label: "2×2" },
                { r: 3, c: 3, label: "3×3" },
                { r: 4, c: 4, label: "4×4" },
                { r: 2, c: 3, label: "2×3" },
                { r: 3, c: 2, label: "3×2" },
                { r: 5, c: 3, label: "5×3" },
              ].map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => insertTable(t.r, t.c)}
                  className="px-2 py-1.5 text-xs border border-border hover:bg-muted rounded transition-colors text-center"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Edit Table</p>
            <div className="space-y-1">
              <button type="button" onClick={addTableRow} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded transition-colors flex items-center gap-2">
                <Plus size={12} /> Add Row
              </button>
              <button type="button" onClick={addTableCol} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded transition-colors flex items-center gap-2">
                <Plus size={12} /> Add Column
              </button>
              <button type="button" onClick={deleteTableRow} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded transition-colors flex items-center gap-2 text-destructive">
                <Trash2 size={12} /> Delete Row
              </button>
              <button type="button" onClick={deleteTable} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted rounded transition-colors flex items-center gap-2 text-destructive">
                <Trash2 size={12} /> Delete Table
              </button>
            </div>
          </PopoverContent>
        </Popover>

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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
          [&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:min-w-[60px]
          [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:font-semibold [&_th]:min-w-[60px]
          [&_img]:max-w-full [&_img]:h-auto [&_img]:my-3 [&_img]:rounded"
        data-placeholder="Write your newsletter content here... (drag & drop images supported)"
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-t border-border">
        <span className="text-[10px] text-muted-foreground">{wordCount} words</span>
        <span className="text-[10px] text-muted-foreground">
          {uploading ? "Uploading image..." : "Drag & drop images supported"}
        </span>
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
