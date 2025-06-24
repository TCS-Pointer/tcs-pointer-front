import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = '';

class ModerationService {
  static getPrompt(textoUsuario) {
    return `
Você é um moderador de conteúdo. Avalie o seguinte texto enviado por um usuário.

Seu trabalho é identificar se ele contém qualquer tipo de:
- Linguagem ofensiva
- Agressividade verbal
- Preconceito (raça, gênero, religião, etc.)
- Palavrões ou insultos
- Conteúdo desrespeitoso ou inapropriado

Responda apenas com:
- "OK" → se o texto estiver adequado
- "OFENSIVO" → se o texto for impróprio de alguma forma

Texto do usuário:
"""${textoUsuario}"""
`;
  }

  static async moderarTexto(textoUsuario) {
    if (!GEMINI_API_KEY) throw new Error('Chave da API do Gemini não configurada (.env)');
    const prompt = this.getPrompt(textoUsuario);
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      // Extrai resposta do Gemini
      const geminiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!geminiText) throw new Error('Resposta inesperada da API Gemini');
      if (geminiText.includes('OK')) return 'OK';
      if (geminiText.includes('OFENSIVO')) return 'OFENSIVO';
      return geminiText;
    } catch (err) {
      throw new Error('Erro ao consultar moderação Gemini: ' + (err?.message || err));
    }
  }
}

export default ModerationService; 