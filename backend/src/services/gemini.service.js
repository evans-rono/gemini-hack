// src/services/gemini.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
            logger.warn('GEMINI_API_KEY not set — Gemini calls will fail');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || 'missing');
        this.models = {
            flash: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
            pro: process.env.GEMINI_PRO_MODEL || 'gemini-2.0-flash',
        };
        this.defaultMaxTokens = 4096;
        logger.info('GeminiService initialized');
    }

    /**
     * Pick a GenerativeModel based on options.model ('flash' | 'pro')
     */
    _getModel(options = {}) {
        const modelName = this.models[options.model] || this.models.flash;
        return this.genAI.getGenerativeModel({ model: modelName });
    }

    /**
     * Generate free-form text content.
     * Returns { success, text } or { success: false, error }
     */
    async generateContent(prompt, options = {}) {
        try {
            const model = this._getModel(options);
            const generationConfig = {
                temperature: options.temperature !== undefined ? options.temperature : 0.7,
                maxOutputTokens: options.maxTokens || this.defaultMaxTokens,
                topP: options.topP !== undefined ? options.topP : 0.9,
            };

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig,
            });

            const response = result.response;
            const text = response.text();

            if (!text) {
                return { success: false, error: 'Empty response from Gemini' };
            }

            return { success: true, text };
        } catch (error) {
            logger.error('Gemini generateContent error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate structured JSON output.
     * Sends a prompt instructing the model to return JSON, then parses it.
     * Returns { success, data } or { success: false, error }
     */
    async generateStructured(prompt, schema, options = {}) {
        try {
            const jsonPrompt = `${prompt}

IMPORTANT: You MUST respond with ONLY valid JSON — no markdown fences, no extra text.
The JSON must conform to this structure:
${JSON.stringify(schema, null, 2)}`;

            const model = this._getModel(options);
            const generationConfig = {
                temperature: options.temperature !== undefined ? options.temperature : 0.3,
                maxOutputTokens: options.maxTokens || this.defaultMaxTokens,
                topP: options.topP !== undefined ? options.topP : 0.9,
                responseMimeType: 'application/json',
            };

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: jsonPrompt }] }],
                generationConfig,
            });

            const response = result.response;
            let text = response.text();

            if (!text) {
                return { success: false, error: 'Empty response from Gemini' };
            }

            // Strip markdown code fences if present
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

            const data = JSON.parse(text);
            return { success: true, data };
        } catch (error) {
            logger.error('Gemini generateStructured error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Stream content generation, calling onChunk with each text chunk.
     * Returns { success: true } when complete, or { success: false, error }
     */
    async generateContentStream(prompt, options = {}, onChunk) {
        try {
            const model = this._getModel(options);
            const generationConfig = {
                temperature: options.temperature !== undefined ? options.temperature : 0.7,
                maxOutputTokens: options.maxTokens || this.defaultMaxTokens,
            };

            const result = await model.generateContentStream({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig,
            });

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText && onChunk) {
                    onChunk(chunkText);
                }
            }

            return { success: true };
        } catch (error) {
            logger.error('Gemini generateContentStream error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new GeminiService();