// electron/services/TavilySearchService.ts
/**
 * TavilySearchService
 * Production-ready web search and live research integration powered by Tavily API.
 * Used for real-time interview answers, fact verification, company research, and source citations.
 */

import type { SearchProvider } from '../premium/contracts';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
  formattedResearch: string;
}

export const BASE_AUTHORITATIVE_DOMAINS = [
  'geeksforgeeks.org',
  'en.wikipedia.org',
  'w3schools.com',
];

export const TECHNOLOGY_OFFICIAL_DOMAINS_MAP: Record<string, string[]> = {
  // Machine Learning, Deep Learning & AI
  'pytorch': ['pytorch.org', 'docs.pytorch.org'],
  'torch': ['pytorch.org', 'docs.pytorch.org'],
  'torchvision': ['pytorch.org', 'docs.pytorch.org'],
  'torchaudio': ['pytorch.org', 'docs.pytorch.org'],
  'autograd': ['pytorch.org', 'docs.pytorch.org'],
  'tensorflow': ['tensorflow.org'],
  'tf': ['tensorflow.org'],
  'tensorboard': ['tensorflow.org'],
  'keras': ['keras.io', 'tensorflow.org'],
  'scikit-learn': ['scikit-learn.org'],
  'sklearn': ['scikit-learn.org'],
  'huggingface': ['huggingface.co'],
  'transformers': ['huggingface.co'],
  'tokenizers': ['huggingface.co'],
  'diffusers': ['huggingface.co'],
  'datasets': ['huggingface.co'],
  'xgboost': ['xgboost.readthedocs.io'],
  'lightgbm': ['lightgbm.readthedocs.io'],
  'catboost': ['catboost.ai'],
  'opencv': ['docs.opencv.org', 'opencv.org'],
  'cv2': ['docs.opencv.org', 'opencv.org'],
  'langchain': ['python.langchain.com', 'langchain.com'],
  'langgraph': ['langchain-ai.github.io', 'python.langchain.com'],
  'llamaindex': ['llamaindex.ai', 'docs.llamaindex.ai'],
  'numpy': ['numpy.org'],
  'pandas': ['pandas.pydata.org'],
  'scipy': ['scipy.org'],
  'matplotlib': ['matplotlib.org'],
  'seaborn': ['seaborn.pydata.org'],
  'nltk': ['nltk.org'],
  'spacy': ['spacy.io'],
  'gensim': ['radimrehurek.com'],
  'fastai': ['docs.fast.ai', 'fast.ai'],
  'onnx': ['onnx.ai', 'onnxruntime.ai'],
  'openvino': ['docs.openvino.ai', 'openvino.ai'],
  'deeplearning': ['deeplearning.ai', 'pytorch.org', 'tensorflow.org'],
  'llm': ['huggingface.co', 'pytorch.org'],
  'rag': ['python.langchain.com', 'llamaindex.ai'],

  // Programming Languages & Core Runtimes
  'python': ['docs.python.org', 'python.org'],
  'pip': ['docs.python.org', 'pypi.org'],
  'pydantic': ['docs.pydantic.dev'],
  'javascript': ['developer.mozilla.org'],
  'js': ['developer.mozilla.org'],
  'typescript': ['typescriptlang.org', 'developer.mozilla.org'],
  'ts': ['typescriptlang.org', 'developer.mozilla.org'],
  'java': ['docs.oracle.com', 'dev.java'],
  'jvm': ['docs.oracle.com'],
  'c++': ['cppreference.com', 'isocpp.org'],
  'cpp': ['cppreference.com', 'isocpp.org'],
  'c#': ['learn.microsoft.com'],
  'csharp': ['learn.microsoft.com'],
  'dotnet': ['learn.microsoft.com'],
  'golang': ['go.dev', 'golang.org'],
  'go': ['go.dev', 'golang.org'],
  'rust': ['rust-lang.org', 'doc.rust-lang.org'],
  'sql': ['w3schools.com', 'geeksforgeeks.org', 'postgresql.org'],
  'html': ['developer.mozilla.org', 'w3schools.com'],
  'css': ['developer.mozilla.org', 'w3schools.com'],
  'php': ['php.net', 'w3schools.com'],
  'ruby': ['ruby-lang.org'],
  'scala': ['scala-lang.org'],
  'kotlin': ['kotlinlang.org'],
  'swift': ['swift.org'],

  // Web Frameworks & Libraries
  'react': ['react.dev', 'reactjs.org'],
  'reactjs': ['react.dev', 'reactjs.org'],
  'nextjs': ['nextjs.org'],
  'next': ['nextjs.org'],
  'vue': ['vuejs.org'],
  'angular': ['angular.dev', 'angular.io'],
  'svelte': ['svelte.dev'],
  'nodejs': ['nodejs.org'],
  'node': ['nodejs.org'],
  'express': ['expressjs.com'],
  'expressjs': ['expressjs.com'],
  'fastapi': ['fastapi.tiangolo.com'],
  'flask': ['flask.palletsprojects.com'],
  'django': ['docs.djangoproject.com', 'djangoproject.com'],
  'spring': ['spring.io'],
  'springboot': ['spring.io'],
  'nestjs': ['nestjs.com'],
  'tailwind': ['tailwindcss.com'],
  'tailwindcss': ['tailwindcss.com'],
  'graphql': ['graphql.org'],

  // Databases & Storage
  'postgresql': ['postgresql.org'],
  'postgres': ['postgresql.org'],
  'mysql': ['dev.mysql.com', 'mysql.com'],
  'mongodb': ['mongodb.com'],
  'mongo': ['mongodb.com'],
  'redis': ['redis.io'],
  'sqlite': ['sqlite.org'],
  'cassandra': ['cassandra.apache.org'],
  'elasticsearch': ['elastic.co'],
  'neo4j': ['neo4j.com'],

  // Cloud, DevOps & Distributed Systems
  'docker': ['docs.docker.com', 'docker.com'],
  'kubernetes': ['kubernetes.io'],
  'k8s': ['kubernetes.io'],
  'git': ['git-scm.com'],
  'github': ['docs.github.com'],
  'linux': ['man7.org', 'kernel.org'],
  'bash': ['gnu.org', 'man7.org'],
  'spark': ['spark.apache.org'],
  'pyspark': ['spark.apache.org'],
  'kafka': ['kafka.apache.org'],
  'airflow': ['airflow.apache.org'],
  'nginx': ['nginx.org'],
  'aws': ['docs.aws.amazon.com'],
  'gcp': ['cloud.google.com'],
  'azure': ['learn.microsoft.com'],
};

export const SDE_OFFICIAL_DOMAINS = [
  ...BASE_AUTHORITATIVE_DOMAINS,
  'docs.python.org',
  'developer.mozilla.org',
  'martinfowler.com',
  'postgresql.org',
  'dev.mysql.com',
  'docs.oracle.com',
  'kubernetes.io',
  'docker.com',
  'spring.io',
  'learn.microsoft.com',
  'refactoring.guru',
];

export const AIML_OFFICIAL_DOMAINS = [
  ...BASE_AUTHORITATIVE_DOMAINS,
  'pytorch.org',
  'tensorflow.org',
  'scikit-learn.org',
  'huggingface.co',
  'docs.python.org',
  'deeplearning.ai',
  'arxiv.org',
  'numpy.org',
  'pandas.pydata.org',
  'fast.ai',
];

/**
 * Resolves official documentation domain(s) for a query.
 * If a technology is detected (e.g. PyTorch -> pytorch.org), that specific official domain
 * is placed first, combined with GeeksforGeeks, Wikipedia, and W3Schools.
 */
export function resolveOfficialDomainsForQuery(
  query: string,
  role?: string
): { targetDomains: string[]; detectedTech?: string; primaryOfficialDomain?: string } {
  const normalized = (query || '')
    .toLowerCase()
    .replace(/[^a-z0-9#+.\s-]/g, ' ')
    .trim();

  const words = normalized.split(/\s+/).filter(Boolean);

  let detectedTech: string | undefined;
  let techDomains: string[] = [];

  // 1. Multi-word or hyphenated keys first (e.g. scikit-learn, spring boot, next.js, etc.)
  for (const [key, domains] of Object.entries(TECHNOLOGY_OFFICIAL_DOMAINS_MAP)) {
    if (key.includes(' ') || key.includes('-') || key.includes('.')) {
      if (normalized.includes(key)) {
        detectedTech = key;
        techDomains = domains;
        break;
      }
    }
  }

  // 2. Single word tokens
  if (!detectedTech) {
    for (const word of words) {
      if (TECHNOLOGY_OFFICIAL_DOMAINS_MAP[word]) {
        detectedTech = word;
        techDomains = TECHNOLOGY_OFFICIAL_DOMAINS_MAP[word];
        break;
      }
    }
  }

  const primaryOfficialDomain = techDomains.length > 0 ? techDomains[0] : undefined;

  let combined: string[] = [];
  if (techDomains.length > 0) {
    // Official tech domains first, then base authoritative references (GFG, Wikipedia, W3Schools)
    combined = [...techDomains, ...BASE_AUTHORITATIVE_DOMAINS];
  } else {
    // Role-based or general default
    const isSde = role === 'sde' || role === 'sde-interview';
    const isAiml = role === 'aiml' || role === 'aiml-interview';
    if (isAiml) {
      combined = [...BASE_AUTHORITATIVE_DOMAINS, 'scikit-learn.org', 'pytorch.org', 'tensorflow.org', 'docs.python.org', 'huggingface.co', 'deeplearning.ai'];
    } else if (isSde) {
      combined = [...BASE_AUTHORITATIVE_DOMAINS, 'developer.mozilla.org', 'docs.python.org', 'postgresql.org', 'docs.oracle.com', 'martinfowler.com', 'refactoring.guru'];
    } else {
      combined = [...BASE_AUTHORITATIVE_DOMAINS, 'docs.python.org', 'developer.mozilla.org', 'pytorch.org'];
    }
  }

  // Deduplicate preserving order
  const seen = new Set<string>();
  const targetDomains: string[] = [];
  for (const d of combined) {
    if (!seen.has(d)) {
      seen.add(d);
      targetDomains.push(d);
    }
  }

  return { targetDomains, detectedTech, primaryOfficialDomain };
}

interface CacheEntry {
  timestamp: number;
  data: TavilySearchResponse;
}

export class TavilySearchService {
  private static instance: TavilySearchService | null = null;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache for interview session

  private constructor() {}

  public static getInstance(): TavilySearchService {
    if (!TavilySearchService.instance) {
      TavilySearchService.instance = new TavilySearchService();
    }
    return TavilySearchService.instance;
  }

  public getApiKey(): string | undefined {
    try {
      const { CredentialsManager } = require('./CredentialsManager');
      const cm = CredentialsManager.getInstance();
      const key = cm.getTavilyApiKey();
      if (key && key.trim()) return key.trim();
    } catch { /* ignore */ }
    return process.env.TAVILY_API_KEY?.trim() || undefined;
  }

  public hasApiKey(): boolean {
    return Boolean(this.getApiKey());
  }

  /**
   * Search Tavily with timeout protection, official domain filtering, and structured results.
   */
  public async search(
    query: string,
    options?: {
      maxResults?: number;
      searchDepth?: 'basic' | 'advanced';
      timeoutMs?: number;
      includeAnswer?: boolean;
      includeDomains?: string[];
      primaryOfficialDomain?: string;
      detectedTech?: string;
    }
  ): Promise<TavilySearchResponse | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery) return null;

    const domainHash = options?.includeDomains ? options.includeDomains.slice(0, 3).join(',') : 'all';
    const cacheKey = `${trimmedQuery.toLowerCase()}_${options?.searchDepth || 'basic'}_${options?.maxResults || 4}_${domainHash}_${options?.primaryOfficialDomain || ''}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const timeoutMs = options?.timeoutMs ?? 3500;

    try {
      const { tavily } = require('@tavily/core');
      const client = tavily({ apiKey });

      const searchParams: any = {
        searchDepth: options?.searchDepth || 'basic',
        maxResults: options?.maxResults || 4,
        includeAnswer: options?.includeAnswer ?? true,
      };

      if (options?.includeDomains && options.includeDomains.length > 0) {
        searchParams.includeDomains = options.includeDomains;
        searchParams.includeDomainsMode = 'restrict';
      }

      const searchPromise = client.search(trimmedQuery, searchParams);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Tavily search timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      const rawResponse: any = await Promise.race([searchPromise, timeoutPromise]);
      let rawResults = Array.isArray(rawResponse?.results) ? rawResponse.results : [];

      // If restrict mode returned no results, retry with prefer mode
      if (rawResults.length === 0 && searchParams.includeDomainsMode === 'restrict') {
        try {
          const fallbackParams = { ...searchParams, includeDomainsMode: 'prefer' };
          const fallbackRaw: any = await Promise.race([
            client.search(trimmedQuery, fallbackParams),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
          ]);
          if (Array.isArray(fallbackRaw?.results) && fallbackRaw.results.length > 0) {
            rawResults = fallbackRaw.results;
          }
        } catch { /* ignore fallback error */ }
      }

      let results: TavilySearchResult[] = rawResults.map((r: any) => ({
        title: String(r.title || 'Source').trim(),
        url: String(r.url || '').trim(),
        content: String(r.content || '').trim(),
        score: typeof r.score === 'number' ? r.score : undefined,
      })).filter((r: TavilySearchResult) => r.url.length > 0);

      // Client-side domain validation: ensure results belong to allowed official or authoritative domains
      if (options?.includeDomains && options.includeDomains.length > 0) {
        const allowed = options.includeDomains.map(d => d.toLowerCase());
        const filtered = results.filter(r => {
          try {
            const host = new URL(r.url).hostname.toLowerCase();
            return allowed.some(d => host === d || host.endsWith('.' + d));
          } catch {
            return false;
          }
        });
        if (filtered.length > 0) {
          results = filtered;
        }
      }

      // Prioritize the specific technology's official domain (e.g. pytorch.org) at the top
      if (options?.primaryOfficialDomain) {
        const primaryDomain = options.primaryOfficialDomain.toLowerCase();
        results.sort((a, b) => {
          const aIsPrimary = a.url.toLowerCase().includes(primaryDomain);
          const bIsPrimary = b.url.toLowerCase().includes(primaryDomain);
          if (aIsPrimary && !bIsPrimary) return -1;
          if (!aIsPrimary && bIsPrimary) return 1;
          return 0;
        });
      }

      const formattedResearch = this.formatResearchBlock(
        results,
        rawResponse?.answer,
        options?.detectedTech,
        options?.primaryOfficialDomain
      );

      const responseData: TavilySearchResponse = {
        query: trimmedQuery,
        results,
        answer: rawResponse?.answer || undefined,
        formattedResearch,
      };

      this.cache.set(cacheKey, { timestamp: Date.now(), data: responseData });
      return responseData;
    } catch (err: any) {
      console.warn('[TavilySearchService] Search failed or timed out:', err?.message || err);
      return null;
    }
  }

  /**
   * Specific search method optimized for live interview technical questions,
   * strictly retrieving from authoritative official documentation and verified pages.
   */
  public async searchForInterview(
    query: string,
    timeoutMs: number = 2500,
    role?: 'sde' | 'aiml' | 'sde-interview' | 'aiml-interview' | string
  ): Promise<TavilySearchResponse | null> {
    if (!this.hasApiKey()) return null;

    // Clean question to form a clear technical search query
    const cleaned = query
      .replace(/^(can you |please |could you |tell me |explain |what is |what are |how does |how do )/i, '')
      .replace(/[?!.,]/g, '')
      .trim();

    const searchQuery = cleaned.length >= 3 ? cleaned : query;

    const { targetDomains, detectedTech, primaryOfficialDomain } = resolveOfficialDomainsForQuery(query, role);

    return await this.search(searchQuery, {
      maxResults: 4,
      searchDepth: 'basic',
      timeoutMs,
      includeAnswer: true,
      includeDomains: targetDomains,
      primaryOfficialDomain,
      detectedTech,
    });
  }

  private formatResearchBlock(
    results: TavilySearchResult[],
    answer?: string,
    detectedTech?: string,
    primaryOfficialDomain?: string
  ): string {
    if (!results || results.length === 0) return '';

    const lines: string[] = [
      '# VERIFIED OFFICIAL DOCUMENTATION & REFERENCE SOURCES (Retrieved via Tavily Search):',
      'CRITICAL: Ground your technical response strictly on these verified official documentation sources and official pages (e.g. official docs like pytorch.org/docs.python.org/react.dev, GeeksforGeeks, Wikipedia, W3Schools).',
      'Do NOT make up facts or unverified assertions.',
      'Explain the concept in simple, conversational, humanized spoken English that the user can comfortably speak to the interviewer.',
      'Include a clear practical example and clean code/SQL.',
      'Cite these official sources inline using markdown citation links: [[1](url), [2](url)] corresponding to the source number.',
    ];

    if (answer) {
      lines.push(`\nAuthoritative Summary: ${answer.trim()}\n`);
    }

    results.forEach((r, idx) => {
      const num = idx + 1;
      let tag = 'Official Reference';
      try {
        const host = new URL(r.url).hostname.toLowerCase();
        if (primaryOfficialDomain && (host === primaryOfficialDomain || host.endsWith('.' + primaryOfficialDomain))) {
          tag = `Official Documentation - ${primaryOfficialDomain}`;
        } else if (host.includes('pytorch.org')) {
          tag = 'Official Documentation - pytorch.org';
        } else if (host.includes('python.org')) {
          tag = 'Official Documentation - docs.python.org';
        } else if (host.includes('scikit-learn.org')) {
          tag = 'Official Documentation - scikit-learn.org';
        } else if (host.includes('tensorflow.org')) {
          tag = 'Official Documentation - tensorflow.org';
        } else if (host.includes('react.dev') || host.includes('reactjs.org')) {
          tag = 'Official Documentation - react.dev';
        } else if (host.includes('geeksforgeeks.org')) {
          tag = 'GeeksforGeeks Interview Reference';
        } else if (host.includes('wikipedia.org')) {
          tag = 'Wikipedia Reference';
        } else if (host.includes('w3schools.com')) {
          tag = 'W3Schools Official Reference';
        } else {
          tag = `Official Source (${host})`;
        }
      } catch { /* ignore */ }

      lines.push(`Source [${num}] (${tag}):`);
      lines.push(`Title: ${r.title}`);
      lines.push(`URL: ${r.url}`);
      lines.push(`Content: ${r.content.slice(0, 450)}`);
      lines.push('');
    });

    return lines.join('\n');
  }
}

/**
 * TavilySearchProvider
 * Implements the SearchProvider interface consumed by CompanyResearchEngine and AOT pipeline.
 */
export class TavilySearchProvider implements SearchProvider {
  constructor(private apiKey: string) {}

  async search(query: string): Promise<unknown> {
    const service = TavilySearchService.getInstance();
    const res = await service.search(query, { searchDepth: 'advanced', maxResults: 5, timeoutMs: 5000 });
    return res?.results || [];
  }

  async extractUrl(url: string): Promise<unknown> {
    try {
      const { tavily } = require('@tavily/core');
      const client = tavily({ apiKey: this.apiKey });
      const res = await client.extract({ urls: [url] });
      return res?.results?.[0]?.rawContent || res?.results?.[0]?.content || '';
    } catch (e: any) {
      console.warn('[TavilySearchProvider] extractUrl failed:', e?.message || e);
      return '';
    }
  }
}
