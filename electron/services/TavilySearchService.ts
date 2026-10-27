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

export const SDE_OFFICIAL_DOMAINS = [
  'geeksforgeeks.org',
  'w3schools.com',
  'docs.python.org',
  'developer.mozilla.org',
  'en.wikipedia.org',
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
  'geeksforgeeks.org',
  'w3schools.com',
  'pytorch.org',
  'tensorflow.org',
  'scikit-learn.org',
  'huggingface.co',
  'docs.python.org',
  'deeplearning.ai',
  'en.wikipedia.org',
  'arxiv.org',
  'numpy.org',
  'pandas.pydata.org',
  'fast.ai',
];

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
    }
  ): Promise<TavilySearchResponse | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery) return null;

    const domainHash = options?.includeDomains ? options.includeDomains.slice(0, 3).join(',') : 'all';
    const cacheKey = `${trimmedQuery.toLowerCase()}_${options?.searchDepth || 'basic'}_${options?.maxResults || 3}_${domainHash}`;
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
        maxResults: options?.maxResults || 3,
        includeAnswer: options?.includeAnswer ?? true,
      };

      if (options?.includeDomains && options.includeDomains.length > 0) {
        searchParams.includeDomains = options.includeDomains;
        searchParams.includeDomainsMode = 'prefer';
      }

      const searchPromise = client.search(trimmedQuery, searchParams);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Tavily search timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      const rawResponse: any = await Promise.race([searchPromise, timeoutPromise]);
      const rawResults = Array.isArray(rawResponse?.results) ? rawResponse.results : [];

      const results: TavilySearchResult[] = rawResults.map((r: any) => ({
        title: String(r.title || 'Source').trim(),
        url: String(r.url || '').trim(),
        content: String(r.content || '').trim(),
        score: typeof r.score === 'number' ? r.score : undefined,
      })).filter((r: TavilySearchResult) => r.url.length > 0);

      const formattedResearch = this.formatResearchBlock(results, rawResponse?.answer);

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

    let includeDomains: string[] | undefined;
    const isSde = role === 'sde' || role === 'sde-interview';
    const isAiml = role === 'aiml' || role === 'aiml-interview';

    if (isSde) {
      includeDomains = SDE_OFFICIAL_DOMAINS;
    } else if (isAiml) {
      includeDomains = AIML_OFFICIAL_DOMAINS;
    } else {
      includeDomains = ['geeksforgeeks.org', 'w3schools.com', 'docs.python.org', 'developer.mozilla.org', 'pytorch.org'];
    }

    return await this.search(searchQuery, {
      maxResults: 4,
      searchDepth: 'basic',
      timeoutMs,
      includeAnswer: true,
      includeDomains,
    });
  }

  private formatResearchBlock(results: TavilySearchResult[], answer?: string): string {
    if (!results || results.length === 0) return '';

    const lines: string[] = [
      '# VERIFIED OFFICIAL DOCUMENTATION SOURCES (Retrieved via Tavily Search):',
      'CRITICAL: Ground your technical response strictly on these verified official documentation sources and official pages (e.g. GeeksforGeeks, W3Schools, Python/PyTorch/MDN docs).',
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
      lines.push(`Source [${num}]:`);
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
