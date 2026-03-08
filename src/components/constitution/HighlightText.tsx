import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-300 text-slate-900 px-0.5 rounded-sm dark:bg-yellow-500/60">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default HighlightText;
