import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { expect, test } from 'vitest'
import { add } from '../tools/add.ts'

test('add', () => {
  expect(add(2, 3)).toBe(5)
})

// Guards the wiring rather than the logic. A tool that never gets registered,
// or a server that stops answering on /mcp, still starts up fine and only looks
// broken from a client. So this starts server.ts the way foro.sh does, in its
// own process, and asks it over HTTP what it serves.
test('server.ts serves every tool at /mcp', async () => {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const child = spawn(process.execPath, ['server.ts'], {
    cwd: root,
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'inherit'],
  })

  try {
    const url = await new Promise<string>((resolve, reject) => {
      child.stdout.on('data', (chunk) => {
        const match = /http:\/\/\S+\/mcp/.exec(String(chunk))
        if (match) resolve(match[0])
      })
      child.on('exit', (code) => reject(new Error(`server.ts exited with code ${code}`)))
    })

    const client = new Client({ name: 'test', version: '0.0.0' })
    await client.connect(new StreamableHTTPClientTransport(new URL(url)))

    const { tools } = await client.listTools()
    expect(tools.map((tool) => tool.name)).toContain('add')

    const result = await client.callTool({ name: 'add', arguments: { a: 2, b: 3 } })
    expect(result.content).toEqual([{ type: 'text', text: '5' }])

    await client.close()
  } finally {
    child.kill()
  }
})
