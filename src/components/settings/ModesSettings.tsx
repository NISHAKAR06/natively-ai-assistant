import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Upload, FileText, Check, Sparkles, Save, Loader2 } from 'lucide-react';
import { ModesSettings as PremiumModesSettings } from '../../premium';

const TEMPLATE_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'technical-interview', label: 'Technical Interview' },
  { value: 'looking-for-work', label: 'Looking for Work' },
  { value: 'sales', label: 'Sales' },
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'team-meet', label: 'Team Meet' },
  { value: 'lecture', label: 'Lecture' },
  { value: 'seminar', label: 'Seminar (Strict Document Q&A)' },
  { value: 'call-center', label: 'Call Center' },
] as const;

interface ModeItem {
  id: string;
  name: string;
  templateType: string;
  customContext: string;
  isActive: boolean;
  isBuiltin?: boolean;
}

interface ReferenceFileItem {
  id: string;
  modeId: string;
  fileName: string;
  createdAt: string;
  pageCount?: number;
}

interface ModesSettingsProps {
  onClose?: () => void;
  isPremium?: boolean;
  isLoaded?: boolean;
  isTrialActive?: boolean;
  onOpenNativelyAPI?: () => void;
}

const BuiltinModesSettings: React.FC<ModesSettingsProps> = ({ onClose }) => {
  const [modes, setModes] = useState<ModeItem[]>([]);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContext, setEditContext] = useState('');
  const [refFiles, setRefFiles] = useState<ReferenceFileItem[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newModeName, setNewModeName] = useState('');
  const [newModeTemplate, setNewModeTemplate] = useState('technical-interview');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadModes = useCallback(async () => {
    const api = (window as any).electronAPI;
    if (!api?.modesGetAll) return;
    const all: ModeItem[] = (await api.modesGetAll()) || [];
    setModes(all);
    setSelectedModeId((prev) => {
      if (prev && all.some((m) => m.id === prev)) return prev;
      const active = all.find((m) => m.isActive);
      return active?.id ?? all[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    void loadModes();
  }, [loadModes]);

  const selectedMode = modes.find((m) => m.id === selectedModeId) || null;

  useEffect(() => {
    if (!selectedMode) {
      setEditName('');
      setEditContext('');
      setRefFiles([]);
      return;
    }
    setEditName(selectedMode.name || '');
    setEditContext(selectedMode.customContext || '');
    const api = (window as any).electronAPI;
    if (api?.modesGetReferenceFiles) {
      void api.modesGetReferenceFiles(selectedMode.id).then((files: ReferenceFileItem[]) => {
        setRefFiles(Array.isArray(files) ? files : []);
      });
    }
  }, [selectedMode?.id]);

  const handleSetActive = async (id: string | null) => {
    const api = (window as any).electronAPI;
    if (!api?.modesSetActive) return;
    const res = await api.modesSetActive(id);
    if (res?.success) {
      await loadModes();
      setStatusMsg('Active mode updated.');
      setTimeout(() => setStatusMsg(null), 2500);
    } else if (res?.error) {
      setStatusMsg(`Error: ${res.error}`);
    }
  };

  const handleSaveMode = async () => {
    if (!selectedMode) return;
    const api = (window as any).electronAPI;
    if (!api?.modesUpdate) return;
    setIsSaving(true);
    try {
      const res = await api.modesUpdate(selectedMode.id, {
        name: editName.trim() || selectedMode.name,
        customContext: editContext,
      });
      if (res?.success) {
        await loadModes();
        setStatusMsg('Saved mode changes.');
        setTimeout(() => setStatusMsg(null), 2500);
      } else {
        setStatusMsg(`Save failed: ${res?.error || 'unknown error'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateMode = async () => {
    if (!newModeName.trim()) return;
    const api = (window as any).electronAPI;
    if (!api?.modesCreate) return;
    const res = await api.modesCreate({
      name: newModeName.trim(),
      templateType: newModeTemplate,
    });
    if (res?.success && res.mode) {
      setNewModeName('');
      setShowCreateForm(false);
      await loadModes();
      setSelectedModeId(res.mode.id);
    } else if (res?.error) {
      setStatusMsg(`Create failed: ${res.error}`);
    }
  };

  const handleDeleteMode = async (id: string) => {
    const api = (window as any).electronAPI;
    if (!api?.modesDelete) return;
    const res = await api.modesDelete(id);
    if (res?.success) {
      await loadModes();
    } else if (res?.error) {
      setStatusMsg(`Delete failed: ${res.error}`);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedMode) return;
    const api = (window as any).electronAPI;
    if (!api?.modesUploadReferenceFile) return;
    setIsUploading(true);
    try {
      const res = await api.modesUploadReferenceFile(selectedMode.id);
      if (res?.success) {
        const files = await api.modesGetReferenceFiles(selectedMode.id);
        setRefFiles(Array.isArray(files) ? files : []);
        setStatusMsg('Reference file uploaded & indexed.');
        setTimeout(() => setStatusMsg(null), 2500);
      } else if (res?.error && !res?.cancelled) {
        setStatusMsg(`Upload error: ${res.error}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!selectedMode) return;
    const api = (window as any).electronAPI;
    if (!api?.modesDeleteReferenceFile) return;
    const res = await api.modesDeleteReferenceFile(fileId);
    if (res?.success) {
      const files = await api.modesGetReferenceFiles(selectedMode.id);
      setRefFiles(Array.isArray(files) ? files : []);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-bg-elevated text-text-primary select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-muted px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-accent-primary" />
          <h2 className="text-sm font-semibold">Modes & Context Manager (Free Local Edition)</h2>
        </div>
        <div className="flex items-center gap-3">
          {statusMsg && (
            <span className="text-xs text-emerald-400">{statusMsg}</span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-item-surface hover:text-text-primary"
              aria-label="Close Modes Manager"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Modes list */}
        <div className="flex w-64 flex-col border-r border-border-muted bg-bg-secondary/40 p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Persona Modes ({modes.length})
            </span>
            <button
              onClick={() => setShowCreateForm((v) => !v)}
              className="flex items-center gap-1 rounded-md bg-accent-primary/15 px-2 py-1 text-xs font-medium text-accent-primary hover:bg-accent-primary/25"
            >
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>

          {showCreateForm && (
            <div className="mb-3 space-y-2 rounded-lg border border-border-muted bg-bg-elevated p-2.5">
              <input
                type="text"
                placeholder="Custom mode name..."
                value={newModeName}
                onChange={(e) => setNewModeName(e.target.value)}
                className="w-full rounded-md border border-border-muted bg-bg-input px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
              />
              <select
                value={newModeTemplate}
                onChange={(e) => setNewModeTemplate(e.target.value)}
                className="w-full rounded-md border border-border-muted bg-bg-input px-2 py-1.5 text-xs text-text-primary focus:outline-none"
              >
                {TEMPLATE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="rounded px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMode}
                  className="rounded bg-accent-primary px-2.5 py-1 text-xs font-medium text-white"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {modes.map((m) => {
              const isSelected = m.id === selectedModeId;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedModeId(m.id)}
                  className={`group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                    isSelected
                      ? 'bg-accent-primary/15 text-text-primary font-medium'
                      : 'text-text-secondary hover:bg-bg-item-surface hover:text-text-primary'
                  }`}
                >
                  <div className="flex flex-col truncate">
                    <span className="truncate">{m.name}</span>
                    <span className="text-[10px] opacity-60">{m.templateType}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.isActive && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        Active
                      </span>
                    )}
                    {!m.isBuiltin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteMode(m.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 rounded p-1 text-text-secondary hover:text-red-400"
                        title="Delete custom mode"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Editor */}
        {selectedMode ? (
          <div className="flex flex-1 flex-col overflow-y-auto p-5 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Mode Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-border-muted bg-bg-input px-3 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <button
                  onClick={() =>
                    void handleSetActive(selectedMode.isActive ? null : selectedMode.id)
                  }
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                    selectedMode.isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-accent-primary text-white hover:opacity-90'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  {selectedMode.isActive ? 'Active Mode (Click to Disable)' : 'Set as Active Mode'}
                </button>
                <button
                  onClick={() => void handleSaveMode()}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-lg border border-border-muted bg-bg-item-surface px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-bg-secondary"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </button>
              </div>
            </div>

            {/* Custom Context / Instructions */}
            <div className="flex flex-col">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-text-secondary">
                  Custom Context, Resume Summary, JD & Instructions
                </label>
                <span className="text-[11px] text-text-secondary">
                  {editContext.length} / 8000 chars
                </span>
              </div>
              <textarea
                rows={7}
                maxLength={8000}
                value={editContext}
                onChange={(e) => setEditContext(e.target.value)}
                placeholder="Paste your resume highlights, target Job Description (JD), company notes, or custom instructions for this mode..."
                className="w-full rounded-lg border border-border-muted bg-bg-input p-3 text-xs leading-relaxed text-text-primary focus:outline-none"
              />
            </div>

            {/* Reference Files (PDF / DOCX / TXT / Code RAG) */}
            <div className="flex flex-col space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-text-primary">
                    Reference Files (Local Hybrid RAG)
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Upload PDFs, DOCX resumes, job descriptions, lecture notes, or code files for instant local retrieval.
                  </p>
                </div>
                <button
                  onClick={() => void handleUploadFile()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 rounded-lg bg-accent-primary/15 px-3 py-1.5 text-xs font-medium text-accent-primary hover:bg-accent-primary/25"
                >
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  Upload File
                </button>
              </div>

              {refFiles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border-muted p-4 text-center text-xs text-text-secondary">
                  No reference files attached to this mode yet.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {refFiles.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between rounded-lg border border-border-muted bg-bg-item-surface px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 shrink-0 text-accent-primary" />
                        <span className="truncate font-medium">{f.fileName}</span>
                        {f.pageCount ? (
                          <span className="text-[10px] text-text-secondary">
                            ({f.pageCount} pages)
                          </span>
                        ) : null}
                      </div>
                      <button
                        onClick={() => void handleDeleteFile(f.id)}
                        className="rounded p-1 text-text-secondary hover:text-red-400"
                        title="Remove file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-xs text-text-secondary">
            Select a mode from the sidebar to configure.
          </div>
        )}
      </div>
    </div>
  );
};

const ModesSettings: React.FC<ModesSettingsProps> = (props) => {
  // Use the private premium component if present; otherwise render our built-in UI.
  const testEl = PremiumModesSettings ? PremiumModesSettings(props) : null;
  if (testEl !== null) return testEl;
  return <BuiltinModesSettings {...props} />;
};

export default ModesSettings;

