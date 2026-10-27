import React, { useState, useMemo } from 'react';
import { X, ExternalLink, Copy, Check, Search, BookOpen, FileText, ArrowUpRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileName: string;
  content: string;
  filePath?: string;
  fileId?: string;
  bookId?: string;
  availableBooks?: Array<{ id: string; title: string; fileName: string; content: string }>;
  onSelectBook?: (book: { id: string; title: string; fileName: string; content: string }) => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  fileName,
  content,
  filePath,
  fileId,
  bookId,
  availableBooks,
  onSelectBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [openingStatus, setOpeningStatus] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleOpenNative = async () => {
    const api = (window as any).electronAPI;
    setOpeningStatus('Opening...');
    try {
      let res;
      if (filePath && api?.modesOpenPathNative) {
        res = await api.modesOpenPathNative(filePath);
      } else if (bookId && api?.knowledgeBooksOpenBook) {
        res = await api.knowledgeBooksOpenBook(bookId);
      } else if (fileId && api?.modesOpenReferenceFile) {
        res = await api.modesOpenReferenceFile(fileId);
      } else if (api?.knowledgeBooksOpenBook) {
        res = await api.knowledgeBooksOpenBook('sde');
      }

      if (res?.success) {
        setOpeningStatus('Opened on Desktop!');
        setTimeout(() => setOpeningStatus(null), 2500);
      } else if (res?.error) {
        setOpeningStatus(`Error: ${res.error}`);
        setTimeout(() => setOpeningStatus(null), 3000);
      } else {
        setOpeningStatus(null);
      }
    } catch (e: any) {
      setOpeningStatus(`Error: ${e.message}`);
      setTimeout(() => setOpeningStatus(null), 3000);
    }
  };

  // Filter content by search if entered
  const displayContent = useMemo(() => {
    if (!searchTerm.trim()) return content;
    const term = searchTerm.toLowerCase();
    // Return lines or paragraphs containing the search term
    const lines = content.split('\n');
    const matched = lines.filter(l => l.toLowerCase().includes(term));
    if (matched.length === 0) return `_No matches found for "${searchTerm}"._`;
    return `### Search Results for "${searchTerm}" (${matched.length} matches):\n\n` + matched.join('\n\n---\n\n');
  }, [content, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-text"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl h-[88vh] rounded-2xl border border-border-muted bg-bg-elevated shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-muted px-6 py-4 bg-bg-secondary/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary/15 text-accent-primary shrink-0">
              {fileName.endsWith('.md') ? <BookOpen className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-text-primary truncate">{title || fileName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono text-text-secondary truncate">{fileName}</span>
                <span className="text-[10px] rounded bg-bg-item-surface px-1.5 py-0.5 text-text-tertiary">
                  {Math.round(content.length / 1024)} KB
                </span>
                {openingStatus && (
                  <span className="text-[11px] text-emerald-400 font-medium">{openingStatus}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNative}
              className="flex items-center gap-1.5 rounded-lg border border-border-muted bg-bg-item-surface px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-bg-secondary hover:text-accent-primary transition-colors"
              title="Open file in system editor (VS Code, Notepad, Typora)"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open in Desktop App</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-border-muted bg-bg-item-surface px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-bg-secondary transition-colors"
              title="Copy markdown content"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-item-surface hover:text-text-primary transition-colors ml-1"
              aria-label="Close viewer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Available Books Switcher Tabs */}
        {availableBooks && availableBooks.length > 0 && (
          <div className="flex items-center gap-2 px-6 py-2 border-b border-border-muted/40 bg-bg-secondary/40 overflow-x-auto">
            <span className="text-[11px] font-medium text-text-tertiary shrink-0">Official Books:</span>
            {availableBooks.map((b) => {
              const isSelected = b.fileName === fileName || b.id === bookId;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBook?.(b)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    isSelected
                      ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30 shadow-sm'
                      : 'text-text-secondary hover:bg-bg-item-surface hover:text-text-primary border border-transparent'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{b.title.replace('Official ', '').replace(' Knowledge Handbook', '')}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border-muted/50 bg-bg-secondary/20">
          <Search className="h-3.5 w-3.5 text-text-secondary shrink-0" />
          <input
            type="text"
            placeholder="Search concepts, questions, keywords (e.g. 'SQL', 'Sliding Window', 'Transformer', 'W3Schools')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-text-primary placeholder-text-secondary/60 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[11px] text-text-secondary hover:text-text-primary px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar text-xs leading-relaxed text-text-primary">
          <div className="prose prose-invert prose-xs max-w-none">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border-muted px-6 py-2.5 bg-bg-secondary/30 text-[11px] text-text-secondary">
          <div className="flex items-center gap-2">
            <span>Official Knowledge Book</span>
            <span>•</span>
            <span>W3Schools Interview Q&A Included</span>
            <span>•</span>
            <span>Local RAG Indexed</span>
          </div>
          <button
            onClick={handleOpenNative}
            className="flex items-center gap-1 text-accent-primary hover:underline"
          >
            Open in default OS viewer <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
