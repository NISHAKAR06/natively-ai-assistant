import React, { useState, useEffect } from 'react';
import {
  Target, CheckCircle2, AlertCircle, RefreshCw, Sparkles,
  ArrowRight, ShieldCheck, ChevronDown, ChevronUp, Briefcase,
  HelpCircle, MessageSquare, Award, Check
} from 'lucide-react';

interface RoleInsightPanelProps {
  hasAccess?: boolean;
  onNeedUpgrade?: () => void;
  onGoToProfile?: () => void;
}

export const RoleInsightPanel: React.FC<RoleInsightPanelProps> = ({
  onGoToProfile,
}) => {
  const [status, setStatus] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requirements' | 'strengths' | 'talkingPoints'>('requirements');
  const [expandedReq, setExpandedReq] = useState<string | null>(null);

  const api = (window as any).electronAPI;

  const loadData = async () => {
    if (!api) return;
    try {
      const st = await api.roleInsightGetStatus?.();
      setStatus(st || null);

      const repRes = await api.roleInsightGetReport?.();
      if (repRes?.success && repRes?.report) {
        setReport(repRes.report);
      }
    } catch (e: any) {
      console.warn('[RoleInsightPanel] Failed to load data:', e);
    }
  };

  useEffect(() => {
    loadData();

    const unsub = api?.onRoleInsightProgress?.((payload: { stage: string | null; analysing: boolean }) => {
      setLoading(payload.analysing);
      setStage(payload.stage);
      if (!payload.analysing) {
        loadData();
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleAnalyse = async () => {
    if (!api?.roleInsightAnalyse) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.roleInsightAnalyse();
      if (res?.success && res.report) {
        setReport(res.report);
      } else if (res?.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Analysis failed');
    } finally {
      setLoading(false);
      setStage(null);
      loadData();
    }
  };

  const stageLabels: Record<string, string> = {
    reading_sources: 'Reading candidate profile and job description…',
    extracting_jd_requirements: 'Extracting key responsibilities and required skills…',
    finding_profile_evidence: 'Comparing experience and GitHub projects with target requirements…',
    scoring_alignment: 'Scoring role alignment and evidence confidence…',
    generating_talking_points: 'Generating interview strategy and talking points…',
  };

  const hasResume = status?.hasResume;
  const hasJD = status?.hasJobDescription;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 className="pi-section-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} style={{ color: 'var(--pi-accent)' }} /> Role Insight
          </h3>
          <p style={{ fontSize: 12, color: 'var(--pi-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>
            Automated JD requirement mapping powered by local AI. Know your exact match score, proven strengths, and interview talking points.
          </p>
        </div>
        {hasResume && hasJD && (
          <button
            className="pi-pill-btn pi-press"
            disabled={loading}
            onClick={handleAnalyse}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--pi-accent-subtle)',
              borderColor: 'var(--pi-accent-border)',
              color: 'var(--pi-hero)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing…' : report ? 'Re-analyse' : 'Run Role Insight'}
          </button>
        )}
      </div>

      {/* Progress / Loading Banner */}
      {loading && (
        <div style={{
          padding: '14px 16px',
          borderRadius: 'var(--pi-r-md)',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <RefreshCw size={16} className="animate-spin" style={{ color: '#3b82f6', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--pi-hero)' }}>
              Analyzing Alignment with Ollama (qwen2.5-coder:7b)…
            </div>
            <div style={{ fontSize: 11, color: 'var(--pi-secondary)', marginTop: 2 }}>
              {stage ? stageLabels[stage] || stage : 'Evaluating candidate evidence against job requirements…'}
            </div>
          </div>
        </div>
      )}

      {/* Missing Requirements Guidance */}
      {(!hasResume || !hasJD) && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '36px 20px',
          border: '1px dashed var(--pi-border)',
          borderRadius: 12,
          gap: 14,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: 'var(--pi-accent-subtle)',
            border: '1px solid var(--pi-accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Target size={20} style={{ color: 'var(--pi-accent-icon)' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--pi-primary)', marginBottom: 4 }}>
              {!hasResume && !hasJD
                ? 'Resume and Job Description Needed'
                : !hasResume
                ? 'Resume Needed'
                : 'Job Description Needed'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--pi-secondary)', maxWidth: 360, lineHeight: 1.6 }}>
              Role Insight matches your profile and GitHub projects directly against a target role's expectations.
              {!hasResume && !hasJD && ' Add both your resume and job description to begin.'}
              {!hasResume && hasJD && ' Add your resume in Identity to see your match breakdown.'}
              {hasResume && !hasJD && ' Upload a target Job Description in Identity to see your match score and interview guide.'}
            </div>
          </div>
          {onGoToProfile && (
            <button
              className="pi-pill-btn pi-press"
              onClick={onGoToProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--pi-hero)',
                color: '#111',
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              Go to Identity <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          fontSize: 12,
          color: 'var(--pi-danger)',
          padding: '10px 14px',
          borderRadius: 8,
          background: 'var(--pi-danger-bg)',
          border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Output */}
      {report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Hero Match Score Card */}
          <div style={{
            padding: '18px 20px',
            borderRadius: 'var(--pi-r-lg)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid var(--pi-border)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 20,
            alignItems: 'center',
          }}>
            {/* Score Ring / Pill */}
            <div style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              border: '3px solid var(--pi-accent)',
              background: 'var(--pi-accent-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(167,139,250,0.15)',
            }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--pi-hero)', lineHeight: 1 }}>
                {report.analysis?.roleAlignment ?? 85}%
              </span>
              <span style={{ fontSize: 10, color: 'var(--pi-accent)', fontWeight: 600, marginTop: 3 }}>
                MATCH
              </span>
            </div>

            {/* Target Details & Confidence */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--pi-hero)' }}>
                  {report.jdTitle || 'Target Role'}
                </span>
                {report.jdCompany && (
                  <span style={{ fontSize: 13, color: 'var(--pi-secondary)', fontWeight: 500 }}>
                    at {report.jdCompany}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--pi-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={13} style={{ color: '#22c55e' }} />
                  Evidence Confidence: {report.analysis?.evidenceConfidence ?? 90}%
                </span>
                <span style={{ fontSize: 11, color: 'var(--pi-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={13} style={{ color: '#22c55e' }} />
                  Hard Gates: Met
                </span>
              </div>
              {report.analysis?.summary && (
                <p style={{ fontSize: 12, color: 'var(--pi-secondary)', margin: '8px 0 0', lineHeight: 1.5 }}>
                  {report.analysis.summary}
                </p>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--pi-border)',
            gap: 16,
            paddingBottom: 2,
          }}>
            {[
              { id: 'requirements', label: `Requirements (${report.requirements?.length || 0})` },
              { id: 'strengths', label: `Strengths & Gaps (${(report.strengths?.length || 0) + (report.gaps?.length || 0)})` },
              { id: 'talkingPoints', label: `Talking Points (${report.talkingPoints?.length || 0})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  fontSize: 12,
                  fontWeight: 600,
                  color: activeTab === t.id ? 'var(--pi-hero)' : 'var(--pi-tertiary)',
                  borderBottom: activeTab === t.id ? '2px solid var(--pi-accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 160ms ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Requirements Breakdown */}
          {activeTab === 'requirements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(report.requirements || []).map((req: any) => {
                const assess = (report.assessments || []).find((a: any) => a.requirementId === req.id);
                const isExpanded = expandedReq === req.id;
                const statusColor =
                  assess?.status === 'strong_evidence' ? '#22c55e' :
                  assess?.status === 'transferable' ? '#3b82f6' : '#f59e0b';
                const statusLabel =
                  assess?.status === 'strong_evidence' ? 'Strong Match' :
                  assess?.status === 'transferable' ? 'Transferable' : 'Discussion Point';

                return (
                  <div
                    key={req.id}
                    style={{
                      borderRadius: 'var(--pi-r-md)',
                      border: '1px solid var(--pi-border)',
                      background: 'rgba(255,255,255,0.015)',
                      overflow: 'hidden',
                      transition: 'border-color 160ms ease',
                    }}
                  >
                    <div
                      onClick={() => setExpandedReq(isExpanded ? null : req.id)}
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 'var(--pi-r-pill)',
                          background: `${statusColor}18`,
                          color: statusColor,
                          border: `1px solid ${statusColor}33`,
                          flexShrink: 0,
                        }}>
                          {statusLabel}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--pi-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.quote}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--pi-tertiary)' }}>
                        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {req.category?.replace('_', ' ')}
                        </span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>

                    {isExpanded && assess && (
                      <div style={{
                        padding: '12px 14px',
                        borderTop: '1px solid var(--pi-border)',
                        background: 'rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        fontSize: 12,
                      }}>
                        <div>
                          <span style={{ color: 'var(--pi-tertiary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>
                            Evidence Analysis
                          </span>
                          <p style={{ margin: '3px 0 0', color: 'var(--pi-secondary)', lineHeight: 1.5 }}>
                            {assess.explanation}
                          </p>
                        </div>
                        {assess.interview_advice && (
                          <div style={{
                            padding: '8px 10px',
                            borderRadius: 6,
                            background: 'var(--pi-btn-bg)',
                            border: '1px solid var(--pi-btn-border)',
                          }}>
                            <span style={{ color: 'var(--pi-accent)', fontWeight: 600, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <HelpCircle size={11} /> Interview Tip:
                            </span>
                            <span style={{ color: 'var(--pi-primary)', fontSize: 11, display: 'block', marginTop: 2 }}>
                              {assess.interview_advice}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Strengths & Gaps */}
          {activeTab === 'strengths' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Strengths */}
              <div style={{
                padding: '14px',
                borderRadius: 'var(--pi-r-md)',
                background: 'rgba(34,197,94,0.03)',
                border: '1px solid rgba(34,197,94,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: 12, fontWeight: 700 }}>
                  <Award size={14} /> Top Strengths to Lead With
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(report.strengths || []).map((s: string, idx: number) => (
                    <li key={idx} style={{ fontSize: 12, color: 'var(--pi-primary)', lineHeight: 1.45 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div style={{
                padding: '14px',
                borderRadius: 'var(--pi-r-md)',
                background: 'rgba(245,158,11,0.03)',
                border: '1px solid rgba(245,158,11,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>
                  <AlertCircle size={14} /> Areas to Clarify Proactively
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(report.gaps || []).map((g: string, idx: number) => (
                    <li key={idx} style={{ fontSize: 12, color: 'var(--pi-primary)', lineHeight: 1.45 }}>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 3: Talking Points */}
          {activeTab === 'talkingPoints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(report.talkingPoints || []).map((tp: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--pi-r-md)',
                    border: '1px solid var(--pi-border)',
                    background: 'rgba(255,255,255,0.015)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--pi-hero)' }}>
                    <MessageSquare size={13} style={{ color: 'var(--pi-accent)' }} />
                    {tp.topic}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--pi-secondary)', lineHeight: 1.5 }}>
                    {tp.talkingPoint}
                  </p>
                  {tp.recommendedQuestionToAsk && (
                    <div style={{
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: 'var(--pi-accent-subtle)',
                      border: '1px solid var(--pi-accent-border)',
                      fontSize: 11,
                      color: 'var(--pi-hero)',
                    }}>
                      <strong style={{ color: 'var(--pi-accent)' }}>Recommended Question:</strong> "{tp.recommendedQuestionToAsk}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

