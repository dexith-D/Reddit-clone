import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode('data: connected\n\n'))

      // In a real app, you'd subscribe to a pub/sub or database changes
      // For simplicity, just keep the connection open
    },
    cancel() {
      // Cleanup
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}