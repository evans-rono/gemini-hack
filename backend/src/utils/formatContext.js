// src/utils/formatContext.js
class ContextFormatter {
    static formatQuery(query) {
        return {
            original: query,
            cleaned: query.trim().replace(/\s+/g, ' '),
            length: query.length,
            timestamp: new Date().toISOString()
        };
    }

    static formatFindings(findings) {
        if (!Array.isArray(findings)) return [];

        return findings.map(f => ({
            id: f.id || `finding_${Date.now()}`,
            text: f.text,
            source: f.source || 'Unknown',
            credibility: f.credibility || 0.5,
            category: f.category || 'general',
            timestamp: f.timestamp || new Date().toISOString()
        }));
    }

    static formatSources(sources) {
        const unique = [...new Set(sources.map(s => s.url || s))];
        return unique.map(url => ({
            url,
            accessed: new Date().toISOString(),
            verified: false
        }));
    }

    static truncate(text, maxLength = 1000) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

module.exports = ContextFormatter;