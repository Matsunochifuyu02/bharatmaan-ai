'use server';
/**
 * @fileOverview This file implements the Genkit flow for handling AI chat responses.
 * It pre-formats history to ensure template stability.
 *
 * - aiChatResponse - The main function to call for getting an AI chat response.
 * - AiChatResponseInput - The input type for the aiChatResponse function.
 * - AiChatResponseOutput - The return type for the aiChatResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zkit';

const AiChatResponseInputSchema = z.object({
  message: z.string().describe('The current message from the user.'),
  chatHistory: z.array(
    z.object({
      role: z.union([z.literal('user'), z.literal('model')]),
      message: z.string(),
    })
  ).describe('A history of previous messages for context, ordered chronologically.'),
});
export type AiChatResponseInput = z.infer<typeof AiChatResponseInputSchema>;

const AiChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI\'s generated response.'),
});
export type AiChatResponseOutput = z.infer<typeof AiChatResponseOutputSchema>;

const aiChatResponsePrompt = ai.definePrompt({
  name: 'aiChatResponsePrompt',
  input: { 
    schema: z.object({
      message: z.string(),
      formattedHistory: z.array(z.string())
    }) 
  },
  output: { schema: AiChatResponseOutputSchema },
  system: `You are Bharatmaan AI, a smart, friendly, calm, and helpful AI assistant created by Krushna.
Your purpose is to be a companion that provides practical solutions and clear, simple English. Avoid slang.
Remember past conversations and user preferences to give contextually relevant responses.`,
  prompt: `
{{#each formattedHistory}}
{{{this}}}
{{/each}}
User: {{{message}}}

Bharatmaan AI:`,
});

const aiChatResponseFlow = ai.defineFlow(
  {
    name: 'aiChatResponseFlow',
    inputSchema: AiChatResponseInputSchema,
    outputSchema: AiChatResponseOutputSchema,
  },
  async (input) => {
    const formattedHistory = input.chatHistory.map(h => 
      `${h.role === 'user' ? 'User' : 'Bharatmaan AI'}: ${h.message}`
    );

    const { output } = await aiChatResponsePrompt({
      message: input.message,
      formattedHistory
    });
    return output!;
  }
);

export async function aiChatResponse(input: AiChatResponseInput): Promise<AiChatResponseOutput> {
  return aiChatResponseFlow(input);
}
