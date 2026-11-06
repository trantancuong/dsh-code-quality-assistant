import { defineTool } from '@deepseek-ai/dsh-tools'
import { analyzeCode } from './analyzer.js'

export const name = 'dsh-code-quality-assistant'
export const inject = ['tools']

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'review_code_quality',
    description: [
      'Review source code for common maintainability, correctness, and security-risk patterns.',
      'Pass the source code directly. This tool performs heuristic/static pattern checks only; it does not execute code and does not replace a full security audit.',
      'Use the findings to explain likely issues and recommend fixes.'
    ].join(' '),
    parameters: {
      code: {
        type: 'string',
        required: true,
        description: 'Source code to review. Maximum 50000 characters.'
      },
      language: {
        type: 'string',
        required: false,
        description: 'Programming language, for example JavaScript, TypeScript, PHP, Python, Java, or unknown.'
      },
      focus: {
        type: 'string',
        required: false,
        description: 'Optional review focus, for example security, performance, maintainability, or all.'
      }
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          language: { type: 'string' },
          focus: { type: 'string' },
          summary: { type: 'string' },
          score: { type: 'number' },
          counts: {
            type: 'object',
            properties: {
              critical: { type: 'number' },
              high: { type: 'number' },
              medium: { type: 'number' },
              low: { type: 'number' },
              info: { type: 'number' }
            },
            required: ['critical', 'high', 'medium', 'low', 'info'],
            additionalProperties: false
          },
          findings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                severity: { type: 'string' },
                rule: { type: 'string' },
                line: { type: 'number' },
                message: { type: 'string' },
                recommendation: { type: 'string' },
                evidence: { type: 'string' }
              },
              required: ['severity', 'rule', 'line', 'message', 'recommendation', 'evidence'],
              additionalProperties: false
            }
          },
          limitations: { type: 'string' }
        },
        required: ['language', 'focus', 'summary', 'score', 'counts', 'findings', 'limitations'],
        additionalProperties: false
      },
      render: (_args, value) => [{
        type: 'text',
        text: JSON.stringify(value, null, 2)
      }]
    },
    async execute(args) {
      if (typeof args.code !== 'string' || args.code.trim().length === 0) {
        throw new Error('The code parameter must contain non-empty source code.')
      }
      if (args.code.length > 50000) {
        throw new Error('Code is too long. Please provide at most 50000 characters per review.')
      }

      return analyzeCode(args.code, {
        language: args.language || 'unknown',
        focus: args.focus || 'all'
      })
    }
  }))
}
