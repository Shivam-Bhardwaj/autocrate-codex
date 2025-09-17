'use client'

import { useState, useEffect, useRef } from 'react'
import CrateVisualizer from '@/components/CrateVisualizer'
import { NXGenerator, CrateConfig } from '@/lib/nx-generator'

export default function Home() {
  // Store input values as strings for better input handling
  const [inputValues, setInputValues] = useState({
    length: '135',
    width: '135',
    height: '135',
    weight: '10000'
  })

  // State for 3x4 lumber permission toggle
  const [allow3x4Lumber, setAllow3x4Lumber] = useState(false)

  // State for display options
  const [displayOptions, setDisplayOptions] = useState({
    // Component visibility toggles
    visibility: {
      skids: true,
      floorboards: true,
      panels: true,
      cleats: true,
      top: true
    },
    // Lumber size preferences
    lumberSizes: {
      '2x6': true,
      '2x8': true,
      '2x10': true,
      '2x12': true
    }
  })

  const [config, setConfig] = useState<CrateConfig>({
    product: {
      length: 135,
      width: 135,
      height: 135,
      weight: 10000
    },
    clearances: {
      side: 2,
      end: 2,
      top: 3
    },
    materials: {
      skidSize: '4x4',
      panelThickness: 0.75,
      cleatSize: '2x4',
      allow3x4Lumber: false
    }
  })

  const [generator, setGenerator] = useState<NXGenerator>(() => new NXGenerator(config))
  const [activeTab, setActiveTab] = useState<'visualization' | 'expressions' | 'bom'>('visualization')
  const debounceTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  // Update generator when config changes or 3x4 lumber permission changes
  useEffect(() => {
    // Filter available lumber sizes based on toggles
    const availableLumber = Object.entries(displayOptions.lumberSizes)
      .filter(([_size, enabled]) => enabled)
      .map(([size, _enabled]) => size as '2x6' | '2x8' | '2x10' | '2x12')

    setGenerator(new NXGenerator({
      ...config,
      materials: {
        ...config.materials,
        allow3x4Lumber: allow3x4Lumber,
        availableLumber: availableLumber
      }
    }))
  }, [config, allow3x4Lumber, displayOptions.lumberSizes])

  const handleInputChange = (field: keyof typeof inputValues, value: string) => {
    // Update input value immediately
    setInputValues(prev => ({ ...prev, [field]: value }))

    // Clear existing timeout for this field
    if (debounceTimeoutRef.current[field]) {
      clearTimeout(debounceTimeoutRef.current[field])
    }

    // Debounce the config update
    debounceTimeoutRef.current[field] = setTimeout(() => {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        setConfig(prev => ({
          ...prev,
          product: { ...prev.product, [field]: numValue }
        }))
      }
    }, 500) // 500ms delay before updating config
  }

  const handleInputBlur = (field: keyof typeof inputValues) => {
    // Immediately update config on blur
    const value = inputValues[field]
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setConfig(prev => ({
        ...prev,
        product: { ...prev.product, [field]: numValue }
      }))
    }
  }

  const downloadExpressions = () => {
    const expressions = generator.exportNXExpressions()
    const blob = new Blob([expressions], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crate_expressions_${Date.now()}.exp`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadBOM = () => {
    const bom = generator.generateBOM()
    const csv = 'Item,Size,Quantity,Material\n' +
      bom.map(row => `${row.item},"${row.size}",${row.quantity},${row.material}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crate_bom_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Helper functions for display options
  const toggleComponentVisibility = (component: keyof typeof displayOptions.visibility) => {
    setDisplayOptions(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [component]: !prev.visibility[component]
      }
    }))
  }

  const toggleLumberSize = (size: keyof typeof displayOptions.lumberSizes) => {
    setDisplayOptions(prev => ({
      ...prev,
      lumberSizes: {
        ...prev.lumberSizes,
        [size]: !prev.lumberSizes[size]
      }
    }))
  }

  // Filter boxes based on visibility settings
  const getFilteredBoxes = () => {
    return generator.getBoxes().filter(box => {
      // Check component visibility
      if (box.type === 'skid' && !displayOptions.visibility.skids) return false
      if (box.type === 'floor' && !displayOptions.visibility.floorboards) return false
      if (box.type === 'panel' && !displayOptions.visibility.panels) return false
      if (box.type === 'cleat' && !displayOptions.visibility.cleats) return false
      if (box.name === 'TOP_PANEL' && !displayOptions.visibility.top) return false

      return true
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">AutoCrate NX Generator</h1>
          <p className="text-gray-600 mt-2">Generate NX expressions using Two Diagonal Points method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Product Dimensions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Product Dimensions</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Length (Y-axis, inches)</label>
                  <input
                    type="text"
                    value={inputValues.length}
                    onChange={(e) => handleInputChange('length', e.target.value)}
                    onBlur={() => handleInputBlur('length')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Width (X-axis, inches)</label>
                  <input
                    type="text"
                    value={inputValues.width}
                    onChange={(e) => handleInputChange('width', e.target.value)}
                    onBlur={() => handleInputBlur('width')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (Z-axis, inches)</label>
                  <input
                    type="text"
                    value={inputValues.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    onBlur={() => handleInputBlur('height')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (pounds)</label>
                  <input
                    type="text"
                    value={inputValues.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    onBlur={() => handleInputBlur('weight')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
              </div>
            </div>

            {/* Material Options */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Material Options</h2>
              <div className="flex items-center justify-between">
                <label htmlFor="allow3x4" className="text-sm font-medium text-gray-700">
                  Allow 3x4 Lumber
                </label>
                <button
                  id="allow3x4"
                  onClick={() => setAllow3x4Lumber(!allow3x4Lumber)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    allow3x4Lumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={allow3x4Lumber}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allow3x4Lumber ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {allow3x4Lumber
                  ? '3x4 lumber will be used for products under 500 lbs'
                  : '4x4 lumber will be used for all products under 4500 lbs'}
              </p>
            </div>

            {/* Calculated Dimensions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Calculated Dimensions</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Width:</span>
                  <span className="font-medium">{generator.getExpressions().get('overall_width')?.toFixed(2)}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Length:</span>
                  <span className="font-medium">{generator.getExpressions().get('overall_length')?.toFixed(2)}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Height:</span>
                  <span className="font-medium">{generator.getExpressions().get('overall_height')?.toFixed(2)}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skid Size:</span>
                  <span className="font-medium">{generator.getExpressions().get('skid_width')?.toFixed(1)}"</span>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Display Options</h2>

              {/* Component Visibility Toggles */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Component Visibility</h3>
                <div className="space-y-3">
                  {Object.entries(displayOptions.visibility).map(([component, isVisible]) => (
                    <div key={component} className="flex items-center justify-between">
                      <label className="text-sm text-gray-600 capitalize">
                        {component === 'top' ? 'Top Panel' : component}
                      </label>
                      <button
                        onClick={() => toggleComponentVisibility(component as keyof typeof displayOptions.visibility)}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isVisible ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={isVisible}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isVisible ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lumber Size Selection */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preferred Floorboard Sizes</h3>
                <div className="space-y-2">
                  {Object.entries(displayOptions.lumberSizes).map(([size, isSelected]) => (
                    <div key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        id={size}
                        checked={isSelected}
                        onChange={() => toggleLumberSize(size as keyof typeof displayOptions.lumberSizes)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={size} className="ml-2 text-sm text-gray-600">
                        {size} Lumber
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  System will automatically select the most appropriate size based on weight and span requirements.
                </p>
              </div>
            </div>

            {/* Export Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Export</h2>
              <div className="space-y-2">
                <button
                  onClick={downloadExpressions}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Download NX Expressions
                </button>
                <button
                  onClick={downloadBOM}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Download BOM (CSV)
                </button>
              </div>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('visualization')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'visualization'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    3D Visualization
                  </button>
                  <button
                    onClick={() => setActiveTab('expressions')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'expressions'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    NX Expressions
                  </button>
                  <button
                    onClick={() => setActiveTab('bom')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'bom'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Bill of Materials
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'visualization' && (
                  <div className="h-[600px]">
                    <CrateVisualizer boxes={getFilteredBoxes()} />
                    <p className="text-sm text-gray-600 mt-2">
                      Rotate: Left click + drag | Pan: Right click + drag | Zoom: Scroll
                    </p>
                  </div>
                )}

                {activeTab === 'expressions' && (
                  <div className="h-[600px] overflow-auto">
                    <pre className="text-xs bg-gray-50 p-4 rounded">
                      {generator.exportNXExpressions()}
                    </pre>
                  </div>
                )}

                {activeTab === 'bom' && (
                  <div className="h-[600px] overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Material
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {generator.generateBOM().map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.item}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.material}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}