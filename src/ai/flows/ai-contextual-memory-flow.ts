'use server';
/**
 * @fileOverview This file implements a Genkit flow for maintaining contextual memory using a private server.
 *
 * - getAiContextualReply - A function that handles generating AI replies with conversational context.
 * - AiContextualMemoryInput - The input type for the getAiContextualReply function.
 * - AiContextualMemoryOutput - The return type for the getAiContextualReply function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AiContextualMemoryInputSchema = z.object({
  message: z.string().describe('The current message from the user.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']).describe('The role of the message sender.'),
        content: z.string().describe('The content of the message.'),
      })
    )
    .describe('An array of previous conversation messages, ordered chronologically.'),
});
export type AiContextualMemoryInput = z.infer<typeof AiContextualMemoryInputSchema>;

const AiContextualMemoryOutputSchema = z.object({
  reply: z.string().describe("The AI's contextually relevant reply."),
});
export type AiContextualMemoryOutput = z.infer<typeof AiContextualMemoryOutputSchema>;

const PRIVATE_SERVER_URL = 'https://ef84d6f6-5ad3-47ea-8889-16507c6e1c80-00-2ulk7xi0bas6p.pike.replit.dev/chat';

export async function getAiContextualReply(
  input: AiContextualMemoryInput
): Promise<AiContextualMemoryOutput> {
  try {
    const response = await fetch(PRIVATE_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: input.message,
        history: input.history,
      }),
    });

    if (!response.ok) {
      throw new Error(`Private server error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      reply: data.response || data.message || data.reply || "I'm listening, but I had trouble processing that.",
    };
  } catch (error) {
    console.error('Contextual memory flow error:', error);
    return {
      reply: "I'm having trouble accessing my memory at the moment.",
    };
  }
}
