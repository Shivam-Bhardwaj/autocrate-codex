# Changelog

All notable changes to AutoCrate NX Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-09-17

### Added

#### UI/UX Improvements
- **Full-Screen Layout** - Revamped UI to utilize entire viewport without scrolling
- **Maximized 3D View** - 3D visualization now uses ~80% of screen width
- **Compact Sidebar** - Reduced sidebar to 256px for maximum visualization space
- **Mobile Responsive** - Added hamburger menu for mobile devices
- **Lumber Format Display** - Skid sizes now shown as lumber format (e.g., "6x6 lumber" instead of "5.5")
- **Quick Export Access** - Export buttons moved to header for immediate access

### Changed
- Optimized spacing throughout with reduced padding and margins
- Header height minimized to maximize content area
- Input fields reorganized in compact grid layouts
- Display options condensed with smaller checkboxes
- Fixed Three.js canvas to properly fill container with CSS rules

### Fixed
- Canvas container now properly expands to full available width
- Removed viewport width restrictions for proper full-screen usage
- Ensured proper overflow handling for no-scroll design

## [1.1.0] - 2025-09-17

### Added

#### Enhanced Skid and Floorboard System
- **Proper Skid Sizing** - Implemented weight-based skid sizing according to Table 5-3 standards
- **Skid Spacing Calculations** - Added precise skid spacing based on Table 5-4 requirements
- **Single Skid Component** - Unified skid generation with pattern parameters for NX CAD
- **Individual Floorboard Components** - 20 separate floorboard components with suppression capability
- **Optimized Floorboard Layout** - Large boards on outside, narrow boards in center for material efficiency

#### UI and Control Improvements
- **Lumber Size Selection** - Interactive UI for selecting lumber dimensions (2x4, 2x6, 2x8, 2x10, 2x12)
- **Component Visibility Toggles** - Individual controls for showing/hiding skids, floorboards, and panels
- **Hover Tooltips** - Enhanced 3D visualization with interactive tooltips for components
- **Default Dimensions** - Set to 135" cube for maximum shipping size demonstration

#### Technical Enhancements
- **Fixed Panel Positioning** - Panels now properly positioned relative to skid height
- **Component Organization** - Improved structure for better NX CAD integration
- **Enhanced Documentation** - Updated inline comments and component descriptions

### Changed
- Updated default crate dimensions to 135x135x135 inches for maximum size example
- Improved floorboard arrangement algorithm for better material utilization
- Enhanced 3D rendering performance with optimized component visibility

### Fixed
- Panel positioning now accounts for skid height offset
- Floorboard suppression logic for proper NX CAD pattern generation
- Component naming consistency across all generated elements

## [1.0.0] - 2025-09-17

### Added

#### Core Features
- **NX Expression Generator** - Generates parametric expressions for NX CAD using Two Diagonal Points method
- **3D Visualization** - Real-time 3D preview of crate design using Three.js
- **Web Interface** - Clean, responsive UI built with Next.js 14 and Tailwind CSS
- **BOM Calculator** - Automatic Bill of Materials generation with CSV export
- **Expression Export** - Download NX-compatible .exp files for direct import

#### Technical Implementation
- **Coordinate System** - Proper NX-compatible coordinate system (X=width, Y=length, Z=height)
- **Component Structure** - SHIPPING_BASE (skids + floorboard) and CRATE_CAP (5 panels)
- **Smart Sizing** - Automatic skid sizing based on product weight
- **Two-Point Method** - All components defined using two diagonal points (6 values)
- **Real-time Updates** - Instant visualization updates as dimensions change

#### Components Generated
- Skids (2-4 based on weight)
- Floorboard
- Front Panel
- Back Panel
- Left End Panel
- Right End Panel
- Top Panel
- Cleats (reinforcement)

### Features
- Input validation for dimensions
- Real-time 3D preview with orbit controls
- Tabbed interface (3D View, NX Expressions, BOM)
- Download functionality for expressions and BOM
- Responsive design for desktop and tablet
- Grid floor reference for visualization
- Coordinate axis indicators

### Technical Stack
- Next.js 14.0.4
- TypeScript 5
- Three.js + React Three Fiber for 3D
- Tailwind CSS for styling
- Client-side only (no backend required)

### Documentation
- Comprehensive inline documentation
- NX integration instructions
- Coordinate system reference
- Applied Materials standards compliance ready

## Design Decisions

### Why Client-Side Only?
- All calculations are deterministic math
- No need for data persistence
- Instant performance with no network latency
- Enhanced privacy - no data leaves user's machine
- Simplified deployment and maintenance

### Why Two Diagonal Points Method?
- Standard NX CAD approach for box creation
- Minimal parameters (6 values per component)
- Unambiguous geometry definition
- Easy validation and debugging

### Coordinate System
- Matches NX CAD conventions
- Z=0 at floor level
- Symmetric about Z-Y plane (X=0 centerline)
- Right-handed coordinate system

## Known Limitations
- STEP file export not yet implemented
- Advanced materials selection pending
- Multi-crate configurations not supported
- No collaboration features (by design)

## Future Enhancements
- STEP AP242 export with PMI
- Material optimization algorithms
- Cost estimation
- Weight distribution analysis
- Forklift pocket positioning
- Custom template support

---

## Development Notes

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm start
```

### Key Files
- `/src/lib/nx-generator.ts` - Core NX expression generation logic
- `/src/components/CrateVisualizer.tsx` - 3D visualization component
- `/src/app/page.tsx` - Main application interface

### Testing Dimensions
- Small crate: 20x15x25 inches, 200 lbs
- Medium crate: 40x30x50 inches, 800 lbs
- Large crate: 60x48x72 inches, 2000 lbs

---

Built with precision for Applied Materials engineering standards.