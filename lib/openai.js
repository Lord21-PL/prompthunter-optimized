// lib/openai.js - Prawdziwy OpenAI Analyzer

export class OpenAIAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async analyzePrompt(text) {
    const systemPrompt = `Jesteś ekspertem od AI promptów. Analizujesz tweety i określasz:
1. Czy tweet zawiera prompt dla AI (ChatGPT, Claude, Midjourney, DALL-E, etc.)
2. Jakiej kategorii AI dotyczy prompt
3. Jaka jest pewność że to rzeczywiście prompt (0-1)

Odpowiedz TYLKO w formacie JSON:
{
  "isPrompt": true/false,
  "category": "ChatGPT|Claude|Midjourney|DALL-E|Stable Diffusion|Other",
  "confidence": 0.0-1.0,
  "reasoning": "krótkie wyjaśnienie"
}`;

    const userPrompt = `Przeanalizuj ten tweet czy zawiera AI prompt:

"${text}"`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 200,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const analysis = JSON.parse(content);

      return {
        isPrompt: analysis.isPrompt || false,
        category: analysis.category || 'Other',
        confidence: analysis.confidence || 0,
        reasoning: analysis.reasoning || ''
      };

    } catch (error) {
      console.error('OpenAI Analysis Error:', error);
      return {
        isPrompt: false,
        category: 'Other',
        confidence: 0,
        reasoning: `Error: ${error.message}`
      };
    }
  }

  async batchAnalyze(tweets) {
    const results = [];

    for (const tweet of tweets) {
      try {
        const analysis = await this.analyzePrompt(tweet.text);
        results.push({
          tweet,
          analysis
        });

        // Rate limiting - pauza między requestami
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error analyzing tweet ${tweet.id}:`, error);
        results.push({
          tweet,
          analysis: {
            isPrompt: false,
            category: 'Other',
            confidence: 0,
            reasoning: `Error: ${error.message}`
          }
        });
      }
    }

    return results;
  }
}