// src/agents/planner.agent.js
const BaseAgent = require('./base.agent');
const geminiService = require('../services/gemini.service');
const logger = require('../utils/logger');

class PlannerAgent extends BaseAgent {
    constructor() {
        super('Research Planner', 'planner', [
            'task_decomposition',
            'query_analysis',
            'priority_assignment'
        ]);
    }

    async execute(task) {
        const startTime = Date.now();
        this.status = 'busy';

        try {
            const { query, depth = 'balanced' } = task;
            
            logger.info(`Planner analyzing: "${query.substring(0, 50)}..."`);

            // Define task count based on depth
            const taskCounts = {
                quick: 3,
                balanced: 5,
                deep: 8
            };
            const numTasks = taskCounts[depth] || 5;

            // Create planning prompt
            const prompt = `
                You are an expert research planner. Break down this research query into ${numTasks} specific, well-defined research tasks.

                Research Query: "${query}"

                For each task, provide:
                1. A clear description of what to research
                2. 3-5 relevant keywords for searching
                3. Priority level (1-5, where 1 is highest)
                4. Estimated complexity (1-5)
                5. Required capabilities (choose from: web_search, data_analysis, fact_checking, expert_opinion, trend_analysis)

                Return a JSON object with:
                {
                    "tasks": [
                        {
                            "description": "string",
                            "keywords": ["string"],
                            "priority": number,
                            "complexity": number,
                            "requiredCapabilities": ["string"]
                        }
                    ],
                    "strategy": "Brief description of overall research approach",
                    "estimatedTimeMinutes": number
                }
            `;

            const schema = {
                tasks: [
                    {
                        description: "string",
                        keywords: ["string"],
                        priority: "number",
                        complexity: "number",
                        requiredCapabilities: ["string"]
                    }
                ],
                strategy: "string",
                estimatedTimeMinutes: "number"
            };

            const result = await geminiService.generateStructured(prompt, schema, {
                model: 'flash',
                temperature: 0.3
            });

            if (!result.success) {
                throw new Error(result.error || 'Planning failed');
            }

            // Enhance tasks with IDs
            const tasks = result.data.tasks.map((t, index) => ({
                id: `task_${index + 1}_${Date.now()}`,
                ...t,
                status: 'pending'
            }));

            const plan = {
                id: `plan_${Date.now()}`,
                query,
                depth,
                tasks,
                strategy: result.data.strategy,
                estimatedTime: result.data.estimatedTimeMinutes,
                createdAt: new Date().toISOString()
            };

            this.updateMetrics(true, Date.now() - startTime);
            this.status = 'idle';

            return {
                success: true,
                plan
            };

        } catch (error) {
            logger.error('Planner agent error:', error);
            this.updateMetrics(false, Date.now() - startTime);
            this.status = 'error';

            return {
                success: false,
                error: error.message,
                plan: null
            };
        }
    }
}

module.exports = new PlannerAgent();