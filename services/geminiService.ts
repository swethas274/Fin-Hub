import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY } from '../constants';
import type { NewsArticle, SentimentAnalysis } from '../types';

// Initialize the Google Gemini AI client with the API key from constants.
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const fetchNewsWithGemini = async (stockSymbol: string): Promise<NewsArticle[]> => {
    const prompt = `
      You are a financial news aggregator. Use your search tool to find the top 5 most recent and relevant news articles for the stock symbol: ${stockSymbol}.

      For each article, provide the title, the author (if available), a brief description, the source name, the direct URL to the article, and the publication date in ISO 8601 format.
      
      Your response must be a valid JSON array of objects, and nothing else. Do not include any introductory text, explanations, or markdown formatting like \`\`\`json. Just the raw JSON.
      The JSON structure for each article should be:
      {
        "title": "string",
        "author": "string or null",
        "description": "string",
        "url": "string",
        "publishedAt": "string (ISO 8601 format)",
        "source": { "name": "string" }
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                // NOTE: Removed responseMimeType and responseSchema as they are incompatible with tools.
            }
        });

        let jsonString = response.text.trim();
        
        // Clean the response in case the model still adds markdown backticks
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        } else if (jsonString.startsWith('```')) {
             jsonString = jsonString.substring(3, jsonString.length - 3).trim();
        }
        
        const parsedArticles = JSON.parse(jsonString) as any[];

        // Map to our NewsArticle type
        return parsedArticles.map(article => ({
            ...article,
            source: { id: null, name: article.source?.name || 'Unknown Source' },
            author: article.author || null,
            urlToImage: null,
            content: null,
        }));
    } catch (error) {
        console.error("Error fetching news with Gemini:", error);
        // Fallback to empty array to prevent crashing the whole dashboard
        return [];
    }
};

export const analyzeNewsSentiment = async (stockSymbol: string, companyName: string, articles: NewsArticle[]): Promise<SentimentAnalysis> => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const headlines24h = articles
        .filter(a => new Date(a.publishedAt) > twentyFourHoursAgo)
        .map(a => a.title)
        .join('\n');

    const headlines10d = articles
        .map(a => a.title)
        .join('\n');

    if (!headlines24h && !headlines10d) {
        return {
            recent_score: 0,
            weekly_score: 0,
            trend_description: "No news available for analysis.",
            influential_headlines: []
        };
    }

    const prompt = `
      You are a financial news analyst. I will provide you with two sets of news headlines for the company ${companyName} (${stockSymbol}).
      The first set is from the last 24 hours. The second set is from the last 10 days.

      Analyze the sentiment of each set of headlines.
      1. Calculate a sentiment score for the last 24 hours from -10 (extremely negative) to 10 (extremely positive).
      2. Calculate a sentiment score for the last 10 days from -10 (extremely negative) to 10 (extremely positive).
      3. Compare the two scores and describe the recent trend (e.g., "improving", "worsening", "stable").
      4. Identify the top 1-2 news headlines that seem to have the most significant impact on the recent sentiment.

      Respond ONLY in the following JSON format.

      ---
      HEADLINES (LAST 24 HOURS):
      ${headlines24h || "No recent headlines"}
      ---
      HEADLINES (LAST 10 DAYS):
      ${headlines10d}
      ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recent_score: { type: Type.NUMBER },
                        weekly_score: { type: Type.NUMBER },
                        trend_description: { type: Type.STRING },
                        influential_headlines: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["recent_score", "weekly_score", "trend_description", "influential_headlines"]
                }
            }
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as SentimentAnalysis;
    } catch (error) {
        console.error("Error analyzing sentiment with Gemini:", error);
        throw new Error("Failed to get sentiment analysis from AI.");
    }
};


export const getChatResponse = async (userQuery: string, history: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are Fin-Hub AI, an expert financial assistant. You can answer questions about stocks, financial markets, and investment strategies. Use the provided tools to get real-time information when necessary. Be concise, accurate, and helpful. Do not provide direct financial advice, but you can explain concepts and present data. This is the conversation history:\n${history}`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userQuery,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        return "I'm sorry, I encountered an issue and can't respond right now.";
    }
};