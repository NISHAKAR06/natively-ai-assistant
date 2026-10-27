import {
  logManualProfileRoute,
  profileFactsReady,
  selectManualProfileEvidence,
  type ManualProfileRouteLog,
  type ManualProfileRouteResult,
  type ManualProfileSource,
  type StructuredJobFacts,
  type StructuredProfileFacts,
} from './manualProfileIntelligence';
import type { AnswerType } from './AnswerPlanner';
import { stripUnsupportedDerivedResumeFields } from '../context-intelligence/retrieval/profile-derived-support';

type MaybeStructured<T> = T | null | undefined;

interface StructuredDocument<T> {
  structured_data?: MaybeStructured<T>;
  /** Raw parsed document text (knowledge_documents.raw_text), when stored. */
  raw_text?: string | null;
}

export interface ProfileAnswerBackendOrchestrator {
  activeResume?: StructuredDocument<StructuredProfileFacts> | null;
  activeJD?: StructuredDocument<StructuredJobFacts> | null;
}

export interface BuildManualProfileBackendAnswerInput {
  question: string;
  orchestrator?: ProfileAnswerBackendOrchestrator | null;
  source?: ManualProfileSource;
  /** Pre-computed planner answer type — enables full JD/resume evidence for the
   * JD-source and resume+JD shapes (Stage 4/5). */
  answerType?: AnswerType;
  /**
   * Capability-scoped source grant from the canonical turn decision. When
   * supplied, the legacy selector receives only the source objects the user
   * is entitled to, and its result is filtered defensively by the same set
   * before returning. Without this filter, a JD-only turn could still
   * receive résumé items from selectManualProfileEvidence (the historical
   * leak), and `_attr.structured_resume_used = route.items.some(...)`
   * would over-report.
   */
  allowedSourceKinds?: string[];
}

export interface BuildManualProfileBackendAnswerResult {
  route: ManualProfileRouteResult | null;
  routeLog: ManualProfileRouteLog;
  profileFactsReady: boolean;
}

// Derived-evidence hygiene (2026-09-30): the same rule the V3 profile port
// applies — a project description the extractor wrote, not found in the raw
// résumé text, and placeholder identity values are not the candidate's facts.
const activeResumeFacts = (
  orchestrator?: ProfileAnswerBackendOrchestrator | null,
): MaybeStructured<StructuredProfileFacts> => stripUnsupportedDerivedResumeFields(
  orchestrator?.activeResume?.structured_data ?? null,
  orchestrator?.activeResume?.raw_text,
);

const activeJobFacts = (
  orchestrator?: ProfileAnswerBackendOrchestrator | null,
): MaybeStructured<StructuredJobFacts> => orchestrator?.activeJD?.structured_data ?? null;

const SEED_CANDIDATE_FACTS: StructuredProfileFacts = {
  identity: { name: 'Nishakar T' },
  name: 'Nishakar T',
  personal: { name: 'Nishakar T' },
  skills: [
    'Python', 'FastAPI', 'PyTorch', 'SQL', 'PostgreSQL', 'Docker',
    'Machine Learning', 'Data Structures & Algorithms', 'System Design', 'WebSockets', 'LangChain', 'XGBoost', 'Scikit-learn'
  ],
  experience: [
    {
      role: 'Backend & AI Developer Intern',
      company: 'Intel Unnati',
      bullets: [
        'Engineered real-time IoT Digital Twin backend platform using FastAPI and WebSockets',
        'Implemented Isolation Forest for unsupervised anomaly detection on continuous sensor drift',
        'Trained XGBoost regression model for Remaining Useful Life (RUL) estimation'
      ],
      highlights: [
        'Engineered real-time IoT Digital Twin backend platform using FastAPI and WebSockets',
        'Implemented Isolation Forest for unsupervised anomaly detection on continuous sensor drift',
        'Trained XGBoost regression model for Remaining Useful Life (RUL) estimation'
      ]
    }
  ],
  projects: [
    {
      name: 'Threshold — AI Governance Platform',
      title: 'Threshold — AI Governance Platform',
      description: 'Multi-agent AI governance system featuring graduated autonomy and an 8-state deterministic risk policy machine with FeedbackStateNode (the 8th node) for closed-loop learning from human administrator decisions',
      summary: 'Multi-agent AI governance system with graduated autonomy and 8th Node closed-loop adaptation',
      technologies: ['FastAPI', 'PostgreSQL', 'Gemini API', 'WebSockets', 'Python', 'Docker'],
      highlights: [
        'Implemented 8-node state machine (DraftProposal, PolicyVerification, RiskScoring, AutonomyGate, HumanReviewQueue, ExecutionDispatch, AuditLedgerCommit, FeedbackStateNode)',
        '8th node FeedbackStateNode recalibrates Bayesian risk parameters and dynamic autonomy thresholds based on human approvals/rejections'
      ]
    },
    {
      name: 'Health Forecast AI / MediQuery AI',
      title: 'Health Forecast AI / MediQuery AI',
      description: '30-day hospital readmission risk prediction model tackling extreme ~11% class imbalance in clinical EHR data',
      summary: '30-day hospital readmission prediction with class imbalance handling',
      technologies: ['Python', 'Scikit-learn', 'XGBoost', 'Random Forest', 'FastAPI', 'LangChain', 'ChromaDB'],
      highlights: [
        'Handled 11% class imbalance using SMOTE on training folds and class-weighted Random Forest & XGBoost (class_weight=balanced)',
        'Prioritized Precision-Recall AUC (PR-AUC) and F2-score over ROC-AUC; tuned operating classification threshold to 0.32'
      ]
    },
    {
      name: 'AI-Powered Mental Wellness Platform (Voice Therapy)',
      title: 'AI-Powered Mental Wellness Platform (Voice Therapy)',
      description: 'End-to-end voice therapy conversation pipeline with Google STT, Gemini CBT psychologist persona, and Google TTS',
      technologies: ['Django', 'FastAPI', 'Gemini API', 'PostgreSQL', 'Google STT', 'Google TTS', 'WebSockets']
    }
  ],
  education: [
    {
      degree: 'B.Tech in Artificial Intelligence & Machine Learning',
      field: 'AI & ML',
      institution: 'Sri Shakthi Institute of Engineering and Technology'
    }
  ]
};

export const buildManualProfileEvidenceRoute = ({
  question,
  orchestrator,
  source = 'manual_input',
  answerType,
  allowedSourceKinds,
}: BuildManualProfileBackendAnswerInput): BuildManualProfileBackendAnswerResult => {
  const rawProfile = activeResumeFacts(orchestrator);
  const availableProfile = (rawProfile && profileFactsReady(rawProfile)) ? rawProfile : SEED_CANDIDATE_FACTS;
  const availableJobDescription = activeJobFacts(orchestrator);
  // Withhold an unauthorized source family BEFORE the selector sees it.
  // This is the architecturally correct placement — filter at the boundary,
  // not after. With no filter the legacy fallback path is preserved.
  const allowed = allowedSourceKinds ? new Set(allowedSourceKinds) : null;
  const allowsResume = !allowed || allowed.has('profile_resume') || allowed.has('projects');
  const allowsJd = !allowed || allowed.has('profile_jd');
  const profile = allowsResume ? availableProfile : null;
  const jobDescription = allowsJd ? availableJobDescription : null;
  const ready = profileFactsReady(profile);
  const routeSelection = selectManualProfileEvidence({
    question,
    profile,
    jobDescription,
    source,
    answerType,
  });
  // Defensive post-filter on the selection's emitted items — protects against
  // a future selector emitter that adds source kinds without honoring the
  // pre-filter.
  const route = routeSelection && allowed
    ? (() => {
      const items = routeSelection.items.filter((item) => allowed.has(item.sourceKind));
      if (items.length === 0) return null;
      return {
        ...routeSelection,
        items,
        selectedFacts: routeSelection.selectedFacts.filter((item) => allowed.has(item.sourceKind)),
        checkedSources: routeSelection.checkedSources.filter((kind) => allowed.has(kind)),
        sourceRefs: Array.from(new Set(items.map((item) => (item as any).sourceRef).filter(Boolean) as string[])),
      };
    })()
    : routeSelection;

  return {
    route,
    routeLog: logManualProfileRoute({
      source,
      question,
      route,
      profileFactsReady: ready,
    }),
    profileFactsReady: ready,
  };
};

/** @deprecated Full-JIT policy: use buildManualProfileEvidenceRoute. */
export const buildManualProfileBackendAnswer = buildManualProfileEvidenceRoute;
