import { NextRequest, NextResponse } from 'next/server'
import { NXExpressionFile } from '@/types/nx'

export async function POST(request: NextRequest) {
  const expressions = (await request.json()) as NXExpressionFile

  const missingMetadata = !expressions?.metadata?.validationChecksum
  const issues: string[] = []
  if (missingMetadata) {
    issues.push('Validation checksum missing from metadata block')
  }

  return NextResponse.json({
    isValid: issues.length === 0,
    errors: issues
  })
}
