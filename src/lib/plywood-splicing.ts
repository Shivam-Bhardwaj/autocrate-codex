// Plywood Splicing Algorithm
// Optimizes panel layouts for 48x96 inch plywood sheets
// Splicing rules: Vertical splices on right, Horizontal splices on bottom

export interface PlywoodSheet {
  width: number  // 48 inches max
  height: number // 96 inches max
}

export interface SplicePosition {
  x: number // X coordinate of splice start
  y: number // Y coordinate of splice start
  orientation: 'vertical' | 'horizontal'
}

export interface PanelSpliceLayout {
  panelName: string
  panelWidth: number
  panelHeight: number
  sheets: PlywoodSection[]
  splices: SplicePosition[]
  sheetCount: number
}

export interface PlywoodPiece {
  id: string
  panelName: string
  pieceIndex: number  // 0-5 for up to 6 pieces per panel
  // 7 parameters for NX positioning and sizing
  x: number          // X position in panel coordinate system
  y: number          // Y position in panel coordinate system
  z: number          // Z position (typically 0 for panels)
  width: number      // Width of the piece
  height: number     // Height of the piece
  thickness: number  // Thickness of the plywood
  rotation: number   // Rotation angle (typically 0)
  // Additional metadata
  selected: boolean  // Whether this piece is selected/active
  suppressed: boolean // Whether this piece is suppressed in NX
}

export interface PlywoodSection {
  id: string
  x: number      // Position in panel
  y: number      // Position in panel
  width: number  // Section width
  height: number // Section height
  sheetX: number // Position within source sheet
  sheetY: number // Position within source sheet
  sheetId: number // Which sheet this comes from
  piece?: PlywoodPiece // Associated plywood piece with full parameters
}

export class PlywoodSplicer {
  private static readonly MAX_SHEET_WIDTH = 48
  private static readonly MAX_SHEET_HEIGHT = 96
  private static readonly SPLICE_WIDTH = 0.125 // 1/8" for splice overlap

  /**
   * Calculate optimal splicing layout for a panel
   * @param panelWidth Width of the panel in inches
   * @param panelHeight Height of the panel in inches
   * @param panelName Name of the panel for identification
   * @returns Optimized splice layout
   */
  static calculateSpliceLayout(
    panelWidth: number,
    panelHeight: number,
    panelName: string
  ): PanelSpliceLayout {
    const sections: PlywoodSection[] = []
    const splices: SplicePosition[] = []

    // Calculate number of sheets needed in each direction
    const horizontalSections = Math.ceil(panelWidth / this.MAX_SHEET_WIDTH)
    const verticalSections = Math.ceil(panelHeight / this.MAX_SHEET_HEIGHT)

    let sheetId = 0

    // Build panels with full sheets at top, partials at bottom
    // This ensures horizontal splices are on the bottom
    const remainderHeight = panelHeight % this.MAX_SHEET_HEIGHT

    for (let vSection = 0; vSection < verticalSections; vSection++) {
      for (let hSection = 0; hSection < horizontalSections; hSection++) {
        const x = hSection * this.MAX_SHEET_WIDTH
        let y, sectionHeight

        if (vSection === 0 && remainderHeight > 0) {
          // First row (bottom): partial height piece
          y = 0
          sectionHeight = remainderHeight
        } else {
          // Subsequent rows: full height pieces
          const adjustedSection = remainderHeight > 0 ? vSection - 1 : vSection
          y = remainderHeight + (adjustedSection * this.MAX_SHEET_HEIGHT)
          sectionHeight = Math.min(this.MAX_SHEET_HEIGHT, panelHeight - y)
        }

        // Width calculation (partial on right)
        const sectionWidth = Math.min(
          this.MAX_SHEET_WIDTH,
          panelWidth - x
        )

        sections.push({
          id: `${panelName}_S${vSection}_${hSection}`,
          x: x,
          y: y,
          width: sectionWidth,
          height: sectionHeight,
          sheetX: 0,
          sheetY: 0,
          sheetId: sheetId++
        })

        // Add vertical splice if not the rightmost section
        if (hSection < horizontalSections - 1) {
          splices.push({
            x: (hSection + 1) * this.MAX_SHEET_WIDTH - this.SPLICE_WIDTH,
            y: y,
            orientation: 'vertical'
          })
        }

        // Add horizontal splice at top of bottom piece (if this is bottom piece and there's a piece above)
        if (vSection === 0 && verticalSections > 1 && remainderHeight > 0) {
          splices.push({
            x: x,
            y: remainderHeight - this.SPLICE_WIDTH,
            orientation: 'horizontal'
          })
        } else if (vSection > 0 && vSection < verticalSections - 1) {
          // Add splice at top of this piece if not the topmost
          splices.push({
            x: x,
            y: y + sectionHeight - this.SPLICE_WIDTH,
            orientation: 'horizontal'
          })
        }
      }
    }

    return {
      panelName,
      panelWidth,
      panelHeight,
      sheets: sections,
      splices: splices,
      sheetCount: sheetId
    }
  }

  /**
   * Calculate splicing for all 6 panels of a crate
   * Returns layouts for: Front, Back, Left, Right, Top, Bottom(optional)
   */
  static calculateCrateSplicing(
    frontWidth: number,
    frontHeight: number,
    sideWidth: number,
    sideHeight: number,
    topWidth: number,
    topLength: number,
    includeBottom: boolean = false
  ): PanelSpliceLayout[] {
    const layouts: PanelSpliceLayout[] = []

    // Front and Back panels (same dimensions)
    layouts.push(this.calculateSpliceLayout(frontWidth, frontHeight, 'FRONT_PANEL'))
    layouts.push(this.calculateSpliceLayout(frontWidth, frontHeight, 'BACK_PANEL'))

    // Left and Right side panels (same dimensions)
    layouts.push(this.calculateSpliceLayout(sideWidth, sideHeight, 'LEFT_END_PANEL'))
    layouts.push(this.calculateSpliceLayout(sideWidth, sideHeight, 'RIGHT_END_PANEL'))

    // Top panel
    layouts.push(this.calculateSpliceLayout(topWidth, topLength, 'TOP_PANEL'))

    // Bottom panel (optional - typically not used in crates with floorboards)
    if (includeBottom) {
      layouts.push(this.calculateSpliceLayout(topWidth, topLength, 'BOTTOM_PANEL'))
    }

    return layouts
  }

  /**
   * Generate NX expressions for spliced panels
   * Creates separate box components for each plywood section
   */
  static generateSpliceExpressions(layout: PanelSpliceLayout): string {
    let output = `# Splice Layout for ${layout.panelName}\n`
    output += `# Panel Size: ${layout.panelWidth}" x ${layout.panelHeight}"\n`
    output += `# Number of sheets: ${layout.sheetCount}\n`
    output += `# Splices: ${layout.splices.length}\n\n`

    // Generate expressions for each section
    for (const section of layout.sheets) {
      output += `# ${section.id}\n`
      output += `${section.id}_X=${section.x.toFixed(3)}\n`
      output += `${section.id}_Y=${section.y.toFixed(3)}\n`
      output += `${section.id}_WIDTH=${section.width.toFixed(3)}\n`
      output += `${section.id}_HEIGHT=${section.height.toFixed(3)}\n\n`
    }

    // Generate splice positions
    if (layout.splices.length > 0) {
      output += `# Splice Positions\n`
      for (let i = 0; i < layout.splices.length; i++) {
        const splice = layout.splices[i]
        output += `${layout.panelName}_SPLICE_${i}_X=${splice.x.toFixed(3)}\n`
        output += `${layout.panelName}_SPLICE_${i}_Y=${splice.y.toFixed(3)}\n`
        output += `${layout.panelName}_SPLICE_${i}_TYPE="${splice.orientation}"\n`
      }
      output += '\n'
    }

    return output
  }

  /**
   * Calculate material usage statistics
   */
  static calculateMaterialUsage(layouts: PanelSpliceLayout[]): {
    totalSheets: number
    totalArea: number
    wasteArea: number
    efficiency: number
  } {
    const sheetArea = this.MAX_SHEET_WIDTH * this.MAX_SHEET_HEIGHT
    let totalPanelArea = 0
    let totalSheets = 0

    for (const layout of layouts) {
      totalPanelArea += layout.panelWidth * layout.panelHeight
      totalSheets += layout.sheetCount
    }

    const totalSheetArea = totalSheets * sheetArea
    const wasteArea = totalSheetArea - totalPanelArea
    const efficiency = (totalPanelArea / totalSheetArea) * 100

    return {
      totalSheets,
      totalArea: totalPanelArea,
      wasteArea,
      efficiency
    }
  }

  /**
   * Optimize layout for 130" cube capability
   * 6 sheets can create panels up to 130" in any dimension
   */
  static validateFor130Cube(width: number, height: number, length: number): boolean {
    // Check if dimensions can be achieved with 6 sheets
    const frontBackSheets = Math.ceil(width / this.MAX_SHEET_WIDTH) *
                           Math.ceil(height / this.MAX_SHEET_HEIGHT) * 2
    const sideSheets = Math.ceil(length / this.MAX_SHEET_WIDTH) *
                      Math.ceil(height / this.MAX_SHEET_HEIGHT) * 2
    const topSheets = Math.ceil(width / this.MAX_SHEET_WIDTH) *
                     Math.ceil(length / this.MAX_SHEET_HEIGHT)

    const totalSheets = frontBackSheets + sideSheets + topSheets

    return totalSheets <= 6
  }
}