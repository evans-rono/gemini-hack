// src/services/search.service.js
const geminiService = require('./gemini.service');
const logger = require('../utils/logger');

/**
 * SearchService — uses Gemini to generate realistic research-style search results.
 *
 * In a production setup you'd integrate Google Custom Search, SerpAPI, or
 * Brave Search here. For this project we leverage Gemini itself to produce
 * grounded, knowledge-based search results for each keyword set.
 */
class SearchService {
    /**
     * Search for information on the given keywords related to a task description.
     * Returns an array of { title, url, snippet, relevance, source }
     */
    async search(keywords, taskDescription) {
        try {
            logger.info(`Searching for: ${keywords.join(', ')}`);

            const prompt = `
You are a research assistant with access to current knowledge. For the research task below,
provide detailed, factual search results based on your training data.

Research Task: "${taskDescription}"
Keywords: ${keywords.join(', ')}

Return a JSON array of 4-6 search results. Each result MUST have:
- "title": A descriptive article/paper title
- "url": A plausible real URL from a reputable source (e.g., nature.com, arxiv.org, reuters.com, who.int, gov sites, university sites)
- "snippet": A 2-3 sentence factual summary with specific data points, statistics, or expert quotes where possible
- "relevance": A number between 0.7 and 1.0 indicating relevance
- "source": The publication or organization name

Focus on accuracy and specificity. Include real statistics, dates, and expert names where possible.
`;

            const schema = [{
                title: 'string',
                url: 'string',
                snippet: 'string',
                relevance: 'number',
                source: 'string',
            }, ];

            const result = await geminiService.generateStructured(prompt, schema, {
                model: 'flash',
                temperature: 0.4,
            });

            if (!result.success) {
                logger.warn('Search generation failed, returning empty results');
                return [];
            }

            // Ensure we always return an array
            const results = Array.isArray(result.data) ? result.data : [];

            logger.info(`Search returned ${results.length} results for: ${keywords.join(', ')}`);
            return results;
        } catch (error) {
            logger.error('SearchService error:', error);
            return [];
        }
    }
}

module.exports = new SearchService();