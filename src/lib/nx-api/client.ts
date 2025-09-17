import { CrateConfiguration } from '@/types/cad'
import { NXExpressionFile, ValidationResult } from '@/types/nx'

export interface NXJob {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  submittedAt: string
  completedAt?: string
  result?: NXExpressionFile
  error?: string
}

export async function requestExpressionGeneration(config: CrateConfiguration): Promise<NXJob> {
  const response = await fetch('/api/nx', {
    method: 'POST',
    body: JSON.stringify({ config }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to queue NX expression generation')
  }

  return response.json()
}

export async function validateExpressionFile(payload: NXExpressionFile): Promise<ValidationResult> {
  const response = await fetch('/api/nx/validate', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to validate expressions')
  }

  return response.json()
}
