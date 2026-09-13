import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerAdd } from './tools/add.ts'

/** A server with every tool registered. A tool file that isn't registered
 *  here is never served, and the server starts fine without it, so add each
 *  new tool to this list. tests/tools.test.ts checks what actually gets
 *  served. */
export function createMcpServer(): McpServer {
  const server = new McpServer({ name: 'mcp-server', version: '0.1.0' })
  registerAdd(server)
  return server
}
