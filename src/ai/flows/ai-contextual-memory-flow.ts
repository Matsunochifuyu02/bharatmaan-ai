'use server';
/**
 * @fileOverview This file implements a Genkit flow for maintaining contextual memory in AI conversations.
 *
 * - getAiContextualReply - A function that handles generating AI replies with conversational context.
 * - AiContextualMemoryInput - The input type for the getAiContextualReply function.
 * - AiContextualMemoryOutput - The return type for the getAiContextualReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

export async function getAiContextualReply(
  input: AiContextualMemoryInput
): Promise<AiContextualMemoryOutput> {
  return aiContextualMemoryFlow(input);
}

const aiContextualMemoryPrompt = ai.definePrompt({
  name: 'aiContextualMemoryPrompt',
  input: {schema: AiContextualMemoryInputSchema},
  output: {schema: AiContextualMemoryOutputSchema},
  prompt: `You are Bharatmaan AI, a friendly, calm, helpful, smart but simple AI companion.
You speak clear English, avoid slang, and give practical solutions.
You remember our previous conversation to provide contextually relevant and consistent responses.

Here is our conversation history:
{{#each history}}
  {{#if (eq role "user")}}User: {{content}}{{/if}}
  {{#if (eq role "model")}}Bharatmaan AI: {{content}}{{/if}}
{{/each}}

User: {{{message}}}
Bharatmaan AI:`,
});

const aiContextualMemoryFlow = ai.defineFlow(
  {
    name: 'aiContextualMemoryFlow',
    inputSchema: AiContextualMemoryInputSchema,
    outputSchema: AiContextualMemoryOutputSchema,
  },
  async input => {
    const {output} = await aiContextualMemoryPrompt(input);
    return output!;
  }
);
