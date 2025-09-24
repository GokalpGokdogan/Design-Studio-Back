const Groq = require('groq-sdk');
const SYSTEM_PROMPT = require('../models/practical_prompt');
const RESPONSE_FORMAT = require('../models/LLM_json_format.json');
const { createAdvancedPrompt } = require('../models/enhanced_prompt');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

async function generateDesign(req, res) {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  const model = 'meta-llama/llama-4-scout-17b-16e-instruct'; // 'groq/compound-mini';
  const enhancedPrompt = createAdvancedPrompt(prompt);
  console.log(SYSTEM_PROMPT)
  // const response = await groq.chat.completions.create({
  //   messages: [
  //     { role: 'system', content: SYSTEM_PROMPT },
  //     { role: 'user', content: prompt }
  //   ],
  //   model: model,
  //   temperature: 0.3,
  //   max_tokens: 2000
  // });

  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    model: model,
    temperature: 0.5,
    max_tokens: 8000,
    response_format: RESPONSE_FORMAT
  });

  console.log(response.choices[0].message.content)
  let designData;
  try {
    designData = JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error('JSON Parse Error:', err);
    return res.status(500).json({ error: 'Failed to parse design data' });
  }

  // ensure meta fields
  if (!designData.meta) designData.meta = {};
  designData.meta.id = designData.meta.id || `design_${Date.now()}`;
  designData.meta.timestamp = new Date().toISOString();
  designData.meta.prompt = prompt;

  res.json(designData);

  console.log(designData)
}

async function exportFigmaTokens(req, res) {
  const { designData } = req.body;

  if (!designData || !designData.figmaTokens) {
    return res.status(400).json({ error: 'Valid design data with figma tokens required' });
  }

  const figmaTokens = {
    ...designData.figmaTokens,
    $metadata: {
      tokenSetOrder: ['color', 'typography', 'spacing', 'borderRadius']
    }
  };

  res.json({
    tokens: figmaTokens,
    filename: `${designData.meta?.id || `design_${Date.now()}`}_tokens.json`
  });
}

module.exports = { generateDesign, exportFigmaTokens };
