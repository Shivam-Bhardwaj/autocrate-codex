import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { crateConfigurationSchema } from '@/lib/validation/schema'

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const parseResult = crateConfigurationSchema.safeParse(payload.config)

  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid configuration payload', details: parseResult.error.flatten() },
      { status: 400 }
    )
  }

  const jobId = crypto.randomUUID()

  return NextResponse.json({
    id: jobId,
    status: 'queued',
    submittedAt: new Date().toISOString()
  })
}
