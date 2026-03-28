import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Bytez from 'bytez.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Bytez with the user's explicit key
const bytezKey = "66e0bd9149e7a89d014fffab6b60b760";
const sdk = new Bytez(bytezKey);
const aiModel = sdk.model("openai/gpt-4.1-mini");

// Simple in-memory cache (5 min TTL)
const cache: Record<string, { data: any; ts: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;

async function safeChat(systemPrompt: string, userPrompt: string, fallback: any, cacheKey?: string): Promise<any> {
  if (cacheKey && cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
    console.log(`[Cache HIT] ${cacheKey}`);
    return cache[cacheKey].data;
  }
  try {
    const { error, output } = await aiModel.run([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    if (error) {
      console.error('Bytez AI API Error:', error);
      throw new Error(error);
    }

    let rawText = '';
    let parsedOutput = output;
    if (typeof output === 'string') {
      try { parsedOutput = JSON.parse(output); } catch (e) { parsedOutput = output; }
    }
    
    if (typeof parsedOutput === 'string') rawText = parsedOutput;
    else if (Array.isArray(parsedOutput) && parsedOutput[0]?.content) rawText = parsedOutput[0].content;
    else if (Array.isArray(parsedOutput) && parsedOutput[0]?.generated_text) rawText = parsedOutput[0].generated_text;
    else if (parsedOutput && typeof parsedOutput === 'object' && parsedOutput.content) rawText = parsedOutput.content;
    else rawText = JSON.stringify(parsedOutput || '');
                  
    const jsonMatch = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : fallback;
    
    if (cacheKey && data) cache[cacheKey] = { data, ts: Date.now() };
    return data;
  } catch (e: any) {
    console.error('Bytez Exception:', e.message);
    return fallback;
  }
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', provider: 'bytez', model: 'gpt-4.1-mini' }));

// --- AI Advisor ---
app.post('/api/advisor/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  
  const systemPrompt = `You are WealthMind, an expert personal financial advisor specializing in Indian markets. Be concise, practical, and data-driven. Always respond in EXACTLY this format:
Advice: [2-3 sentence actionable advice]
Why: [1-2 sentence reasoning]
Takeaway: [Single most important action to take]`;

  try {
    const { error, output } = await aiModel.run([
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ]);

    if (error) throw new Error(error);

    // Bytez output handling (robust)
    let rawText = '';
    let parsedOutput = output;
    if (typeof output === 'string') {
      try { parsedOutput = JSON.parse(output); } catch (e) { parsedOutput = output; }
    }
    
    if (typeof parsedOutput === 'string') rawText = parsedOutput;
    else if (Array.isArray(parsedOutput) && parsedOutput[0]?.content) rawText = parsedOutput[0].content;
    else if (Array.isArray(parsedOutput) && parsedOutput[0]?.generated_text) rawText = parsedOutput[0].generated_text;
    else if (parsedOutput && typeof parsedOutput === 'object' && parsedOutput.content) rawText = parsedOutput.content;
    else rawText = JSON.stringify(parsedOutput || '');

    const lines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const advice = lines.find((l: string) => l.startsWith('Advice:'))?.replace('Advice:', '').trim() || rawText;
    const why = lines.find((l: string) => l.startsWith('Why:'))?.replace('Why:', '').trim();
    const takeaway = lines.find((l: string) => l.startsWith('Takeaway:'))?.replace('Takeaway:', '').trim();
    
    res.json({ advice, why, takeaway });
  } catch (e: any) {
    console.error('Advisor error:', e.message);
    res.json({ advice: "WealthMind AI is experiencing high traffic. Please try again shortly.", _isError: true });
  }
});

// --- Bias Analysis ---
app.post('/api/behavioral/biases', async (req, res) => {
  const { portfolio } = req.body;
  const fallback = [
    { title: 'Home Bias', description: 'Your portfolio may be concentrated in domestic assets.', severity: 'Medium', recommendation: 'Consider adding international ETFs for better diversification.' },
    { title: 'Concentration Risk', description: 'A few holdings may dominate your total portfolio value.', severity: 'Low', recommendation: 'Aim for 8–12 diverse assets spanning different sectors.' }
  ];
  const biases = await safeChat(
    'You are an expert behavioral finance analyst specializing in Indian retail investors.',
    `Analyze this portfolio for cognitive biases. Portfolio: ${JSON.stringify(portfolio || [])}.
     Return ONLY a JSON array with 2-4 items:
     [{"title":"bias name","description":"2-sentence explanation","severity":"Low"|"Medium"|"High","recommendation":"specific 1-2 sentence fix"}]`,
    fallback
  );
  res.json(Array.isArray(biases) ? biases : fallback);
});

// --- Market Sentiment ---
app.get('/api/behavioral/sentiment', async (req, res) => {
  const fallback = {
    sentiment: 'Neutral', score: 52,
    summary: 'Markets are consolidating near key support levels with moderate institutional activity.',
    keyFactors: ['RBI Monetary Policy', 'FII Flows', 'Global Tech Rally', 'Rupee Stability']
  };
  const sentiment = await safeChat(
    'You are a financial market analyst specializing in Indian (NSE/BSE/Sensex/Nifty) and global markets.',
    `Generate today's market sentiment analysis.
     Return ONLY a JSON object:
     {"sentiment":"Bullish"|"Bearish"|"Neutral","score":<0-100 where 0=extreme fear, 100=extreme greed>,"summary":"<2 sentence summary>","keyFactors":["<factor1>","<factor2>","<factor3>","<factor4>"]}`,
    fallback,
    'market_sentiment'
  );
  res.json(sentiment);
});

// --- Goal Planner AI ---
app.post('/api/advisor/goal-plan', async (req, res) => {
  const { targetAmount, targetYear, income } = req.body;
  
  if (!targetAmount || !targetYear || !income) {
    return res.status(400).json({ error: 'Missing required inputs.' });
  }

  const systemPrompt = `You are WealthMind AI, a friendly financial advisor for beginners.

Help the user plan a financial goal using SIP.

Inputs:
- Target Amount: ₹${targetAmount}
- Target Year: ${targetYear}
- Monthly Income: ₹${income}

Assumptions:
- Annual return: 12%
- Current year: 2026

Tasks:
1. Calculate months remaining
2. Calculate monthly SIP required
3. Suggest if SIP is affordable (based on income)
4. Suggest % of income to invest
5. Give simple explanation (no jargon)

Output exactly in this text format (NO OTHER TEXT):
Monthly SIP Required: [amount]
% of Income Needed: [percentage]
Total Invested: [amount]
Estimated Returns: [amount]
Why I said this: [Simple reasoning]
Key takeaway: [One powerful financial tip]`;

  try {
    const { error, output } = await aiModel.run([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate my SIP goal plan." }
    ]);
    if (error) throw new Error(error);

    let rawText = '';
    let parsedOutput = output;
    if (typeof output === 'string') {
      try { parsedOutput = JSON.parse(output); } catch (e) { parsedOutput = output; }
    }
    
    if (typeof parsedOutput === 'string') rawText = parsedOutput;
    else if (Array.isArray(parsedOutput) && parsedOutput[0]?.content) rawText = parsedOutput[0].content;
    else if (Array.isArray(parsedOutput) && parsedOutput[0]?.generated_text) rawText = parsedOutput[0].generated_text;
    else if (parsedOutput && typeof parsedOutput === 'object' && parsedOutput.content) rawText = parsedOutput.content;
    else rawText = JSON.stringify(parsedOutput || '');

    const lines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const result = {
      sip: lines.find(l => l.startsWith('Monthly SIP Required:'))?.replace('Monthly SIP Required:', '').trim() || '',
      percent: lines.find(l => l.startsWith('% of Income Needed:'))?.replace('% of Income Needed:', '').trim() || '',
      invested: lines.find(l => l.startsWith('Total Invested:'))?.replace('Total Invested:', '').trim() || '',
      returns: lines.find(l => l.startsWith('Estimated Returns:'))?.replace('Estimated Returns:', '').trim() || '',
      why: lines.find(l => l.startsWith('Why I said this:'))?.replace('Why I said this:', '').trim() || '',
      takeaway: lines.find(l => l.startsWith('Key takeaway:'))?.replace('Key takeaway:', '').trim() || '',
    };
    
    res.json(result);
  } catch (e: any) {
    console.error('Goal Plan AI Error:', e.message);
    res.status(500).json({ error: "WealthMind AI is experiencing high traffic. Please try again shortly." });
  }
});

app.listen(port, () => {
  console.log(`\n✅ WealthMind server running at http://localhost:${port}`);
  console.log(`   Provider: Bytez.js`);
  console.log(`   Model: openai/gpt-4.1-mini\n`);
});
