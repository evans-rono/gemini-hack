// test-api.js
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testResearch() {
    try {
        // 1. Start research
        console.log('1. Starting research...');
        const startRes = await axios.post(`${API_URL}/research`, {
            query: 'What are the latest developments in quantum computing?',
            depth: 'quick'
        });
        
        const { researchId } = startRes.data;
        console.log(`Research ID: ${researchId}\n`);

        // 2. Poll for status
        let completed = false;
        let attempts = 0;
        
        while (!completed && attempts < 30) {
            await new Promise(r => setTimeout(r, 2000));
            
            const statusRes = await axios.get(`${API_URL}/research/${researchId}/status`);
            const status = statusRes.data.status;
            
            console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
            
            if (status.status === 'completed' || status.status === 'failed') {
                completed = true;
            }
            
            attempts++;
        }

        console.log('\nResearch completed!');

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

testResearch();