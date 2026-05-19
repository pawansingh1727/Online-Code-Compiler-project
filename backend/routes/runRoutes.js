const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  const { source_code, language_id, stdin } = req.body;
  
  if (!source_code || !language_id) {
    return res.status(400).json({ error: "source_code and language_id are required" });
  }

  const JUDGE0_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';
  const API_KEY = process.env.JUDGE0_API_KEY;

  const headers = {
    'Content-Type': 'application/json'
  };

  if (API_KEY) {
    // If it's a RapidAPI key
    if (JUDGE0_URL.includes('rapidapi')) {
      headers['X-RapidAPI-Key'] = API_KEY;
      headers['X-RapidAPI-Host'] = new URL(JUDGE0_URL).hostname;
    } else {
      headers['X-Auth-Token'] = API_KEY; // standard Judge0 authentication
    }
  }

  try {
    // 1. Create submission
    const createResponse = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      source_code,
      language_id,
      stdin: stdin || ""
    }, { headers });

    const data = createResponse.data;

    // wait=true should return the final result directly if it finishes in time.
    // However, if the token is returned without status, or status is Processing/In Queue
    if (data.status && (data.status.id === 1 || data.status.id === 2)) {
       // Need to poll (rare if wait=true worked, but just in case)
       let result = data;
       let attempts = 0;
       while ((result.status.id === 1 || result.status.id === 2) && attempts < 10) {
         await new Promise(resolve => setTimeout(resolve, 1000));
         const getResponse = await axios.get(`${JUDGE0_URL}/submissions/${data.token}?base64_encoded=false`, { headers });
         result = getResponse.data;
         attempts++;
       }
       return res.json(result);
    }

    // Return the completed submission
    res.json(data);

  } catch (error) {
    console.error("Error communicating with Judge0:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to execute code", details: error.response ? error.response.data : error.message });
  }
});

module.exports = router;
