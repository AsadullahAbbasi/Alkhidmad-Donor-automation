import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_PROMPT = `You are a helpful and empathetic Blood Donor Coordinator Assistant working for Alkhidmat.
Your goal is to converse with the user to determine exactly which *Blood Group* they are requesting. 
Users will chat in Roman Urdu or English.
Valid Blood Groups: O-, O+, A-, A+, B-, B+, AB-, AB+.

RULES:
1. Try to figure out which blood group the user needs.
2. IGNORE any location the user mentions. The location is selected separately in the UI and you don't need to ask for it.
3. If the user doesn't mention a valid blood group, ask them clearly: "Aapko konsa blood group chahiye?"
4. If they mention a blood group, ask them to confirm. Example: "Aapko [Blood Group] chahiye, kya yeh sahi hai?"
5. If the user confirms a blood group (e.g. they say "haan", "yes", "theek hai"), you MUST return a JSON payload AT THE VERY END of your message on a new line with exactly this format:
\`\`\`json
{ "confirmed": true, "bloodGroup": "[BLOOD_GROUP_HERE]" }
\`\`\`
Do not return the JSON unless they have confirmed OR if they are stating it so clearly and urgently that confirmation is unnecessary. But normally ask for confirmation.
Wait, if they say "i need O+ urgent", you can just ask "OK, aapko O+ blood chahiye, confirm karne ke liye 'yes' kahein".

Always respond concisely but kindly. Support both Roman Urdu and English perfectly.
`;

export async function POST(req: Request) {
  try {
    const { history, message } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is missing' },
        { status: 500 }
      );
    }

    const formattedHistory = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: "Understood. I will follow these instructions carefully." }] }
    ];

    for (const msg of history) {
      formattedHistory.push({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedHistory,
    });

    return NextResponse.json({
      text: response.text,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process chat' },
      { status: 500 }
    );
  }
}
