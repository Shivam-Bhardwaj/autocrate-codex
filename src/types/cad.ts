export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface ProductSpecification {
  length: number
  width: number
  height: number
  weight: number
  centerOfGravity: Vector3
}

export interface ClearanceSpecification {
  width: number
  length: number
  height: number
}

export interface SkidSpecification {
  overhang: {
    front: number
    back: number
  }
  material: string
  spacing: number
}

export interface MaterialSelection {
  lumber: {
    grade: string
    treatment: string
  }
  plywood: {
    grade: string
    thickness: number
  }
  hardware: {
    coating: string
  }
}

export interface CrateConfiguration {
  id: string
  name: string
  templateVersion: string
  product: ProductSpecification
  clearances: ClearanceSpecification
  skids: SkidSpecification
  materials: MaterialSelection
  priority?: number
}

export interface CrateDesign {
  configuration: CrateConfiguration
  estimatedCost: number
  materialEfficiency: number
  lastValidatedAt?: string
}

export interface CADModelMetadata {
  modelUri: string
  previewImage?: string
  revision: string
}

export interface CrateModel {
  geometry: unknown
  metadata: CADModelMetadata
  materials: Array<{
    name: string
    density: number
    mechanicalProperties: Record<string, number | string>
    standardCompliance: string
  }>
  partNumbers: string[]
  bomData: Array<{
    partNumber: string
    description: string
    quantity: number
    unit: string
  }>
}
