import { NextRequest, NextResponse } from 'next/server'
import { PMIAnnotations, PMIValidationResult } from '@/types/step'

interface StepRequestBody {
  model: unknown
  annotations: PMIAnnotations
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as StepRequestBody

  if (!body?.annotations) {
    return NextResponse.json({ error: 'Missing PMI annotations' }, { status: 400 })
  }

  const validation: PMIValidationResult = {
    isValid: true,
    issues: []
  }

  return NextResponse.json({
    file: {
      id: `step-${Date.now()}`,
      metadata: { schema: 'ap242_managed_model_based_3d_engineering', version: '1.0' },
      content: null
    },
    validationReport: validation
  })
}
