import React from 'react';

interface AuditResult {
    id: number;
    description: string;
    severity: 'low' | 'medium' | 'high';
}

interface AuditResultsProps {
    results: AuditResult[];
}

const AuditResults: React.FC<AuditResultsProps> = ({ results }) => {
    return (
        <div>
            <h1>Audit Results</h1>
            <ul>
                {results.map(result => (
                    <li key={result.id} style={{ color: getSeverityColor(result.severity) }}>
                        {result.description} (Severity: {result.severity})
                    </li>
                ))}
            </ul>
        </div>
    );
};

const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
        case 'low': return 'green';
        case 'medium': return 'orange';
        case 'high': return 'red';
        default: return 'black';
    }
};

export default AuditResults;
