'use server';
/**
 * @fileOverview This file contains a Genkit flow to analyze HTML code and recommend suitable modern web frameworks or layout systems.
 *
 * - analyzeHtmlAndRecommendFrameworks - A function that analyzes HTML and provides recommendations.
 * - AnalyzeHtmlInput - The input type for the analyzeHtmlAndRecommendFrameworks function.
 * - AnalyzeHtmlOutput - The return type for the analyzeHtmlAndRecommendFrameworks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeHtmlInputSchema = z.object({
  htmlContent: z
    .string()
    .describe("The HTML code to be analyzed, starting with '<!DOCTYPE html>'."),
});
export type AnalyzeHtmlInput = z.infer<typeof AnalyzeHtmlInputSchema>;

const AnalyzeHtmlOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        framework: z
          .string()
          .describe(
            'The name of the recommended web framework or layout system (e.g., React, Next.js, CSS Grid, Tailwind CSS).'
          ),
        explanation: z
          .string()
          .describe(
            'A brief explanation of why this framework/system is recommended based on the HTML content.'
          ),
      })
    )
    .describe('A list of recommended web frameworks or layout systems.'),
});
export type AnalyzeHtmlOutput = z.infer<typeof AnalyzeHtmlOutputSchema>;

export async function analyzeHtmlAndRecommendFrameworks(
  input: AnalyzeHtmlInput
): Promise<AnalyzeHtmlOutput> {
  return analyzeHtmlAndRecommendFrameworksFlow(input);
}

const analyzeHtmlRecommendPrompt = ai.definePrompt({
  name: 'analyzeHtmlRecommendPrompt',
  input: {schema: AnalyzeHtmlInputSchema},
  output: {schema: AnalyzeHtmlOutputSchema},
  prompt: `You are an expert web developer and architect specialized in modern web technologies.
Your task is to analyze the provided HTML code and recommend suitable modern web frameworks or layout systems.

Consider the structure, complexity, potential interactivity, and styling needs implied by the HTML content.
For each recommendation, provide a brief explanation of why it is a good fit.

Here is the HTML content to analyze:

HTML:
{{htmlContent}}
`,
});

const analyzeHtmlAndRecommendFrameworksFlow = ai.defineFlow(
  {
    name: 'analyzeHtmlAndRecommendFrameworksFlow',
    inputSchema: AnalyzeHtmlInputSchema,
    outputSchema: AnalyzeHtmlOutputSchema,
  },
  async input => {
    const {output} = await analyzeHtmlRecommendPrompt(input);
    return output!;
  }
);
