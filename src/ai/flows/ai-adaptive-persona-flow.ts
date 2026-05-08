'use server';
/**
 * @fileOverview This file implements a Genkit flow for Bharatmaan AI's adaptive persona feature.
 * It allows the AI to subtly adapt its tone and content based on the user's expressed need or topic.
 *
 * - adaptPersona - A function that handles the AI's persona adaptation and response generation.
 * - AiAdaptivePersonaInput - The input type for the adaptPersona function.
 * - AiAdaptivePersonaOutput - The return type for the adaptPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
      "The persona detected for the AI's response based on user's need (e.g., 'emotional_support', 'study_help')."
    ),
});
export type AiAdaptivePersonaOutput = z.infer<typeof AiAdaptivePersonaOutputSchema>;

const adaptivePersonaPrompt = ai.definePrompt({
  name: 'adaptivePersonaPrompt',
  input: {schema: AiAdaptivePersonaInputSchema},
  output: {schema: AiAdaptivePersonaOutputSchema},
  prompt: `You are Bharatmaan AI, an empathetic, friendly, calm, and smart AI assistant. Your goal is to provide a helpful and supportive response, adjusting your tone and content based on the user's expressed needs. You avoid slang and speak clear English, offering practical solutions.

Analyze the user's message and the provided conversation history to determine the most appropriate persona for your response. Choose one of the following personas:
- 'friendly': For general conversation, light inquiries, and keeping a positive, approachable tone.
- 'emotional_support': When the user expresses distress, asks for comfort, or seems to need a gentle and understanding approach.
- 'study_help': When the user asks for academic assistance, explanations, or help with learning.
- 'normal': A default, professional yet friendly tone when no specific need is strongly detected.

After determining the persona, generate a response that aligns with this persona, providing assistance or comfort as needed.

Conversation History (if available):
{{#if chatHistory}}
{{#each chatHistory}}
- {{{this}}}
{{/each}}
{{else}}
(No previous history)
{{/if}}

User Message: {{{userMessage}}}

Please respond in JSON format, including both the 'aiResponse' and the 'detectedPersona'.`,
});

const aiAdaptivePersonaFlow = ai.defineFlow(
  {
    name: 'aiAdaptivePersonaFlow',
    inputSchema: AiAdaptivePersonaInputSchema,
    outputSchema: AiAdaptivePersonaOutputSchema,
  },
  async (input) => {
    const {output} = await adaptivePersonaPrompt(input);
    if (!output) {
      throw new Error('Failed to get an adaptive persona response.');
    }
    return output;
  }
);

export async function adaptPersona(
  input: AiAdaptivePersonaInput
): Promise<AiAdaptivePersonaOutput> {
  return aiAdaptivePersonaFlow(input);
}
