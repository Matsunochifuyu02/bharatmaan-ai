'use server';
/**
 * @fileOverview This file implements the Genkit flow for handling AI chat responses using a private server.
 *
 * - aiChatResponse - The main function to call for getting an AI chat response.
 * - AiChatResponseInput - The input type for the aiChatResponse function.
 * - AiChatResponseOutput - The return type for the aiChatResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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

const PRIVATE_SERVER_URL = 'https://ef84d6f6-5ad3-47ea-8889-16507c6e1c80-00-2ulk7xi0bas6p.pike.replit.dev/chat';

export async function aiChatResponse(input: AiChatResponseInput): Promise<AiChatResponseOutput> {
  try {
    const response = await fetch(PRIVATE_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: input.message,
        history: input.chatHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from private server: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      response: data.response || data.message || 'I am sorry, I am unable to respond at the moment.',
    };
  } catch (error) {
    console.error('Error connecting to private AI server:', error);
    return {
      response: 'Connecting to my private server failed. Please check the server status.',
    };
  }
}
