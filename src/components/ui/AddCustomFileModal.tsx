import React, { useState } from 'react';
import { X, FileText, Upload, Save, Sparkles, Code, Brain, Check, Loader2, BookOpen } from 'lucide-react';

interface AddCustomFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModeId?: string;
  onFileSaved?: (file?: any) => void;
}

const NOTE_TEMPLATES = [
  {
    id: 'sde-dsa',
    title: 'SDE DSA & LeetCode Cheat Sheet',
    targetRole: 'sde-interview',
    fileName: 'sde_dsa_patterns_custom.md',
    content: `# SDE Custom DSA Patterns & Problem Checklist

## 1. Sliding Window & Two Pointers
- **Two Sum II (Sorted):** Left pointer at 0, right at len-1. Adjust pointers based on current sum vs target.
- **Longest Substring Without Repeating Characters:** Sliding window with hash map tracking last seen character index.

## 2. Tree & Graph Traversals
- **BFS (Queue):** Level-by-level traversal. Optimal for shortest path in unweighted graphs.
- **DFS (Stack/Recursion):** Path finding, cycle detection, topological sort.

## 3. Dynamic Programming
- **0/1 Knapsack:** dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]]).
- **Longest Common Subsequence (LCS):** dp[i][j] = dp[i-1][j-1] + 1 if text1[i] == text2[j] else max(dp[i-1][j], dp[i][j-1]).
`,
  },
  {
    id: 'sde-system-design',
    title: 'System Design Architecture Checklist',
    targetRole: 'sde-interview',
    fileName: 'sde_system_design_custom.md',
    content: `# System Design Architecture Checklist

## 1. Key Metrics & Back-of-the-Envelope Calculations
- Daily Active Users (DAU): ~10M.
- Requests per second (RPS): 10M * 10 requests / 86,400s ≈ 1,200 QPS.
- Storage per year: 1,200 QPS * 1KB * 86,400s * 365 days ≈ 38 TB/year.

## 2. Architecture Components
- **API Gateway:** Reverse proxy, rate limiting (Token Bucket), authentication, SSL termination.
- **Cache Layer (Redis):** Cache-aside pattern, TTL expiration, LRU eviction policy.
- **Database:** PostgreSQL with primary-replica replication for read scaling; horizontal sharding on user_id for massive scale.
- **Message Broker (Kafka):** Asynchronous task decoupling, event sourcing, backpressure handling.
`,
  },
  {
    id: 'aiml-model-notes',
    title: 'AI/ML Model & PyTorch Notes',
    targetRole: 'aiml-interview',
    fileName: 'aiml_custom_model_notes.md',
    content: `# AI/ML Custom Model Notes & PyTorch Reference

## 1. Transformer Architecture
- **Self-Attention:** Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V.
- **Multi-Head Attention:** Allows model to jointly attend to information from different representation subspaces.

## 2. Fine-Tuning & LLM Production
- **LoRA (Low-Rank Adaptation):** W_new = W_0 + (B * A) * (alpha / r). Freezes W_0, trains low-rank matrices A and B.
- **QLoRA:** Quantizes base weights to NF4 (NormalFloat 4-bit) with double quantization and paged optimizers.

## 3. Evaluation & Metrics
- Imbalanced classification: Use PR-AUC (Precision-Recall AUC) and Macro-F1 rather than ROC-AUC or raw accuracy.
`,
  },
  {
    id: 'jd-highlights',
    title: 'Target Job Description (JD) & Resume Highlights',
    targetRole: 'sde-interview',
    fileName: 'target_job_description_notes.md',
    content: `# Target Job Description & Interview Talking Points

## Role Requirements
- Role Title: Senior Software Engineer / AI Engineer
- Core Tech Stack: Python, TypeScript, FastAPI, React, Docker, Kubernetes, PostgreSQL.

## My Matching Projects & Production Wins
- Built real-time WebSocket data pipeline processing 10k messages/sec with <50ms p99 latency.
- Implemented hybrid RAG search combining BM25 full-text search with vector embeddings, improving retrieval recall by 34%.
- Containerized microservices using Docker and orchestrated multi-region Kubernetes deployments.
`,
  },
];

export const AddCustomFileModal: React.FC<AddCustomFileModalProps> = ({
  isOpen,
  onClose,
  defaultModeId = 'sde-interview',
  onFileSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'create-md' | 'upload-file'>('create-md');
  const [targetRole, setTargetRole] = useState<string>(
    defaultModeId.includes('aiml') ? 'aiml-interview' : 'sde-interview'
  );
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = (template: typeof NOTE_TEMPLATES[0]) => {
    setFileName(template.fileName);
    setContent(template.content);
    setTargetRole(template.targetRole);
    setStatusMsg(`Loaded template: "${template.title}"`);
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleSaveCustomMd = async () => {
    if (!content.trim()) {
      setErrorMsg('Please enter markdown content for your note.');
      return;
    }

    const cleanName = (fileName.trim() || 'custom_interview_notes.md').replace(/[<>:"/\\|?*]/g, '_');
    const finalName = cleanName.endsWith('.md') || cleanName.endsWith('.txt') ? cleanName : `${cleanName}.md`;

    setIsSaving(true);
    setErrorMsg(null);
    setStatusMsg('Indexing into assistant knowledge base...');

    try {
      const api = (window as any).electronAPI;
      if (!api?.modesSaveCustomReferenceFile) {
        throw new Error('modesSaveCustomReferenceFile API not available');
      }

      const res = await api.modesSaveCustomReferenceFile({
        modeId: targetRole,
        fileName: finalName,
        content: content.trim(),
      });

      if (res?.success) {
        setStatusMsg('Custom markdown note successfully saved & indexed!');
        onFileSaved?.(res.file);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res?.error || 'Failed to save reference file.');
        setStatusMsg(null);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error saving file.');
      setStatusMsg(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNativeUpload = async () => {
    setIsUploading(true);
    setErrorMsg(null);
    setStatusMsg('Opening file picker...');
    try {
      const api = (window as any).electronAPI;
      if (!api?.modesUploadReferenceFile) {
        throw new Error('modesUploadReferenceFile API not available');
      }

      const res = await api.modesUploadReferenceFile(targetRole);
      if (res?.success) {
        setStatusMsg('File uploaded and indexed successfully!');
        onFileSaved?.(res.file);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else if (res?.cancelled) {
        setStatusMsg(null);
      } else {
        setErrorMsg(res?.error || 'Upload failed.');
        setStatusMsg(null);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Upload error.');
      setStatusMsg(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 select-text"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl h-[85vh] rounded-2xl border border-border-muted bg-bg-elevated shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-muted px-6 py-4 bg-bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary/15 text-accent-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Add Custom Reference File or Markdown Notes</h2>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Files and notes are immediately indexed by Local Hybrid RAG for real-time interview answers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-item-surface hover:text-text-primary transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab & Role Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 border-b border-border-muted/50 bg-bg-secondary/20">
          {/* Method Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-bg-secondary/60 p-1 border border-border-muted/40">
            <button
              onClick={() => setActiveTab('create-md')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'create-md'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Write Custom MD Note</span>
            </button>
            <button
              onClick={() => setActiveTab('upload-file')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'upload-file'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Existing File</span>
            </button>
          </div>

          {/* Target Role Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-text-tertiary">Assign to Role:</span>
            <button
              onClick={() => setTargetRole('sde-interview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                targetRole === 'sde-interview'
                  ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                  : 'border-border-muted text-text-secondary hover:text-text-primary'
              }`}
            >
              <Code className="h-3 w-3" /> SDE Role
            </button>
            <button
              onClick={() => setTargetRole('aiml-interview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                targetRole === 'aiml-interview'
                  ? 'border-purple-500/50 bg-purple-500/15 text-purple-300'
                  : 'border-border-muted text-text-secondary hover:text-text-primary'
              }`}
            >
              <Brain className="h-3 w-3" /> AI/ML Role
            </button>
          </div>
        </div>

        {/* Status / Error Banner */}
        {statusMsg && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
            <X className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body */}
        {activeTab === 'create-md' ? (
          <div className="flex flex-1 flex-col overflow-hidden p-6 gap-3">
            {/* Quick Template Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-medium text-text-tertiary shrink-0">Templates:</span>
              {NOTE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="flex items-center gap-1 rounded-md border border-border-muted/60 bg-bg-item-surface px-2.5 py-1 text-[11px] text-text-secondary hover:text-text-primary hover:border-accent-primary/40 transition-colors shrink-0"
                >
                  <Sparkles className="h-3 w-3 text-accent-primary" />
                  <span>{tmpl.title}</span>
                </button>
              ))}
            </div>

            {/* File Name Input */}
            <div className="flex items-center gap-2">
              <label htmlFor="custom-filename-input" className="text-xs font-medium text-text-secondary shrink-0">File Name:</label>
              <input
                id="custom-filename-input"
                type="text"
                placeholder="e.g. sde_dsa_cheat_sheet.md, my_pytorch_notes.md"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="flex-1 rounded-lg border border-border-muted bg-bg-input px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            {/* Markdown Text Area */}
            <div className="flex flex-1 flex-col min-h-0">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="custom-md-content-textarea" className="text-xs font-medium text-text-secondary">Markdown Content:</label>
                <span className="text-[10px] text-text-tertiary">
                  {content.length} characters ({Math.round(content.length / 1024)} KB)
                </span>
              </div>
              <textarea
                id="custom-md-content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`# Custom Technical Notes\n\nWrite or paste your custom interview preparation notes, code snippets, or system design architectures here...`}
                className="flex-1 w-full rounded-xl border border-border-muted bg-bg-input p-3.5 font-mono text-xs leading-relaxed text-text-primary focus:outline-none focus:border-accent-primary resize-none custom-scrollbar"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-primary/10 text-accent-primary mb-4">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Upload Files for {targetRole === 'aiml-interview' ? 'AI/ML Role' : 'SDE Role'}
            </h3>
            <p className="text-xs text-text-secondary max-w-md mb-6 leading-relaxed">
              Upload existing Markdown (.md), Text (.txt), PDF (.pdf), Word (.docx), or Python (.py) files from your computer. The file text will be extracted, chunked, and indexed for instant hybrid RAG retrieval.
            </p>

            <button
              onClick={handleNativeUpload}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-xl bg-accent-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-accent-primary/20 hover:opacity-95 transition-all"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>Browse & Upload File</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border-muted px-6 py-3.5 bg-bg-secondary/40">
          <div className="text-[11px] text-text-tertiary">
            Target mode: <span className="font-semibold text-text-primary">{targetRole}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-text-secondary hover:bg-bg-item-surface hover:text-text-primary transition-colors"
            >
              Cancel
            </button>

            {activeTab === 'create-md' && (
              <button
                onClick={handleSaveCustomMd}
                disabled={isSaving || !content.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-accent-primary px-4 py-2 text-xs font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save & Index Note</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

