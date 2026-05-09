'use server';
/**
 * @fileOverview This file implements an adaptive persona flow that uses the private server.
 * Since the private server might not support persona detection natively, it routes the message
 * and defaults to 'normal' persona unless the server response includes persona data.
 *
 * - adaptPersona - A function that handles the AI's persona adaptation and response generation.
 * - AiAdaptivePersonaInput - The input type for the adaptPersona function.
 * - AiAdaptivePersonaOutput - The return type for the adaptPersona function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AiAdaptivePersonaInputSchema = z.object({
  userMessage: z.string().describe('The current message from the user.'),
  chatHistory: z
    .array(z.string())
    .optional()
    .describe(
      'An optional array of previous messages in the conversation to provide context.'
    ),
});
export type AiAdaptivePersonaInput = z.infer<typeof AiAdaptivePersonaInputSchema>;

const AiAdaptivePersonaOutputSchema = z.object({
  aiResponse: z
    .string()
    .describe('The AI-generated response, adapted to the detected persona.'),
  detectedPersona: z
    .enum(['friendly', 'emotional_support', 'study_help', 'normal'])
    .optional()
    .describe(
      "The persona detected for the AI's response based on user's need."
    ),
});
export type AiAdaptivePersonaOutput = z.infer<typeof AiAdaptivePersonaOutputSchema>;

const PRIVATE_SERVER_URL = 'https://ef84d6f6-5ad3-47ea-8889-16507c6e1c80-00-2ulk7xi0bas6p.pike.replit.dev/chat';

export async function adaptPersona(
  input: AiAdaptivePersonaInput
): Promise<AiAdaptivePersonaOutput> {
  try {
    const response = await fetch(PRIVATE_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: input.userMessage,
        history: input.chatHistory,
        task: 'adaptive_persona'
      }),
    });

    if (!response.ok) {
      throw new Error(`Private server error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // We expect the private server to return 'response' and optionally 'persona'.
    // If 'persona' is not provided, we default to 'normal'.
    return {
      aiResponse: data.response || data.message || "Hello! I'm Bharatmaan.",
      detectedPersona: (data.persona as any) || 'normal',
    };
  } catch (error) {
    console.error('Adaptive persona flow error:', error);
    return {
      aiResponse: "I'm here to help, even if my private server is acting up.",
      detectedPersona: 'normal',
    };
  }
}
