// This is the updated code for your Netlify Function.
// You will need to edit the existing file at:
// /netlify/functions/gemini-proxy.js

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the API key from your Netlify environment variables
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key is not configured.' }),
    };
  }

  // The official Google AI API endpoint
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    // *** FIX STARTS HERE ***
    // Get the referer from the original request to pass it to Google for security checks.
    const referer = event.headers.referer;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add the referer header to the request to Google
        'Referer': referer
      },
      // Pass the body from the client's request directly to the Google API
      body: event.body,
    });
    // *** FIX ENDS HERE ***

    const data = await response.json();

    if (!response.ok) {
        console.error('Google AI API Error:', data);
        return {
            statusCode: response.status,
            body: JSON.stringify(data),
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Proxy function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while processing your request.' }),
    };
  }
};
