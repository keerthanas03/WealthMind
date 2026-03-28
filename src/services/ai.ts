import { Message } from '../types';

const API_URL = 'http://localhost:5000/api';

export const generateAdvice = async (text: string) => {
  try {
    const response = await fetch(`${API_URL}/advisor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) throw new Error('Backend AI request failed');

    const data = await response.json();
    return { 
      advice: data.advice, 
      why: data.why,
      takeaway: data.takeaway
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to connect to AI Advisor backend.");
  }
};
