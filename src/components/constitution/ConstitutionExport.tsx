import React, { useState } from 'react';
import { Download, FileText, FileType, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { constitutionData, amendmentsData } from '@/lib/data';
import { toast } from 'sonner';

const getPlainText = () => {
  let text = 'THE CONSTITUTION\nUniversity of Ibadan Students\' Union\n\n';
  constitutionData.forEach(article => {
    text += `${article.title}\n${'='.repeat(article.title.length)}\n\n`;
    article.sections.forEach(section => {
      if (section.title) text += `${section.title}\n`;
      text += `${section.content}\n\n`;
      section.subSections?.forEach(sub => { text += `  • ${sub}\n`; });
      if (section.subSections) text += '\n';
    });
    text += '\n';
  });
  text += '\nAMENDMENTS LEDGER\n==================\n\n';
  amendmentsData.forEach(a => {
    text += `[${a.id}] ${a.date} — ${a.articleRef}\n${a.description}\nStatus: ${a.status}\n\n`;
  });
  return text;
};

const ConstitutionExport: React.FC = () => {
  const [open, setOpen] = useState(false);

  const exportTXT = () => {
    const blob = new Blob([getPlainText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'UISU-Constitution.txt'; a.click();
    URL.revokeObjectURL(url);
    toast.success('TXT exported');
    setOpen(false);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const text = getPlainText();
    const lines = doc.splitTextToSize(text, 170);
    let y = 20;
    lines.forEach((line: string) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.text(line, 20, y);
      y += 5;
    });
    doc.save('UISU-Constitution.pdf');
    toast.success('PDF exported');
    setOpen(false);
  };

  const exportDOCX = async () => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
    const children: any[] = [];
    children.push(new Paragraph({ text: 'THE CONSTITUTION', heading: HeadingLevel.TITLE }));
    children.push(new Paragraph({ text: "University of Ibadan Students' Union", heading: HeadingLevel.HEADING_2 }));

    constitutionData.forEach(article => {
      children.push(new Paragraph({ text: article.title, heading: HeadingLevel.HEADING_1, spacing: { before: 400 } }));
      article.sections.forEach(section => {
        if (section.title) children.push(new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2 }));
        children.push(new Paragraph({ children: [new TextRun({ text: section.content, size: 22 })] }));
        section.subSections?.forEach(sub => {
          children.push(new Paragraph({ children: [new TextRun({ text: `• ${sub}`, size: 22 })], indent: { left: 720 } }));
        });
      });
    });

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const { saveAs } = await import('file-saver');
    saveAs(blob, 'UISU-Constitution.docx');
    toast.success('DOCX exported');
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setOpen(!open)}
        variant="outline"
        className="w-full gap-2 text-xs font-bold uppercase tracking-widest border-slate-300 hover:border-ui-blue hover:text-ui-blue dark:border-slate-600 dark:hover:border-nobel-gold dark:hover:text-nobel-gold dark:text-slate-300"
      >
        <Download size={14} /> Export <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md shadow-lg overflow-hidden z-10">
          <button onClick={exportPDF} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
            <FileText size={14} className="text-red-500" /> PDF Document
          </button>
          <button onClick={exportDOCX} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border-t border-slate-100 dark:border-slate-700">
            <FileType size={14} className="text-blue-500" /> Word (DOCX)
          </button>
          <button onClick={exportTXT} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border-t border-slate-100 dark:border-slate-700">
            <FileText size={14} className="text-slate-500" /> Plain Text (TXT)
          </button>
        </div>
      )}
    </div>
  );
};

export default ConstitutionExport;
