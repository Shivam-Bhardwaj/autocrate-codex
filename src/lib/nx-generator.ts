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
    skidSize: '2x4' | '3x3' | '4x4' | '4x6' | '6x6' | '8x8'
    panelThickness: number
    cleatSize: '2x3' | '2x4'
    allow3x4Lumber?: boolean // Optional: allow 3x4 lumber for weights under 4500 lbs
    availableLumber?: ('2x6' | '2x8' | '2x10' | '2x12')[] // Optional: restrict available lumber sizes
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
  suppressed?: boolean
  metadata?: string
}

export class NXGenerator {
  private boxes: NXBox[] = []
  private expressions: Map<string, number> = new Map()

  constructor(private config: CrateConfig) {
    this.calculate()
  }

  private getSkidDimensions() {
    const weight = this.config.product.weight
    const allow3x4 = this.config.materials.allow3x4Lumber || false

    // Based on Table 5-3: Lumber Size vs Product Weight
    if (weight <= 500 && allow3x4) {
      // 3x4 skids - rotated so height remains 3.5" for forklift access
      // Only use if explicitly allowed
      return { height: 3.5, width: 2.5, nominal: '3x4' }
    } else if (weight <= 4500) {
      // 4x4 skids (or replace 3x4 when not allowed)
      // Note: "Any existing crate design drawings requiring 4 x 6 skids for product under 4500lbs
      // can have the 4 x 6 skids replaced with an equal or greater number of 4 x 4 skids"
      return { height: 3.5, width: 3.5, nominal: '4x4' }
    } else if (weight <= 20000) {
      // 4x6 skids
      return { height: 3.5, width: 5.5, nominal: '4x6' }
    } else if (weight <= 40000) {
      // 6x6 skids
      return { height: 5.5, width: 5.5, nominal: '6x6' }
    } else if (weight <= 60000) {
      // 8x8 skids
      return { height: 7.25, width: 7.25, nominal: '8x8' }
    } else {
      // Maximum supported weight exceeded, default to 8x8
      return { height: 7.25, width: 7.25, nominal: '8x8' }
    }
  }

  private getSkidSpacing() {
    const weight = this.config.product.weight
    const skidDims = this.getSkidDimensions()

    // Based on Table 5-4: Skid Size vs Spacing
    if (skidDims.nominal === '3x4' || skidDims.nominal === '4x4') {
      // 3 or 4 x 4 skids: spaced on center from one another <= 30.00"
      return { maxSpacing: 30, count: 3 }
    } else if (skidDims.nominal === '4x6') {
      if (weight <= 6000) {
        // spaced on center from one another <= 41.00" for product weighing less than 6,000 pounds
        return { maxSpacing: 41, count: 3 }
      } else if (weight <= 12000) {
        // <= 28.00" for product weighing 6,000-12,000 pounds
        return { maxSpacing: 28, count: 4 }
      } else if (weight <= 20000) {
        // <= 24.00" for product weighing 12,000-20,000lbs
        return { maxSpacing: 24, count: 4 }
      } else {
        // Should not reach here with 4x6, but fallback
        return { maxSpacing: 24, count: 4 }
      }
    } else if (skidDims.nominal === '6x6') {
      if (weight <= 30000) {
        // must be spaced <= 24.00" for product weighing 20,000-30,000lbs
        return { maxSpacing: 24, count: 4 }
      } else {
        // <= 20.00" for product weighing 30,000-40,000lbs
        return { maxSpacing: 20, count: 5 }
      }
    } else if (skidDims.nominal === '8x8') {
      // All 8 x 8 skids must be spaced <= 24.00"
      return { maxSpacing: 24, count: 5 }
    }

    // Default fallback
    return { maxSpacing: 30, count: 3 }
  }

  private getSkidCount() {
    const spacingInfo = this.getSkidSpacing()
    const internalWidth = this.config.product.width + (2 * this.config.clearances.side)
    const skidDims = this.getSkidDimensions()

    // Calculate actual number of skids needed based on max center-to-center spacing
    // We need to check if the skids can fit with the maximum allowed spacing

    // Start with the minimum count from the table
    let requiredCount = spacingInfo.count

    // Check if we need more skids to maintain max spacing
    // For n skids, we have (n-1) spaces between centers
    // Total span = (n-1) * maxSpacing + skidWidth (for the skid itself)
    while (requiredCount > 1) {
      const totalSpan = (requiredCount - 1) * spacingInfo.maxSpacing + skidDims.width
      if (totalSpan <= internalWidth) {
        // This number of skids fits within max spacing
        break
      }
      // Need more skids to maintain spacing requirement
      requiredCount++

      // Safety check to prevent infinite loop
      if (requiredCount > 10) {
        break
      }
    }

    return requiredCount
  }

  private getFloorboardDimensions() {
    const weight = this.config.product.weight
    const internalLength = this.config.product.length + (2 * this.config.clearances.end)
    const availableLumber = this.config.materials.availableLumber || ['2x6', '2x8', '2x10', '2x12']

    // Define all lumber options with their properties
    const lumberOptions = [
      { nominal: '2x6', width: 5.5, thickness: 1.5, maxWeight: 2000, maxSpan: 24 },
      { nominal: '2x8', width: 7.25, thickness: 1.5, maxWeight: 4000, maxSpan: 36 },
      { nominal: '2x10', width: 9.25, thickness: 1.5, maxWeight: 8000, maxSpan: 48 },
      { nominal: '2x12', width: 11.25, thickness: 1.5, maxWeight: Infinity, maxSpan: Infinity }
    ] as const

    // Filter by available lumber sizes
    const availableOptions = lumberOptions.filter(option =>
      availableLumber.includes(option.nominal as '2x6' | '2x8' | '2x10' | '2x12')
    )

    // If no available lumber, fallback to all options
    if (availableOptions.length === 0) {
      return { width: 5.5, thickness: 1.5, nominal: '2x6' }
    }

    // Find the most appropriate lumber size from available options
    // Sort by size (smallest first for optimization: large outside, narrow inside)
    const sortedOptions = availableOptions.sort((a, b) => a.width - b.width)

    // Find the smallest available lumber that can handle the weight and span
    for (const option of sortedOptions) {
      if (weight <= option.maxWeight && internalLength <= option.maxSpan) {
        return { width: option.width, thickness: option.thickness, nominal: option.nominal }
      }
    }

    // If no option meets the requirements, use the largest available lumber
    const largestOption = sortedOptions[sortedOptions.length - 1]
    return { width: largestOption.width, thickness: largestOption.thickness, nominal: largestOption.nominal }
  }

  private getFloorboardCount() {
    // Return the actual number of floorboards calculated by the layout algorithm
    return this.getFloorboardLayout().length
  }

  private getFloorboardLayout() {
    const internalLength = this.config.product.length + (2 * this.config.clearances.end)
    const availableLumber = this.config.materials.availableLumber || ['2x6', '2x8', '2x10', '2x12']

    // Define all lumber options with their properties
    const lumberOptions = [
      { nominal: '2x6', width: 5.5, thickness: 1.5 },
      { nominal: '2x8', width: 7.25, thickness: 1.5 },
      { nominal: '2x10', width: 9.25, thickness: 1.5 },
      { nominal: '2x12', width: 11.25, thickness: 1.5 }
    ] as const

    // Filter by available lumber sizes and sort by width (largest first for outside placement)
    const availableOptions = lumberOptions
      .filter(option => availableLumber.includes(option.nominal as '2x6' | '2x8' | '2x10' | '2x12'))
      .sort((a, b) => b.width - a.width) // Largest first

    // If no available lumber, fallback to 2x6
    if (availableOptions.length === 0) {
      availableOptions.push({ nominal: '2x6', width: 5.5, thickness: 1.5 })
    }

    // Calculate effective length (leave 1" on each end for panel/cleat space)
    const effectiveLength = internalLength - 2 // 1" front + 1" back
    const gapBetweenBoards = 0.125 // 1/8" gap between boards

    const layout: Array<{
      nominal: string
      width: number
      thickness: number
      position: number
      isCustom?: boolean
    }> = []

    let remainingLength = effectiveLength
    let currentPosition = -internalLength / 2 + 1 // Start 1" from front

    // Symmetric placement algorithm: place larger boards on outside, smaller toward center
    const placedBoards: typeof layout = []

    // Continue placing boards until we can't fit any more
    while (remainingLength > 0.25 && layout.length < 20) { // Minimum 1/4" space needed
      let boardPlaced = false

      // Try each available lumber size (largest first)
      for (const lumber of availableOptions) {
        const boardWithGap = lumber.width + gapBetweenBoards

        if (boardWithGap <= remainingLength) {
          layout.push({
            nominal: lumber.nominal,
            width: lumber.width,
            thickness: lumber.thickness,
            position: currentPosition
          })

          currentPosition += boardWithGap
          remainingLength -= boardWithGap
          boardPlaced = true
          break
        }
      }

      // If no standard board fits, add a custom board if gap is significant
      if (!boardPlaced) {
        if (remainingLength >= 2) { // Only create custom board if gap is 2" or more
          layout.push({
            nominal: 'CUSTOM',
            width: remainingLength - gapBetweenBoards,
            thickness: availableOptions[availableOptions.length - 1].thickness, // Use thickness of smallest available
            position: currentPosition,
            isCustom: true
          })
        }
        break
      }
    }

    // Now create symmetric layout: larger boards on outside, smaller toward center
    const symmetricLayout: typeof layout = []
    const sortedBySize = [...layout].sort((a, b) => b.width - a.width)

    let frontPosition = -internalLength / 2 + 1 // Start 1" from front
    let backPosition = internalLength / 2 - 1   // Start 1" from back

    for (let i = 0; i < sortedBySize.length; i++) {
      const board = sortedBySize[i]

      if (i % 2 === 0) {
        // Place on front side
        symmetricLayout.push({
          ...board,
          position: frontPosition
        })
        frontPosition += board.width + gapBetweenBoards
      } else {
        // Place on back side
        backPosition -= board.width
        symmetricLayout.push({
          ...board,
          position: backPosition
        })
        backPosition -= gapBetweenBoards
      }
    }

    // Sort by position for final layout
    return symmetricLayout.sort((a, b) => a.position - b.position)
  }

  private calculate() {
    const { product, clearances, materials } = this.config

    // Internal dimensions
    const internalWidth = product.width + (2 * clearances.side)
    const internalLength = product.length + (2 * clearances.end)
    const internalHeight = product.height + clearances.top

    // Material dimensions
    const skidDims = this.getSkidDimensions()
    const floorboardDims = this.getFloorboardDimensions()
    const panelThickness = materials.panelThickness

    // Overall external dimensions
    const overallWidth = internalWidth + (2 * panelThickness)
    const overallLength = internalLength + (2 * panelThickness)
    const overallHeight = internalHeight + skidDims.height + floorboardDims.thickness + panelThickness

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
    this.expressions.set('skid_nominal', skidDims.nominal ? skidDims.nominal.length : 0)

    // Floorboard expressions
    this.expressions.set('floorboard_width', floorboardDims.width)
    this.expressions.set('floorboard_thickness', floorboardDims.thickness)
    this.expressions.set('floorboard_length', internalWidth)
    this.expressions.set('floorboard_gap', 0.125)
    this.expressions.set('floorboard_count', this.getFloorboardCount())

    this.expressions.set('overall_width', overallWidth)
    this.expressions.set('overall_length', overallLength)
    this.expressions.set('overall_height', overallHeight)

    // Store skid spacing info
    const spacingInfo = this.getSkidSpacing()
    const skidCount = this.getSkidCount()
    this.expressions.set('skid_max_spacing', spacingInfo.maxSpacing)
    this.expressions.set('skid_count', skidCount)

    // Pattern parameters for skids
    this.expressions.set('pattern_count', skidCount)

    // Calculate actual spacing between skid centers
    let actualSpacing = spacingInfo.maxSpacing
    if (skidCount > 1) {
      const totalSpanWithMaxSpacing = (skidCount - 1) * spacingInfo.maxSpacing
      if (totalSpanWithMaxSpacing > internalWidth - skidDims.width) {
        // Need to reduce spacing to fit
        actualSpacing = (internalWidth - skidDims.width) / (skidCount - 1)
      }
    }
    this.expressions.set('pattern_spacing', actualSpacing)

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
    const patternSpacing = this.expressions.get('pattern_spacing')!

    // Create single skid at leftmost position (to be patterned)
    // Skid runs along Y-axis (front to back)
    // Pattern will be along X-axis (left to right)

    // Calculate leftmost skid position
    let leftmostCenterX: number
    if (skidCount === 1) {
      // Single skid at center
      leftmostCenterX = 0
    } else {
      // Multiple skids: calculate starting position for proper centering
      const totalPatternSpan = (skidCount - 1) * patternSpacing
      leftmostCenterX = -totalPatternSpan / 2
    }

    const leftmostX = leftmostCenterX - skidDims.width / 2

    // Create single skid component (leftmost position)
    // This will be patterned in NX using pattern_count and pattern_spacing
    this.boxes.push({
      name: 'SKID',
      point1: { x: leftmostX, y: 0, z: 0 },
      point2: { x: leftmostX + skidDims.width, y: internalLength, z: skidDims.height },
      color: '#8B4513',
      type: 'skid'
    })

    // Generate floorboard components using the new layout algorithm
    const floorboardLayout = this.getFloorboardLayout()

    // Create floorboard components based on the calculated layout
    for (let i = 0; i < floorboardLayout.length; i++) {
      const board = floorboardLayout[i]

      this.boxes.push({
        name: `FLOORBOARD_${i + 1}`,
        point1: {
          x: -internalWidth/2,
          y: board.position,
          z: skidDims.height
        },
        point2: {
          x: internalWidth/2,
          y: board.position + board.width,
          z: skidDims.height + board.thickness
        },
        color: board.isCustom ? '#FFB347' : '#DEB887', // Orange for custom boards, tan for standard
        type: 'floor',
        suppressed: false,
        metadata: `${board.nominal} (${board.width.toFixed(2)}" x ${board.thickness}")${board.isCustom ? ' - CUSTOM CUT' : ''}`
      })
    }

    // Create remaining suppressed floorboard placeholders up to 20 total
    for (let i = floorboardLayout.length; i < 20; i++) {
      this.boxes.push({
        name: `FLOORBOARD_${i + 1}`,
        point1: { x: 0, y: 0, z: skidDims.height },
        point2: { x: 0, y: 0, z: skidDims.height },
        color: '#888888',
        type: 'floor',
        suppressed: true,
        metadata: 'UNUSED - SUPPRESSED'
      })
    }
  }

  private generateCrateCap() {
    const internalWidth = this.expressions.get('internal_width')!
    const internalLength = this.expressions.get('internal_length')!
    const internalHeight = this.expressions.get('internal_height')!
    const panelThickness = this.expressions.get('panel_thickness')!
    const skidHeight = this.expressions.get('skid_height')!
    const floorboardThickness = this.expressions.get('floorboard_thickness')!

    const baseZ = skidHeight + floorboardThickness

    // Front Panel (sits on skids, Y = -internalLength/2)
    this.boxes.push({
      name: 'FRONT_PANEL',
      point1: { x: -internalWidth/2 - panelThickness, y: -internalLength/2 - panelThickness, z: 0 },
      point2: { x: internalWidth/2 + panelThickness, y: -internalLength/2, z: skidHeight + floorboardThickness + internalHeight },
      color: '#F5DEB3',
      type: 'panel'
    })

    // Back Panel (sits on skids, Y = internalLength/2)
    this.boxes.push({
      name: 'BACK_PANEL',
      point1: { x: -internalWidth/2 - panelThickness, y: internalLength/2, z: 0 },
      point2: { x: internalWidth/2 + panelThickness, y: internalLength/2 + panelThickness, z: skidHeight + floorboardThickness + internalHeight },
      color: '#F5DEB3',
      type: 'panel'
    })

    // Left Panel (touches outside of skids)
    this.boxes.push({
      name: 'LEFT_END_PANEL',
      point1: { x: -internalWidth/2 - panelThickness, y: -internalLength/2, z: baseZ },
      point2: { x: -internalWidth/2, y: internalLength/2, z: baseZ + internalHeight },
      color: '#F5DEB3',
      type: 'panel'
    })

    // Right Panel (touches outside of skids)
    this.boxes.push({
      name: 'RIGHT_END_PANEL',
      point1: { x: internalWidth/2, y: -internalLength/2, z: baseZ },
      point2: { x: internalWidth/2 + panelThickness, y: internalLength/2, z: baseZ + internalHeight },
      color: '#F5DEB3',
      type: 'panel'
    })

    // Top Panel
    this.boxes.push({
      name: 'TOP_PANEL',
      point1: { x: -internalWidth/2 - panelThickness, y: -internalLength/2 - panelThickness, z: baseZ + internalHeight },
      point2: { x: internalWidth/2 + panelThickness, y: internalLength/2 + panelThickness, z: baseZ + internalHeight + panelThickness },
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
    output += '# Origin at center of crate floor (Z=0)\n'
    output += '# \n'
    output += '# SKID PATTERN INSTRUCTIONS:\n'
    output += '# - Create single SKID component at leftmost position\n'
    output += '# - Pattern along X-axis (left to right) using:\n'
    output += '#   * Count: pattern_count\n'
    output += '#   * Spacing: pattern_spacing (center-to-center)\n'
    output += '# - Skids run along Y-axis (front to back)\n'
    output += '# \n'
    output += '# FLOORBOARD INSTRUCTIONS:\n'
    output += '# - 20 individual floorboard components (FLOORBOARD_1 through FLOORBOARD_20)\n'
    output += '# - Floorboards run along X-axis (perpendicular to skids)\n'
    output += '# - Floorboards sit on top of skids (Z position = skid_height)\n'
    output += '# - Only floorboard_count components should be active (unsuppressed)\n'
    output += '# - Remaining floorboards should be suppressed\n'
    output += `# - Active floorboards: ${this.expressions.get('floorboard_count')} out of 20 total\n`
    output += `# - Floorboard lumber size: ${this.getFloorboardDimensions().nominal}\n\n`

    // Export dimensions
    output += '# Product and Crate Dimensions\n'
    for (const [key, value] of this.expressions) {
      output += `${key}=${value.toFixed(3)}\n`
    }

    // Export component positions
    output += '\n# Component Positions (Two Diagonal Points)\n'
    for (const box of this.boxes) {
      output += `\n# ${box.name}\n`
      if (box.name === 'SKID') {
        output += `# NOTE: Pattern this component ${this.expressions.get('pattern_count')} times along X-axis\n`
        output += `# with center-to-center spacing of ${this.expressions.get('pattern_spacing')?.toFixed(3)}" \n`
      }
      if (box.name.startsWith('FLOORBOARD_')) {
        const suppressedText = box.suppressed ? ' (SUPPRESSED)' : ' (ACTIVE)'
        output += `# ${box.name}${suppressedText}\n`
      }
      if (box.suppressed) {
        output += `# ${box.name}_SUPPRESSED=TRUE\n`
      }
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

    // Skids (single component, patterned)
    bom.push({
      item: 'Skid',
      size: `${skidDims.nominal || `${skidDims.width}" x ${skidDims.height}"`}`,
      length: internalLength,
      quantity: skidCount,
      material: 'Lumber',
      note: `Min 3.5" height required for forklift access. Single component patterned ${skidCount} times.`
    })

    // Floorboards (individual lumber pieces)
    const floorboardDims = this.getFloorboardDimensions()
    const floorboardCount = this.getFloorboardCount()
    bom.push({
      item: 'Floorboard',
      size: `${floorboardDims.nominal} (${floorboardDims.width}" x ${floorboardDims.thickness}")`,
      length: internalWidth,
      quantity: floorboardCount,
      material: 'Lumber',
      note: `${floorboardCount} active boards out of 20 total components. Boards run perpendicular to skids.`
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