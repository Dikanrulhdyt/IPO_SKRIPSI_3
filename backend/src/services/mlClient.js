const axios = require('axios');

class MLClient {
  constructor() {
    this.baseUrl = process.env.ML_API_URL || 'http://localhost:5001';
  }

  async predict(data) {
    try {
      console.log('📤 [ML Client] Sending to ML:', JSON.stringify(data, null, 2));
      
      const response = await axios.post(`${this.baseUrl}/predict`, data, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('📥 [ML Client] Response status:', response.status);
      console.log('📥 [ML Client] Response data:', JSON.stringify(response.data, null, 2));
      
      // Pastikan response.data tidak null/undefined
      if (!response.data) {
        throw new Error('ML service returned empty response');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ [ML Client] Error details:');
      console.error('  - Status:', error.response?.status);
      console.error('  - Data:', error.response?.data);
      console.error('  - Message:', error.message);
      
      if (error.response?.data) {
        throw new Error(`ML service error: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`ML service error: ${error.message}`);
    }
  }

  async getUWStats() {
    try {
      const response = await axios.get(`${this.baseUrl}/uw_stats`);
      return response.data;
    } catch (error) {
      console.error('❌ ML UW Stats Error:', error.message);
      throw error;
    }
  }
}

module.exports = new MLClient();