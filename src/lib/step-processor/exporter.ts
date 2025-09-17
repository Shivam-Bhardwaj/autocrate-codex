import { PMIAnnotations, STEPFile } from '@/types/step'
import { CrateModel } from '@/types/cad'

export interface StepExportResult {
  file: STEPFile
  validationReport: {
    isValid: boolean
    issues: string[]
  }
}

export async function exportStepWithPmi(model: CrateModel, annotations: PMIAnnotations): Promise<StepExportResult> {
  const payload = await fetch('/api/step', {
    method: 'POST',
    body: JSON.stringify({ model, annotations }),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!payload.ok) {
    throw new Error('Failed to export STEP file')
  }

  return payload.json()
}
