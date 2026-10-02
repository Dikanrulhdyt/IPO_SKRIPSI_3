const mlClient = require('../services/mlClient');

exports.predict = async (req, res) => {
  try {
    console.log('📥 [Controller] Received prediction request:', req.body);
    
    const result = await mlClient.predict(req.body);
    
    console.log('📤 [Controller] ML response:', result);
    
    // Pastikan response memiliki field yang diperlukan
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response from ML service');
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ [Controller] Prediction error:', error.message);
    console.error('❌ [Controller] Full error:', error);
    
    res.status(500).json({
      error: 'Prediction failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
};