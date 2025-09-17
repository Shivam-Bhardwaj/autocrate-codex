// NX Expression Generator with Two-Point Box Method
// Coordinate System: X=width (left/right), Y=length (front/back), Z=height (up)
// Origin at center of crate floor (Z=0)

export interface ProductDimensions {
  length: number  // Y-axis (front to back)
  width: number   // X-axis (left to right)
  height: number  // Z-axis (vertical)
  weight: number  // pounds
}

export interface CrateConfig {
  product: ProductDimensions
  clearances: {
    side: number     // clearance on each side (X)
    end: number      // clearance on each end (Y)
    top: number      // clearance on top (Z)
  }
  materials: {
    skidSize: '2x4' | '3x3' | '4x4'
    panelThickness: number
    cleatSize: '2x3' | '2x4'
  }
}

export interface Point3D {
  x: number
  y: number
  z: number
}

export interface NXBox {
  name: string
  point1: Point3D
  point2: Point3D
  color?: string
  type?: 'skid' | 'floor' | 'panel' | 'cleat'
}

export class NXGenerator {
  private boxes: NXBox[] = []
  private expressions: Map<string, number> = new Map()

  constructor(private config: CrateConfig) {
    this.calculate()
  }

  private getSkidDimensions() {
    const weight = this.config.product.weight
    if (weight < 500) return { height: 3.5, width: 3.5 } // 2x4 nominal
    if (weight < 1500) return { height: 3.5, width: 3.5 } // 4x4 nominal
    return { height: 5.5, width: 5.5 } // 6x6 for heavy
  }

  private getSkidCount() {
    const weight = this.config.product.weight
    if (weight < 500) return 2
    if (weight < 1500) return 3
    return 4
  }

  private calculate() {
    const { product, clearances, materials } = this.config

    // Internal dimensions
    const internalWidth = product.width + (2 * clearances.side)
    const internalLength = product.length + (2 * clearances.end)
    const internalHeight = product.height + clearances.top

    // Material dimensions
    const skidDims = this.getSkidDimensions()
    const panelThickness = materials.panelThickness

    // Overall external dimensions
    const overallWidth = internalWidth + (2 * panelThickness)
    const overallLength = internalLength + (2 * panelThickness)
    const overallHeight = internalHeight + skidDims.height + panelThickness

    // Store expressions
    this.expressions.set('product_length', product.length)
    this.expressions.set('product_width', product.width)
    this.expressions.set('product_height', product.height)
    this.expressions.set('product_weight', product.weight)

    this.expressions.set('clearance_side', clearances.side)
    this.expressions.set('clearance_end', clearances.end)
    this.expressions.set('clearance_top', clearances.top)

    this.expressions.set('internal_width', internalWidth)
    this.expressions.set('internal_length', internalLength)
    this.expressions.set('internal_height', internalHeight)

    this.expressions.set('panel_thickness', panelThickness)
    this.expressions.set('skid_height', skidDims.height)
    this.expressions.set('skid_width', skidDims.width)

    this.expressions.set('overall_width', overallWidth)
    this.expressions.set('overall_length', overallLength)
    this.expressions.set('overall_height', overallHeight)

    // Generate geometry
    this.generateShippingBase()
    this.generateCrateCap()
  }

  private generateShippingBase() {
    const skidDims = this.getSkidDimensions()
    const skidCount = this.getSkidCount()
    const internalWidth = this.expressions.get('internal_width')!
    const internalLength = this.expressions.get('internal_length')!
    const panelThickness = this.expressions.get('panel_thickness')!

    // Generate skids
    if (skidCount === 2) {
      // Two skids at edges
      this.boxes.push({
        name: 'SKID_1',
        point1: { x: -internalWidth/2, y: 0, z: 0 },
        point2: { x: -internalWidth/2 + skidDims.width, y: internalLength, z: skidDims.height },
        color: '#8B4513',
        type: 'skid'
      })
      this.boxes.push({
        name: 'SKID_2',
        point1: { x: internalWidth/2 - skidDims.width, y: 0, z: 0 },
        point2: { x: internalWidth/2, y: internalLength, z: skidDims.height },
        color: '#8B4513',
        type: 'skid'
      })
    } else if (skidCount === 3) {
      // Three skids: left, center, right
      this.boxes.push({
        name: 'SKID_1',
        point1: { x: -internalWidth/2, y: 0, z: 0 },
        point2: { x: -internalWidth/2 + skidDims.width, y: internalLength, z: skidDims.height },
        color: '#8B4513',
        type: 'skid'
      })
      this.boxes.push({
        name: 'SKID_2',
        point1: { x: -skidDims.width/2, y: 0, z: 0 },
        point2: { x: skidDims.width/2, y: internalLength, z: skidDims.height },
        color: '#8B4513',
        type: 'skid'
      })
      this.boxes.push({
        name: 'SKID_3',
        point1: { x: internalWidth/2 - skidDims.width, y: 0, z: 0 },
        point2: { x: internalWidth/2, y: internalLength, z: skidDims.height },
        color: '#8B4513',
        type: 'skid'
      })
    }

    // Floorboard
    this.boxes.push({
      name: 'FLOORBOARD',
      point1: { x: -internalWidth/2, y: 0, z: skidDims.height },
      point2: { x: internalWidth/2, y: internalLength, z: skidDims.height + panelThickness },
      color: '#DEB887',
      type: 'floor'
    })
  }

  private generateCrateCap() {
    const internalWidth = this.expressions.get('internal_width')!
    const internalLength = this.expressions.get('internal_length')!
    const internalHeight = this.expressions.get('internal_height')!
    const panelThickness = this.expressions.get('panel_thickness')!
    const skidHeight = this.expressions.get('skid_height')!

    const baseZ = skidHeight + panelThickness

    // Front Panel (Y=0)
    this.boxes.push({
      name: 'FRONT_PANEL',
      point1: { x: -internalWidth/2 - panelThickness, y: -panelThickness, z: baseZ },
      point2: { x: internalWidth/2 + panelThickness, y: 0, z: baseZ + internalHeight },
      color: '#F5DEB3',
      type: 'panel'
    })

    // Back Panel (Y=length)
    this.boxes.push({
      name: 'BACK_PANEL',
      point1: { x: -internalWidth/2 - panelThickness, y: internalLength, z: baseZ },
      point2: { x: internalWidth/2 + panelThickness, y: internalLength + panelThickness, z: baseZ + internalHeight },
      color: '#F5DEB3',
      type: 'panel'
    })

    // Left Panel (X=-width/2)
    this.boxes.push({
      name: 'LEFT_END_PANEL',
      point1: { x: -internalWidth/2 - panelThickness, y: 0, z: baseZ },
      point2: { x: -internalWidth/2, y: internalLength, z: baseZ + internalHeight },
      color: '#F5DEB3',
      type: 'panel'
    })

    // Right Panel (X=width/2)
    this.boxes.push({
      name: 'RIGHT_END_PANEL',
      point1: { x: internalWidth/2, y: 0, z: baseZ },
      point2: { x: internalWidth/2 + panelThickness, y: internalLength, z: baseZ + internalHeight },
      color: '#F5DEB3',
      type: 'panel'
    })

    // Top Panel
    this.boxes.push({
      name: 'TOP_PANEL',
      point1: { x: -internalWidth/2 - panelThickness, y: -panelThickness, z: baseZ + internalHeight },
      point2: { x: internalWidth/2 + panelThickness, y: internalLength + panelThickness, z: baseZ + internalHeight + panelThickness },
      color: '#F5DEB3',
      type: 'panel'
    })

    // Add cleats (simplified - just corner cleats for visualization)
    const cleatWidth = 2.5
    const cleatDepth = 3.5

    // Front panel cleats
    this.boxes.push({
      name: 'FRONT_CLEAT_LEFT',
      point1: { x: -internalWidth/2 - panelThickness, y: 0, z: baseZ },
      point2: { x: -internalWidth/2 - panelThickness + cleatWidth, y: cleatDepth, z: baseZ + internalHeight },
      color: '#8B4513',
      type: 'cleat'
    })
    this.boxes.push({
      name: 'FRONT_CLEAT_RIGHT',
      point1: { x: internalWidth/2 + panelThickness - cleatWidth, y: 0, z: baseZ },
      point2: { x: internalWidth/2 + panelThickness, y: cleatDepth, z: baseZ + internalHeight },
      color: '#8B4513',
      type: 'cleat'
    })
  }

  getBoxes(): NXBox[] {
    return this.boxes
  }

  getExpressions(): Map<string, number> {
    return this.expressions
  }

  exportNXExpressions(): string {
    let output = '# NX Expressions for AutoCrate\n'
    output += '# Generated: ' + new Date().toISOString() + '\n'
    output += '# Coordinate System: X=width, Y=length, Z=height\n'
    output += '# Origin at center of crate floor (Z=0)\n\n'

    // Export dimensions
    output += '# Product and Crate Dimensions\n'
    for (const [key, value] of this.expressions) {
      output += `${key}=${value.toFixed(3)}\n`
    }

    // Export component positions
    output += '\n# Component Positions (Two Diagonal Points)\n'
    for (const box of this.boxes) {
      output += `\n# ${box.name}\n`
      output += `${box.name}_X1=${box.point1.x.toFixed(3)}\n`
      output += `${box.name}_Y1=${box.point1.y.toFixed(3)}\n`
      output += `${box.name}_Z1=${box.point1.z.toFixed(3)}\n`
      output += `${box.name}_X2=${box.point2.x.toFixed(3)}\n`
      output += `${box.name}_Y2=${box.point2.y.toFixed(3)}\n`
      output += `${box.name}_Z2=${box.point2.z.toFixed(3)}\n`
    }

    return output
  }

  generateBOM() {
    const bom = []
    const skidCount = this.getSkidCount()
    const skidDims = this.getSkidDimensions()
    const internalLength = this.expressions.get('internal_length')!
    const internalWidth = this.expressions.get('internal_width')!
    const internalHeight = this.expressions.get('internal_height')!
    const panelThickness = this.expressions.get('panel_thickness')!

    // Skids
    bom.push({
      item: 'Skid',
      size: `${skidDims.width}" x ${skidDims.height}"`,
      length: internalLength,
      quantity: skidCount,
      material: 'Lumber'
    })

    // Floorboard
    bom.push({
      item: 'Floorboard',
      size: `${internalWidth}" x ${internalLength}"`,
      thickness: panelThickness,
      quantity: 1,
      material: 'Plywood'
    })

    // Panels
    bom.push({
      item: 'Front/Back Panel',
      size: `${internalWidth + 2*panelThickness}" x ${internalHeight}"`,
      thickness: panelThickness,
      quantity: 2,
      material: 'Plywood'
    })

    bom.push({
      item: 'Side Panel',
      size: `${internalLength}" x ${internalHeight}"`,
      thickness: panelThickness,
      quantity: 2,
      material: 'Plywood'
    })

    bom.push({
      item: 'Top Panel',
      size: `${internalWidth + 2*panelThickness}" x ${internalLength + 2*panelThickness}"`,
      thickness: panelThickness,
      quantity: 1,
      material: 'Plywood'
    })

    // Cleats (simplified)
    const cleatCount = 8 // Corner cleats minimum
    bom.push({
      item: 'Cleats',
      size: '2x4',
      totalLength: cleatCount * internalHeight,
      quantity: cleatCount,
      material: 'Lumber'
    })

    return bom
  }
}