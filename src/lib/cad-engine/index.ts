import { CrateConfiguration, CrateDesign } from '@/types/cad'

export interface CadGenerationResult {
  geometryHandle: string
  previewUrl?: string
  warnings: string[]
}

export async function generateCadModel(config: CrateConfiguration): Promise<CadGenerationResult> {
  const hash = JSON.stringify(config)
  const geometryHandle = `crate-${hash.length}-${config.templateVersion}`

  return {
    geometryHandle,
    previewUrl: `/previews/${geometryHandle}.png`,
    warnings: []
  }
}

export async function deriveMaterialEfficiency(design: CrateDesign): Promise<number> {
  const { materialEfficiency } = design
  return Math.min(100, Math.max(0, materialEfficiency))
}
