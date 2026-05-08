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
  input: {
    schema: z.object({
      message: z.string(),
      formattedHistory: z.array(z.string()),
    }),
  },
  output: {schema: AiContextualMemoryOutputSchema},
  prompt: `You are Bharatmaan AI, a friendly, calm, helpful, smart but simple AI companion.
You speak clear English, avoid slang, and give practical solutions.
You remember our previous conversation to provide contextually relevant and consistent responses.

Here is our conversation history:
{{#if formattedHistory}}
{{#each formattedHistory}}
{{{this}}}
{{/each}}
{{/if}}

User: {{{message}}}
Bharatmaan AI:`,
});

const aiContextualMemoryFlow = ai.defineFlow(
  {
    name: 'aiContextualMemoryFlow',
    inputSchema: AiContextualMemoryInputSchema,
    outputSchema: AiContextualMemoryOutputSchema,
  },
  async (input) => {
    // Pre-format the history to avoid logic in the Handlebars template
    // This fixes the 'unknown helper eq' error by performing role logic in TS.
    const formattedHistory = input.history.map((h) => 
      `${h.role === 'user' ? 'User' : 'Bharatmaan AI'}: ${h.content}`
    );

    const {output} = await aiContextualMemoryPrompt({
      message: input.message,
      formattedHistory,
    });
    return output!;
  }
);
