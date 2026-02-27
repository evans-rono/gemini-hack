// src/agents/researcher.agent.js
const BaseAgent = require('./base.agent');
const geminiService = require('../services/gemini.service');
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
            const { description, keywords, priority, context } = task;
            
            logger.info(`Researcher ${this.index} working on: "${description.substring(0, 50)}..."`);

            // Simulate web search (in production, integrate with actual search API)
            const searchResults = await this.simulateSearch(keywords);

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

            return {
                success: true,
                result
            };

        } catch (error) {
            logger.error(`Researcher ${this.index} error:`, error);
            this.updateMetrics(false, Date.now() - startTime);
            this.status = 'error';

            return {
                success: false,
                error: error.message,
                result: null
            };
        }
    }

    async simulateSearch(keywords) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Return simulated search results
        return keywords.map(keyword => ({
            title: `Research on ${keyword}`,
            url: `https://example.com/${keyword.replace(/\s+/g, '-')}`,
            snippet: `Key findings about ${keyword}...`,
            relevance: 0.7 + Math.random() * 0.3,
            source: 'Simulated Research'
        }));
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

            Return a JSON array of findings.
        `;

        const schema = [
            {
                text: "string",
                source: "string",
                category: "string",
                confidence: "number",
                quote: "string (optional)"
            }
        ];

        const result = await geminiService.generateStructured(prompt, schema, {
            model: 'pro',
            temperature: 0.2
        });

        return result.success ? result.data : [];
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
        // Simple credibility assessment
        // In production, check domain authority, publication reputation, etc.
        const credibleDomains = ['.edu', '.gov', '.org', 'nature.com', 'science.org'];
        
        if (credibleDomains.some(domain => source.includes(domain))) {
            return 0.9;
        }
        
        return 0.6; // Default moderate credibility
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
            3. List of all unique sources

            Return JSON with summary, insights array, and sources array.
        `;

        const schema = {
            summary: "string",
            insights: ["string"],
            sources: ["string"]
        };

        const result = await geminiService.generateStructured(prompt, schema, {
            model: 'pro',
            temperature: 0.3
        });

        return result.success ? result.data : {
            summary: "Synthesis failed",
            insights: [],
            sources: []
        };
    }
}

module.exports = ResearcherAgent;