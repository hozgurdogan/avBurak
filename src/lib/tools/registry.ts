import type { ToolDefinition } from './types';
import {
  annualLeaveTool,
  overtimeTool,
  severanceTool,
  unemploymentBenefitTool,
} from './employment';
import { alimonyIncreaseTool, rentIncreaseTool } from './tenancy';
import { workAccidentTool } from './damages';
import { paroleTool } from './criminal';
import { inheritanceTool } from './inheritance';

/**
 * Every calculator, in display order. The slug is the URL segment and the key
 * under `tools.<slug>` in `messages/*.json`; adding a tool means adding it here
 * and adding its copy to all three locales.
 */
export const tools: readonly ToolDefinition[] = [
  severanceTool,
  paroleTool,
  rentIncreaseTool,
  alimonyIncreaseTool,
  workAccidentTool,
  annualLeaveTool,
  overtimeTool,
  unemploymentBenefitTool,
  inheritanceTool,
];

export const toolSlugs = tools.map((tool) => tool.slug);

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}

/** Zero-padded ordinal for the editorial index, matching the practice areas. */
export function toolNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}
