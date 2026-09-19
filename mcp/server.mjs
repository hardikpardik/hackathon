import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(process.cwd(), 'workshop-data')

const read = async (name) =>
  JSON.parse(await readFile(resolve(root, name), 'utf8'))

const tools = [
  {
    name: 'list_incidents',
    description: 'List seeded production incidents',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_incident',
    description: 'Get one incident by id',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'list_service_health',
    description: 'List current service health',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_recent_deploys',
    description: 'List recent deployments',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string' }
      }
    }
  },
  {
    name: 'search_logs',
    description: 'Search recent log messages',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      },
      required: ['query']
    }
  }
]

// Normal MCP protocol response
const send = (id, value) => {
  process.stdout.write(
    JSON.stringify({
      jsonrpc: '2.0',
      id,
      result: value
    }) + '\n'
  )
}

// Tool calls specifically return content blocks
const sendToolResult = (id, value) => {
  send(id, {
    content: [
      {
        type: 'text',
        text: JSON.stringify(value, null, 2)
      }
    ]
  })
}

process.stdin.setEncoding('utf8')

let buffer = ''

process.stdin.on('data', async (chunk) => {
  buffer += chunk

  const lines = buffer.split('\n')
  buffer = lines.pop() ?? ''

  for (const line of lines.filter(Boolean)) {
    try {
      const request = JSON.parse(line)

      // MCP initialization
      if (request.method === 'initialize') {
        send(request.id, {
          protocolVersion: '2024-11-05',

          capabilities: {
            tools: {},
            logging: {}
          },

          serverInfo: {
            name: 'incident-data',
            version: '1.0.0'
          }
        })
      }

      // Initialization notification
      else if (request.method === 'notifications/initialized') {
        continue
      }

      // VS Code may ask the MCP server for a log level
      else if (request.method === 'logging/setLevel') {
        send(request.id, {})
      }

      // Basic MCP health check
      else if (request.method === 'ping') {
        send(request.id, {})
      }

      // Return available tools
      else if (request.method === 'tools/list') {
        send(request.id, {
          tools
        })
      }

      // Execute tools
      else if (request.method === 'tools/call') {
        const { name } = request.params
        const args = request.params.arguments ?? {}

        let data

        if (name === 'list_incidents') {
          data = await read('incidents.json')
        }

        else if (name === 'get_incident') {
          data = (await read('incidents.json'))
            .find((item) => item.id === args.id)
        }

        else if (name === 'list_service_health') {
          data = await read('services.json')
        }

        else if (name === 'get_recent_deploys') {
          data = (await read('deploys.json'))
            .filter(
              (item) =>
                !args.service ||
                item.service === args.service
            )
        }

        else if (name === 'search_logs') {
          data = (await read('logs.json'))
            .filter((item) =>
              item.message
                .toLowerCase()
                .includes(args.query.toLowerCase())
            )
        }

        else {
          data = {
            error: `Unknown tool: ${name}`
          }
        }

        sendToolResult(
          request.id,
          data ?? { error: 'Not found' }
        )
      }
    }

    catch (error) {
      console.error(error)
    }
  }
})
