import express from 'express';
import fetch from 'node-fetch';

const formRouter = express.Router();

formRouter.post('/submit-form', async (req, res) => {
  try {
    console.log('Received request - Body:', req.body, 'Headers:', req.headers);
    const apiUrl = process.env.FORM_SUBMIT_URL || 'https://script.google.com/macros/s/AKfycbzmqKIAQAyKYz2v0Egy-Yh18F49iCfW7aMI9A_23MN6BHC-TZAjGOfrJlGhxKtjpob6hw/exec';

    if (!req.body || typeof req.body !== 'object' || !req.body.name || !req.body.email || !req.body.message) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ status: 'error', message: 'Missing or invalid required fields' });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body),
    });

    const contentType = response.headers.get('content-type');
    const text = await response.text();

    if (!response.ok) {
      console.error('Response from Apps Script not OK:', { status: response.status, text });
      return res.status(response.status).json({ status: 'error', message: 'Response not OK', raw: text });
    }

    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type from Apps Script:', contentType, 'Response:', text);
      return res.status(500).json({ status: 'error', message: 'Invalid response format from Apps Script', raw: text });
    }

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (parseError) {
      console.error('JSON Parse Error from Apps Script:', parseError.message, 'Response:', text);
      return res.status(500).json({ status: 'error', message: 'Failed to parse JSON response', raw: text });
    }
  } catch (error) {
    console.error('Proxy Error:', error.message, error.stack);
    res.status(500).json({ status: 'error', message: `Proxy Error: ${error.message}` });
  }
});

export default formRouter;