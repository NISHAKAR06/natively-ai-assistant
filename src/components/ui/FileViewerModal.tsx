import React, { useState, useMemo, useEffect } from 'react';
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
  availableBooks?: Array<{ id: string; title: string; fileName: string; content: string; path?: string }>;
  onSelectBook?: (book: { id: string; title: string; fileName: string; content: string; path?: string }) => void;
  embedded?: boolean;
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
  embedded = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [openingStatus, setOpeningStatus] = useState<string | null>(null);

  // Global ESC key listener - guaranteed to close viewer from any focused container
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

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
    setOpeningStatus('Opening on Desktop...');
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
        setOpeningStatus('Opened in OS editor!');
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
    const lines = content.split('\n');
    const matched = lines.filter(l => l.toLowerCase().includes(term));
    if (matched.length === 0) return `_No matches found for "${searchTerm}"._`;
    return `### Search Results for "${searchTerm}" (${matched.length} matches):\n\n` + matched.join('\n\n---\n\n');
  }, [content, searchTerm]);

  if (!isOpen) return null;

  const cardContent = (
    <div
      className={`relative flex flex-col w-full ${
        embedded
          ? 'max-h-[460px] h-full rounded-2xl border border-cyan-500/30 bg-bg-elevated/95 shadow-2xl my-2'
          : 'max-w-4xl max-h-[85vh] h-[85vh] rounded-2xl border border-border-muted bg-bg-elevated shadow-2xl'
      } overflow-hidden select-text no-drag`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-muted px-4 sm:px-6 py-3 bg-bg-secondary/60 shrink-0 no-drag">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary/15 text-accent-primary shrink-0">
            {fileName.endsWith('.md') ? <BookOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-text-primary truncate">{title || fileName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] sm:text-[11px] font-mono text-text-secondary truncate">{fileName}</span>
              <span className="text-[9px] rounded bg-bg-item-surface px-1.5 py-0.5 text-text-tertiary">
                {Math.round(content.length / 1024)} KB
              </span>
              {openingStatus && (
                <span className="text-[11px] text-emerald-400 font-medium animate-pulse">{openingStatus}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 no-drag">
          <button
            type="button"
            onClick={handleOpenNative}
            className="flex items-center gap-1.5 rounded-lg border border-border-muted bg-bg-item-surface px-2.5 py-1.5 text-xs font-medium text-text-primary hover:bg-bg-secondary hover:text-accent-primary transition-colors cursor-pointer no-drag"
            title="Open file in system editor (VS Code, Notepad, Typora)"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Desktop App</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-border-muted bg-bg-item-surface px-2.5 py-1.5 text-xs font-medium text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer no-drag"
            title="Copy markdown content"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
          {/* Prominent High-Contrast Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="no-drag cursor-pointer flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/20 hover:bg-red-500/35 px-3 py-1.5 text-xs font-semibold text-red-200 hover:text-white transition-all shadow-sm shrink-0"
            aria-label="Close viewer"
            title="Close viewer (or press Escape)"
          >
            <X className="h-4 w-4 text-red-300" />
            <span>Close (Esc)</span>
          </button>
        </div>
      </div>

      {/* Available Books Switcher Tabs */}
      {availableBooks && availableBooks.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 border-b border-border-muted/40 bg-bg-secondary/40 overflow-x-auto shrink-0 no-drag custom-scrollbar">
          <span className="text-[10px] font-medium text-text-tertiary shrink-0">Handbooks:</span>
          {availableBooks.map((b) => {
            const isSelected = b.fileName === fileName || b.id === bookId;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBook?.(b)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer no-drag ${
                  isSelected
                    ? 'bg-accent-primary/25 text-accent-primary border border-accent-primary/40 shadow-sm'
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
      <div className="flex items-center gap-2 px-4 sm:px-6 py-2 border-b border-border-muted/50 bg-bg-secondary/20 shrink-0 no-drag">
        <Search className="h-3.5 w-3.5 text-text-secondary shrink-0" />
        <input
          type="text"
          placeholder="Search concepts, questions, keywords (e.g. 'SQL', 'Sliding Window', 'Transformer', 'W3Schools')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-text-primary placeholder-text-secondary/60 focus:outline-none no-drag"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-[11px] text-text-secondary hover:text-text-primary px-1 cursor-pointer no-drag"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content Viewer */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 custom-scrollbar text-xs leading-relaxed text-text-primary select-text no-drag">
        <div className="prose prose-invert prose-xs max-w-none">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border-muted px-4 sm:px-6 py-2 bg-bg-secondary/30 text-[11px] text-text-secondary shrink-0 no-drag">
        <div className="flex items-center gap-2">
          <span>Official Knowledge Book</span>
          <span>•</span>
          <span className="hidden sm:inline">W3Schools Interview Q&A Included</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenNative}
            className="flex items-center gap-1 text-accent-primary hover:underline cursor-pointer no-drag"
          >
            Open on Desktop <ArrowUpRight className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="no-drag cursor-pointer flex items-center gap-1 rounded-lg border border-border-muted bg-bg-item-surface px-2.5 py-1 text-xs text-text-primary hover:bg-bg-secondary hover:text-red-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span>Close (Esc)</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return cardContent;
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6 select-text no-drag"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {cardContent}
    </div>
  );
};
