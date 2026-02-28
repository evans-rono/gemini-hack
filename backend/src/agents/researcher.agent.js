// src/agents/researcher.agent.js
const BaseAgent = require('./base.agent');
const geminiService = require('../services/gemini.service');
const searchService = require('../services/search.service');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class ResearcherAgent extends BaseAgent {
    constructor(index = 1) {
        super(`Researcher-${index}`, 'researcher', [
            'web_search',
            'fact_extraction',
            'source_evaluation',
            'data_gathering'
        ]);
        this.index = index;
    }

    async execute(task) {
        const startTime = Date.now();
        this.status = 'busy';

        try {
            const { description, keywords } = task;

            logger.info(`Researcher ${this.index} working on: "${description.substring(0, 50)}..."`);

            // Real search via SearchService (Gemini-powered)
            const searchResults = await searchService.search(keywords, description);

            // Extract findings from search results
            const findings = await this.extractFindings(description, searchResults);

            // Evaluate source credibility
            const evaluatedFindings = await this.evaluateSources(findings);

            // Synthesize findings
            const synthesis = await this.synthesizeFindings(description, evaluatedFindings);

            const result = {
                taskId: task.id,
                agentId: this.id,
                description,
                findings: evaluatedFindings,
                summary: synthesis.summary,
                insights: synthesis.insights,
                sources: synthesis.sources,
                metadata: {
                    processingTime: Date.now() - startTime,
                    findingCount: evaluatedFindings.length,
                    sourceCount: synthesis.sources.length
                }
            };

            this.updateMetrics(true, Date.now() - startTime);
            this.status = 'idle';

            return { success: true, result };
        } catch (error) {
            logger.error(`Researcher ${this.index} error:`, error);
            this.updateMetrics(false, Date.now() - startTime);
            this.status = 'error';

            return { success: false, error: error.message, result: null };
        }
    }

    async extractFindings(description, searchResults) {
        const prompt = `
Extract key findings from these search results:

Research Task: "${description}"

Search Results:
${JSON.stringify(searchResults, null, 2)}

For each finding, provide:
1. The factual information
2. Source attribution
3. Category (statistic, expert_opinion, case_study, trend, background)
4. Confidence level (0-1)

Return a JSON array of findings:
[{ "text": "...", "source": "...", "category": "...", "confidence": 0.0 }]
`;

        const result = await geminiService.generateStructured(prompt, [{ text: 'string', source: 'string', category: 'string', confidence: 'number' }], {
            model: 'flash',
            temperature: 0.2
        });

        return result.success && Array.isArray(result.data) ? result.data : [];
    }

    async evaluateSources(findings) {
        return findings.map(finding => ({
            ...finding,
            credibility: this.assessCredibility(finding.source),
            verified: this.assessCredibility(finding.source) > 0.7,
            id: uuidv4()
        }));
    }

    assessCredibility(source) {
        if (!source) return 0.5;
        const credibleDomains = ['.edu', '.gov', '.org', 'nature.com', 'science.org', 'arxiv.org', 'reuters.com', 'who.int'];
        if (credibleDomains.some(domain => source.toLowerCase().includes(domain))) {
            return 0.9;
        }
        return 0.6;
    }

    async synthesizeFindings(description, findings) {
        const prompt = `
Synthesize these findings into a coherent summary:

Research Task: "${description}"

Findings:
${JSON.stringify(findings, null, 2)}

Create:
1. A concise summary of what was discovered
2. 3-5 key insights or takeaways
3. List of all unique sources (as URLs or names)

Return JSON: { "summary": "...", "insights": ["..."], "sources": ["..."] }
`;

        const result = await geminiService.generateStructured(prompt, { summary: 'string', insights: ['string'], sources: ['string'] }, {
            model: 'flash',
            temperature: 0.3
        });

        return result.success ? result.data : { summary: 'Synthesis unavailable', insights: [], sources: [] };
    }
}

module.exports = ResearcherAgent;