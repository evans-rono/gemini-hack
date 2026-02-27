// src/agents/synthesizer.agent.js
const BaseAgent = require('./base.agent');
const geminiService = require('../services/gemini.service');
const logger = require('../utils/logger');
const ContextFormatter = require('../utils/formatContext');

class SynthesizerAgent extends BaseAgent {
    constructor() {
        super('Report Synthesizer', 'synthesizer', [
            'content_synthesis',
            'report_generation',
            'citation_management'
        ]);
    }

    async execute(task) {
        const startTime = Date.now();
        this.status = 'busy';

        try {
            const { query, findings, plan, options } = task;
            
            logger.info(`Synthesizer creating report for: "${query.substring(0, 50)}..."`);

            // Prepare findings summary
            const findingsSummary = findings
                .filter(f => f.success && f.result)
                .map(f => ({
                    agentId: f.result.agentId,
                    taskDescription: f.result.description,
                    findings: f.result.findings,
                    summary: f.result.summary,
                    insights: f.result.insights,
                    sources: f.result.sources
                }));

            // Collect all sources
            const allSources = findingsSummary.flatMap(f => f.sources || []);
            const uniqueSources = [...new Set(allSources)];

            // Generate report
            const report = await this.generateReport(query, findingsSummary, plan);

            // Add citations
            const reportWithCitations = this.addCitations(report, uniqueSources);

            const result = {
                id: `report_${Date.now()}`,
                query,
                generatedAt: new Date().toISOString(),
                executiveSummary: report.executiveSummary,
                sections: report.sections,
                findings: ContextFormatter.formatFindings(findingsSummary),
                sources: uniqueSources.map(url => ({ url, accessed: new Date().toISOString() })),
                metadata: {
                    findingsCount: findingsSummary.length,
                    sourcesCount: uniqueSources.length,
                    processingTime: Date.now() - startTime
                }
            };

            this.updateMetrics(true, Date.now() - startTime);
            this.status = 'idle';

            return {
                success: true,
                report: result
            };

        } catch (error) {
            logger.error('Synthesizer agent error:', error);
            this.updateMetrics(false, Date.now() - startTime);
            this.status = 'error';

            return {
                success: false,
                error: error.message,
                report: null
            };
        }
    }

    async generateReport(query, findings, plan) {
        const findingsText = findings.map(f => `
            Agent: ${f.agentId}
            Task: ${f.taskDescription}
            Summary: ${f.summary}
            Key Insights: ${f.insights?.join(', ')}
            Findings: ${JSON.stringify(f.findings, null, 2)}
        `).join('\n\n---\n\n');

        const prompt = `
            You are an expert research analyst. Create a comprehensive research report.

            Research Query: "${query}"

            Research Plan:
            - Strategy: ${plan.strategy}
            - Tasks: ${plan.tasks.length} research tasks

            Research Findings:
            ${findingsText}

            Generate a professional report with:

            1. EXECUTIVE SUMMARY
               - Brief overview of the research
               - Key findings and their significance
               - Main takeaways (3-4 bullet points)

            2. METHODOLOGY
               - How the research was conducted
               - Number of sources and research areas

            3. DETAILED FINDINGS
               - Organize by themes/topics
               - Include specific data and facts
               - Present different perspectives

            4. ANALYSIS & INSIGHTS
               - Identify patterns and connections
               - Explain what the findings mean
               - Highlight key insights

            5. CONCLUSIONS
               - Summarize main conclusions
               - Note limitations or uncertainties

            6. RECOMMENDATIONS
               - Based on the findings
               - Practical next steps

            Format the report professionally with clear headings.
        `;

        const result = await geminiService.generateContent(prompt, {
            model: 'pro',
            temperature: 0.3,
            maxTokens: 4096
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        // Parse report sections
        return this.parseReportSections(result.text);
    }

    parseReportSections(text) {
        const sections = {};
        
        // Extract executive summary
        const execMatch = text.match(/EXECUTIVE SUMMARY\s*([\s\S]*?)(?=\n\n[A-Z]+\s*\n|$)/i);
        sections.executiveSummary = execMatch ? execMatch[1].trim() : '';

        // Extract other sections
        const sectionNames = ['METHODOLOGY', 'DETAILED FINDINGS', 'ANALYSIS', 'CONCLUSIONS', 'RECOMMENDATIONS'];
        
        sectionNames.forEach(name => {
            const regex = new RegExp(`${name}\\s*([\\s\\S]*?)(?=\\n\\n[A-Z]+\\s*\\n|$)`, 'i');
            const match = text.match(regex);
            sections[name.toLowerCase()] = match ? match[1].trim() : '';
        });

        return {
            executiveSummary: sections.executiveSummary,
            sections: {
                methodology: sections.methodology,
                findings: sections['detailed findings'],
                analysis: sections.analysis,
                conclusions: sections.conclusions,
                recommendations: sections.recommendations
            }
        };
    }

    addCitations(report, sources) {
        // Add source list at the end
        const citations = sources.map((source, index) => `${index + 1}. ${source}`).join('\n');
        
        return {
            ...report,
            citations: `\n\n## SOURCES\n${citations}`
        };
    }
}

module.exports = new SynthesizerAgent();