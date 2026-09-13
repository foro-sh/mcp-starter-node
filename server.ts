import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createMcpServer } from './app.ts'

const http = createServer(async (req, res) => {
  // /mcp matches FastMCP's default path: foro.sh's generated client configs
  // always point at `<url>/mcp`, whatever the runtime.
  if (new URL(req.url ?? '/', 'http://localhost').pathname !== '/mcp') {
    res.writeHead(404).end()
    return
  }

  // Stateless, so every request gets its own server and transport. The SDK
  // refuses to reuse a stateless transport across requests.
  const server = createMcpServer()
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  res.on('close', () => {
    void transport.close()
    void server.close()
  })

  try {
    await server.connect(transport)
    await transport.handleRequest(req, res)
  } catch (err) {
    console.error(err)
    if (!res.headersSent) res.writeHead(500).end()
  }
})

// foro.sh sets PORT. Bind all interfaces: a server on 127.0.0.1 fails the
// platform's health check.
http.listen(Number(process.env.PORT ?? 8000), () => {
  const { port } = http.address() as AddressInfo
  console.log(`MCP server listening on http://localhost:${port}/mcp`)
})
