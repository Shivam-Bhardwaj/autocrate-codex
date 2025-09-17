export interface PMIAnnotationBase {
  id: string
  semanticReference: string
  referencedGeometry: string[]
}

export interface PMIDimension extends PMIAnnotationBase {
  type: 'DIMENSIONAL_SIZE'
  value: number
  tolerance: string
  position: [number, number, number]
  orientation: [number, number, number]
}

export interface PMIGeometricTolerance extends PMIAnnotationBase {
  type: string
  tolerance: string
  datumReferences: string[]
  symbolGeometry: string
  position: [number, number, number]
}

export interface PMINote extends PMIAnnotationBase {
  text: string
  leaderLines: Array<[number, number, number]>
}

export interface PMIAnnotations {
  dimensions: PMIDimension[]
  geometricTolerances: PMIGeometricTolerance[]
  notes: PMINote[]
  manufacturingNotes: string[]
  qualityNotes: string[]
}

export interface STEPFile {
  id: string
  content: ArrayBuffer | null
  metadata: {
    schema: string
    version: string
  }
}

export interface PMIValidationResult {
  isValid: boolean
  issues: string[]
}
