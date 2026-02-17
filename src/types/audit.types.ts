// audit.types.ts

// Type definitions for audit results
export interface AuditResult {
    id: string;
    timestamp: Date;
    status: string;
    details: string;
}

// Type definitions for website analysis data
export interface WebsiteAnalysis {
    url: string;
    loadTime: number;
    errors: string[];
    auditResults: AuditResult[];
}