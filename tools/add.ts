import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

export function add(a: number, b: number): number {
  return a + b
}

export function registerAdd(server: McpServer): void {
  server.registerTool(
    'add',
    { description: 'Add two numbers.', inputSchema: { a: z.number(), b: z.number() } },
    async ({ a, b }) => ({ content: [{ type: 'text', text: String(add(a, b)) }] }),
  )
}
