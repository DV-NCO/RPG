import axios from 'axios';
import * as cheerio from 'cheerio';

export interface MetaTags {
  title: string | null;
  description: string | null;
  keywords: string | null;
  viewport: string | null;
  charset: string | null;
}

export interface HeadingStructure {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h1s: string[];
}

export interface ImageAnalysis {
  totalImages: number;
  imagesWithoutAlt: number;
  images: Array<{ src: string; alt: string | null }>;
}

export interface LinkAnalysis {
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  links: Array<{ href: string; text: string; type: string }>;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  pageSize: number;
  totalRequests: number;
}

export interface WebsiteAuditData {
  url: string;
  statusCode: number;
  metaTags: MetaTags;
  headingStructure: HeadingStructure;
  imageAnalysis: ImageAnalysis;
  linkAnalysis: LinkAnalysis;
  performanceMetrics: PerformanceMetrics;
  mobileOptimized: boolean;
  issues: string[];
  score: number;
  timestamp: Date;
}

class WebsiteAnalyzer {
  async fetchWebsite(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch website: ${error}`);
    }
  }

  extractMetaTags($: any): MetaTags {
    return {
      title: $('title').text() || null,
      description: $('meta[name="description"]').attr('content') || null,
      keywords: $('meta[name="keywords"]').attr('content') || null,
      viewport: $('meta[name="viewport"]').attr('content') || null,
      charset: $('meta[charset]').attr('charset') || null
    };
  }

  analyzeHeadings($: any): HeadingStructure {
    const h1s = $('h1').map((_, el) => $(el).text()).get();
    return {
      h1Count: $('h1').length,
      h2Count: $('h2').length,
      h3Count: $('h3').length,
      h1s: h1s
    };
  }

  analyzeImages($: any): ImageAnalysis {
    const images: Array<{ src: string; alt: string | null }> = [];
    let imagesWithoutAlt = 0;

    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      
      if (!alt || alt.trim() === '') {
        imagesWithoutAlt++;
      }

      images.push({ src: src || '', alt: alt || null });
    });

    return {
      totalImages: images.length,
      imagesWithoutAlt,
      images
    };
  }

  analyzeLinks($: any, baseUrl: string): LinkAnalysis {
    const links: Array<{ href: string; text: string; type: string }> = [];
    let internalLinks = 0;
    let externalLinks = 0;

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text();

      if (!href) return;

      if (href.startsWith('http') && !href.includes(new URL(baseUrl).hostname)) {
        externalLinks++;
        links.push({ href, text, type: 'external' });
      } else if (!href.startsWith('http')) {
        internalLinks++;
        links.push({ href, text, type: 'internal' });
      } else {
        internalLinks++;
        links.push({ href, text, type: 'internal' });
      }
    });

    return {
      internalLinks,
      externalLinks,
      brokenLinks: 0,
      links
    };
  }

  checkMobileOptimization($: any): boolean {
    const viewport = $('meta[name="viewport"]').attr('content');
    return viewport ? viewport.includes('width=device-width') : false;
  }

  identifyIssues(data: Partial<WebsiteAuditData>): string[] {
    const issues: string[] = [];

    if (!data.metaTags?.title) {
      issues.push('Missing page title');
    } else if (data.metaTags.title.length < 30) {
      issues.push('Page title is too short (recommended: 30-60 characters)');
    } else if (data.metaTags.title.length > 60) {
      issues.push('Page title is too long (recommended: 30-60 characters)');
    }

    if (!data.metaTags?.description) {
      issues.push('Missing meta description');
    } else if (data.metaTags.description.length < 120) {
      issues.push('Meta description is too short (recommended: 120-160 characters)');
    } else if (data.metaTags.description.length > 160) {
      issues.push('Meta description is too long (recommended: 120-160 characters)');
    }

    if (!data.headingStructure?.h1Count) {
      issues.push('Missing H1 tag');
    } else if (data.headingStructure.h1Count > 1) {
      issues.push('Multiple H1 tags found (should only have one)');
    }

    if (!data.mobileOptimized) {
      issues.push('Website is not mobile optimized');
    }

    if (data.imageAnalysis && data.imageAnalysis.imagesWithoutAlt > 0) {
      issues.push(`${data.imageAnalysis.imagesWithoutAlt} images missing alt text`);
    }

    if (!data.metaTags?.viewport) {
      issues.push('Missing viewport meta tag');
    }

    return issues;
  }

  calculateScore(issues: string[]): number {
    const maxScore = 100;
    const deduction = issues.length * 5;
    return Math.max(0, maxScore - deduction);
  }

  async auditWebsite(url: string): Promise<WebsiteAuditData> {
    try {
      const startTime = Date.now();
      
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      const html = await this.fetchWebsite(url);
      const $ = cheerio.load(html);

      const metaTags = this.extractMetaTags($);
      const headingStructure = this.analyzeHeadings($);
      const imageAnalysis = this.analyzeImages($);
      const linkAnalysis = this.analyzeLinks($, url);
      const mobileOptimized = this.checkMobileOptimization($);

      const auditData: Partial<WebsiteAuditData> = {
        url,
        statusCode: 200,
        metaTags,
        headingStructure,
        imageAnalysis,
        linkAnalysis,
        mobileOptimized,
        performanceMetrics: {
          pageLoadTime: Date.now() - startTime,
          pageSize: html.length,
          totalRequests: $('img').length + $('script').length + $('link[rel="stylesheet"]').length
        },
        timestamp: new Date()
      };

      auditData.issues = this.identifyIssues(auditData);
      auditData.score = this.calculateScore(auditData.issues);

      return auditData as WebsiteAuditData;
    } catch (error) {
      throw new Error(`Website audit failed: ${error}`);
    }
  }
}

export default new WebsiteAnalyzer();