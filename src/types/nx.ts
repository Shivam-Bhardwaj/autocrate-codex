import type { CrateConfiguration } from './cad'

export interface NXExpressionMetadata {
  generatedAt: string
  version: string
  templateVersion: string
  standardsCompliance: string
  validationChecksum: string
}

export interface ProductSpecs {
  product_length_in: number
  product_width_in: number
  product_height_in: number
  product_weight_lb: number
  product_center_of_gravity_x: number
  product_center_of_gravity_y: number
  product_center_of_gravity_z: number
}

export interface CalculatedDimensions {
  crate_overall_width_OD_in: number
  crate_overall_length_OD_in: number
  crate_overall_height_OD_in: number
  internal_clearance_width: number
  internal_clearance_length: number
  internal_clearance_height: number
}

export interface SkidSpecs {
  skid_lumber_size_callout: string
  skid_actual_height_in: number
  skid_actual_width_in: number
  skid_count: number
  skid_pitch_in: number
  skid_overhang_front_in: number
  skid_overhang_back_in: number
}

export interface PanelSpecification {
  id: string
  material: string
  thickness: number
  width: number
  height: number
  cleatCount: number
}

export interface HardwareSpecs {
  lag_screw_count: number
  klimp_count: number
  flat_washer_count: number
  cleat_screw_count: number
  fastening_pattern: string
}

export interface MaterialSpecs {
  lumber_grade: string
  lumber_treatment: string
  plywood_grade: string
  plywood_thickness: number
  hardware_coating: string
}

export interface NXExpressionFile {
  metadata: NXExpressionMetadata
  productSpecs: ProductSpecs
  calculatedDimensions: CalculatedDimensions
  skidSpecs: SkidSpecs
  panelSpecs: PanelSpecification[]
  hardwareSpecs: HardwareSpecs
  materialSpecs: MaterialSpecs
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface UpdateResult {
  templateId: string
  appliedAt: string
}

export interface NXExpressionGenerator {
  generateExpressions(config: CrateConfiguration): Promise<NXExpressionFile>
  validateExpressions(expressions: NXExpressionFile): Promise<ValidationResult>
  updateNXTemplate(templateId: string, expressions: NXExpressionFile): Promise<UpdateResult>
}
