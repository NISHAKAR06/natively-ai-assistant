import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { app } from 'electron';
import { extractSafeDocumentText } from '../SafeDocumentTextExtractor';

export enum DocType {
  RESUME = 'resume',
  JD = 'jd',
}

interface ProfileIdentity {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  totalExperienceYears?: number;
}

interface ProfileExperience {
  role: string;
  company: string;
  duration?: string;
  highlights: string[];
}

interface ProfileProject {
  name: string;
  description: string;
  technologies: string[];
  highlights: string[];
}

interface ProfileEducation {
  degree: string;
  field: string;
  institution: string;
}

interface StructuredResume {
  identity: ProfileIdentity;
  experience: ProfileExperience[];
  skills: string[];
  skillsFlat: string[];
  projects: ProfileProject[];
  education: ProfileEducation[];
  _extraction_mode: 'heuristic' | 'llm';
}

interface StructuredJD {
  title: string;
  role: string;
  company: string;
  description_summary: string;
  requirements: string[];
  skills: string[];
}

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
  'Swift', 'Kotlin', 'SQL', 'HTML', 'CSS', 'React', 'React Native', 'Next.js', 'Vue', 'Angular',
  'Node.js', 'Express', 'NestJS', 'Django', 'FastAPI', 'Flask', 'Spring Boot', 'GraphQL',
  'REST APIs', 'Microservices', 'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis',
  'Cassandra', 'DynamoDB', 'Elasticsearch', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Terraform', 'CI/CD', 'Git', 'Linux', 'Kafka', 'RabbitMQ', 'PyTorch', 'TensorFlow',
  'Scikit-learn', 'Pandas', 'NumPy', 'Machine Learning', 'Deep Learning', 'LLMs', 'RAG',
  'System Design', 'Unit Testing', 'Tailwind', 'Redux', 'Electron'
];

export class LocalKnowledgeOrchestrator {
  public activeResume: {
    id: number;
    file_path: string;
    file_name: string;
    raw_text: string;
    structured_data: StructuredResume;
  } | null = null;

  public activeJD: {
    id: number;
    file_path: string;
    file_name: string;
    raw_text: string;
    structured_data: StructuredJD;
  } | null = null;

  private knowledgeMode = true;
  private storagePath: string;

  constructor(private dbOrHandle?: any) {
    try {
      this.storagePath = path.join(app.getPath('userData'), 'profile_knowledge.json');
    } catch {
      const baseDir = process.env.APPDATA || process.env.HOME || os.tmpdir();
      this.storagePath = path.join(baseDir, 'natively', 'profile_knowledge.json');
    }
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.activeResume) this.activeResume = parsed.activeResume;
        if (parsed.activeJD) this.activeJD = parsed.activeJD;
        if (typeof parsed.knowledgeMode === 'boolean') this.knowledgeMode = parsed.knowledgeMode;
        console.log('[LocalKnowledgeOrchestrator] Loaded profile from disk:', {
          hasResume: Boolean(this.activeResume),
          hasJD: Boolean(this.activeJD),
        });
      }
    } catch (err) {
      console.warn('[LocalKnowledgeOrchestrator] Could not load profile cache:', err);
    }
  }

  private saveToDisk(): void {
    try {
      const data = {
        activeResume: this.activeResume,
        activeJD: this.activeJD,
        knowledgeMode: this.knowledgeMode,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn('[LocalKnowledgeOrchestrator] Could not persist profile cache:', err);
    }
  }

  public async ingestDocument(
    filePath: string,
    docType: DocType | string
  ): Promise<{ success: boolean; document?: any; error?: string }> {
    try {
      console.log(`[LocalKnowledgeOrchestrator] Ingesting ${docType} from: ${filePath}`);
      const extracted = await extractSafeDocumentText(filePath);
      const content = extracted.content || '';
      const fileName = path.basename(filePath);

      if (!content.trim()) {
        return { success: false, error: 'Document appears to be empty or unreadable.' };
      }

      const isResume = String(docType).toLowerCase().includes('resume');

      if (isResume) {
        const structured = this.parseResumeText(content, fileName);
        this.activeResume = {
          id: 1,
          file_path: filePath,
          file_name: fileName,
          raw_text: content,
          structured_data: structured,
        };
        this.saveToDisk();
        this.indexIntoLocalRAG('resume', content, fileName);
        return { success: true, document: { id: 1, type: DocType.RESUME, name: fileName } };
      } else {
        const structured = this.parseJdText(content, fileName);
        this.activeJD = {
          id: 2,
          file_path: filePath,
          file_name: fileName,
          raw_text: content,
          structured_data: structured,
        };
        this.saveToDisk();
        this.indexIntoLocalRAG('jd', content, fileName);
        return { success: true, document: { id: 2, type: DocType.JD, name: fileName } };
      }
    } catch (error: any) {
      console.error('[LocalKnowledgeOrchestrator] Ingest failed:', error);
      return { success: false, error: error.message || 'Failed to parse document' };
    }
  }

  private parseResumeText(text: string, fallbackFileName: string): StructuredResume {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    // 1. Name heuristic
    let name = '';
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (
        line.length > 2 &&
        line.length < 40 &&
        !line.includes('@') &&
        !line.includes('http') &&
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('curriculum') &&
        !line.includes('|')
      ) {
        name = line.replace(/[^\w\s.-]/g, '').trim();
        break;
      }
    }
    if (!name) {
      name = path.parse(fallbackFileName).name.replace(/[-_]/g, ' ');
    }

    // 2. Role heuristic
    let role = 'Software Professional';
    const roleKeywords = [
      'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer',
      'Backend Engineer', 'Frontend Engineer', 'DevOps Engineer', 'System Architect',
      'Data Engineer', 'Data Scientist', 'Machine Learning Engineer', 'Engineering Lead'
    ];
    for (const rk of roleKeywords) {
      if (new RegExp(`\\b${rk}\\b`, 'i').test(text)) {
        role = rk;
        break;
      }
    }

    // 3. Contact & Location
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : undefined;

    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : undefined;

    const locationMatch = text.match(/\b([A-Z][a-zA-Z\s]+,\s*[A-Z]{2,}|Remote|Bengaluru|San Francisco|New York|London|Seattle|Austin|India|USA)\b/);
    const location = locationMatch ? locationMatch[0] : undefined;

    // 4. Skills extraction
    const foundSkills = new Set<string>();
    const lowerText = text.toLowerCase();
    for (const skill of COMMON_SKILLS) {
      const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(text)) {
        foundSkills.add(skill);
      }
    }
    const skillsList = Array.from(foundSkills);
    if (skillsList.length === 0) {
      skillsList.push('Problem Solving', 'Software Engineering', 'System Architecture');
    }

    // 5. Experience years
    let totalExperienceYears = 3;
    const yearMatches = Array.from(text.matchAll(/\b(20\d{2})\b/g)).map((m) => parseInt(m[1], 10));
    if (yearMatches.length >= 2) {
      const minYear = Math.min(...yearMatches);
      const maxYear = Math.max(...yearMatches);
      const diff = maxYear - minYear;
      if (diff > 0 && diff <= 30) {
        totalExperienceYears = diff;
      }
    }

    // 6. Summary
    let summary = '';
    for (const line of lines.slice(0, 15)) {
      if (line.length > 50 && !line.includes('@') && !line.includes('http')) {
        summary = line;
        break;
      }
    }
    if (!summary) {
      summary = `${name} is an experienced ${role} with strong background in ${skillsList.slice(0, 4).join(', ')}.`;
    }

    // 7. Experience items
    const expList: ProfileExperience[] = [
      {
        role,
        company: 'Key Experience',
        duration: `${totalExperienceYears} years`,
        highlights: lines.filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*')).slice(0, 5),
      },
    ];

    return {
      identity: {
        name,
        role,
        email,
        phone,
        location,
        summary,
        totalExperienceYears,
      },
      experience: expList,
      skills: skillsList,
      skillsFlat: skillsList,
      projects: [],
      education: [],
      _extraction_mode: 'heuristic',
    };
  }

  private parseJdText(text: string, fallbackFileName: string): StructuredJD {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    let title = 'Target Role';
    for (const line of lines.slice(0, 5)) {
      if (line.length > 3 && line.length < 60 && !line.includes('http')) {
        title = line;
        break;
      }
    }

    let company = 'Target Company';
    const companyMatch = text.match(/\b(?:at|for|with)\s+([A-Z][A-Za-z0-9&.\s]{2,25})\b/);
    if (companyMatch) {
      company = companyMatch[1].trim();
    } else {
      company = path.parse(fallbackFileName).name.replace(/[-_]/g, ' ');
    }

    const foundSkills = new Set<string>();
    for (const skill of COMMON_SKILLS) {
      const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(text)) {
        foundSkills.add(skill);
      }
    }

    return {
      title,
      role: title,
      company,
      description_summary: text.slice(0, 400),
      requirements: lines.filter((l) => l.startsWith('•') || l.startsWith('-')).slice(0, 6),
      skills: Array.from(foundSkills),
    };
  }

  private indexIntoLocalRAG(kind: 'resume' | 'jd', content: string, fileName: string): void {
    try {
      const { DatabaseManager } = require('../../db/DatabaseManager');
      const db = DatabaseManager.getInstance().getDb();
      if (!db) return;

      const meetingId = `profile-knowledge-${kind}`;
      db.prepare(
        `INSERT OR REPLACE INTO meetings (id, title, start_time, duration_ms, created_at, summary_status)
         VALUES (?, ?, ?, 0, ?, 'complete')`
      ).run(meetingId, `Profile: ${fileName}`, new Date().toISOString(), new Date().toISOString());

      const chunks = content.split(/\n\s*\n/).map((s) => s.trim()).filter((s) => s.length > 30);
      for (let i = 0; i < Math.min(chunks.length, 10); i++) {
        const chunkText = chunks[i];
        const tokenEst = Math.ceil(chunkText.split(/\s+/).length * 1.3);
        const existing = db.prepare('SELECT id FROM chunks WHERE meeting_id = ? AND chunk_index = ?').get(meetingId, i);
        if (existing) {
          db.prepare('UPDATE chunks SET cleaned_text = ?, token_count = ? WHERE id = ?').run(chunkText, tokenEst, existing.id);
        } else {
          db.prepare(
            `INSERT INTO chunks (meeting_id, chunk_index, speaker, start_timestamp_ms, end_timestamp_ms, cleaned_text, token_count)
             VALUES (?, ?, 'profile', 0, 0, ?, ?)`
          ).run(meetingId, i, chunkText, tokenEst);
        }
      }
      console.log(`[LocalKnowledgeOrchestrator] Indexed ${chunks.length} ${kind} chunks into natively.db`);
    } catch (e) {
      console.warn('[LocalKnowledgeOrchestrator] RAG chunk index skipped (non-fatal):', e);
    }
  }

  public getStatus(): {
    hasResume: boolean;
    hasActiveJD: boolean;
    activeMode: boolean;
    resumeSummary: {
      name: string;
      role: string;
      totalExperienceYears: number;
    } | null;
  } {
    const hasResume = Boolean(this.activeResume?.structured_data);
    const hasActiveJD = Boolean(this.activeJD?.structured_data);
    const id = this.activeResume?.structured_data?.identity;

    return {
      hasResume,
      hasActiveJD,
      activeMode: this.knowledgeMode,
      resumeSummary: id
        ? {
            name: id.name || 'Candidate',
            role: id.role || 'Software Professional',
            totalExperienceYears: id.totalExperienceYears || 3,
          }
        : null,
    };
  }

  public getProfileData(): any {
    if (!this.activeResume && !this.activeJD) return null;
    const res = this.activeResume?.structured_data;
    const jd = this.activeJD?.structured_data;

    return {
      identity: res?.identity || null,
      experience: res?.experience || [],
      skillsFlat: res?.skillsFlat || [],
      skills: res?.skills || [],
      projects: res?.projects || [],
      education: res?.education || [],
      hasResume: Boolean(res),
      hasActiveJD: Boolean(jd),
      activeResume: res || null,
      activeJD: jd || null,
    };
  }

  public deleteDocumentsByType(docType: DocType | string): void {
    const dt = String(docType).toLowerCase();
    if (dt.includes('resume')) {
      this.activeResume = null;
      console.log('[LocalKnowledgeOrchestrator] Deleted active resume');
    }
    if (dt.includes('jd')) {
      this.activeJD = null;
      console.log('[LocalKnowledgeOrchestrator] Deleted active job description');
    }
    this.saveToDisk();
  }

  public setKnowledgeMode(enabled: boolean): void {
    this.knowledgeMode = enabled;
    this.saveToDisk();
    console.log(`[LocalKnowledgeOrchestrator] Knowledge mode set to: ${enabled}`);
  }

  public isKnowledgeMode(): boolean {
    return this.knowledgeMode;
  }

  public isIngesting(_docType: any): boolean {
    return false;
  }

  public getAOTPipeline(): { isRunning: () => boolean } {
    return { isRunning: () => false };
  }

  public getCompanyResearchEngine(): { getCachedDossier: (company: string) => any } {
    return { getCachedDossier: () => null };
  }

  public getNegotiationTracker(): { getState: () => { stage: string } } {
    return { getState: () => ({ stage: 'idle' }) };
  }

  public resetNegotiationSession(): void {}
  public getRoleInsightService(): any { return null; }
  public getNegotiationScript(): any { return null; }
  public generateNegotiationScriptOnDemand(): Promise<any> { return Promise.resolve(null); }
  public getCoverLetter(): any { return null; }
  public generateCoverLetterOnDemand(): Promise<any> { return Promise.resolve(null); }
  public attachRoleInsight(_db: any): void {}
  public setGenerateContentFn(_fn: any): void {}
  public setLiveCoachingContentFn(_fn: any): void {}
  public setSearchProviderResolver(_fn: any): void {}
  public setCompanyResearchAllowedFn(_fn: any): void {}
  public setEmbedFn(_fn: any): void {}
  public setEmbedWithMetadataFn(_fn: any): void {}
  public setEmbedBatchWithMetadataFn(_fn: any): void {}
  public setActiveSpaceFn(_fn: any): void {}
  public setEmbedQueryFn(_fn: any): void {}
  public setConversationContextProvider(_fn: any): void {}
  public ensureEmbeddingSpace(): Promise<void> { return Promise.resolve(); }

  public async processQuestion(question: string): Promise<{ relevantFacts: string; sources: string[] } | null> {
    if (!this.knowledgeMode || !this.activeResume?.structured_data) return null;
    const id = this.activeResume.structured_data.identity;
    const skills = (this.activeResume.structured_data.skillsFlat || []).slice(0, 10).join(', ');
    const exp = (this.activeResume.structured_data.experience || [])
      .map((e) => `${e.role} at ${e.company} (${e.duration || ''})`)
      .join('\n');

    return {
      relevantFacts: `Candidate Name: ${id.name}\nTitle: ${id.role}\nSkills: ${skills}\nExperience:\n${exp}`,
      sources: [this.activeResume.file_name || 'Resume'],
    };
  }
}
