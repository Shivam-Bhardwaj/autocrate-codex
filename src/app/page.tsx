'use client'

import { useState, useEffect } from 'react'
import CrateVisualizer from '@/components/CrateVisualizer'
import { NXGenerator, CrateConfig } from '@/lib/nx-generator'

export default function Home() {
  // Store input values as strings for better input handling
  const [inputValues, setInputValues] = useState({
    length: '40',
    width: '30',
    height: '50',
    weight: '800'
  })

  const [config, setConfig] = useState<CrateConfig>({
    product: {
      length: 40,
      width: 30,
      height: 50,
      weight: 800
    },
    clearances: {
      side: 2,
      end: 2,
      top: 3
    },
    materials: {
      skidSize: '4x4',
      panelThickness: 0.75,
      cleatSize: '2x4'
    }
  })

  const [generator, setGenerator] = useState<NXGenerator>(() => new NXGenerator(config))
  const [activeTab, setActiveTab] = useState<'visualization' | 'expressions' | 'bom'>('visualization')

  // Update generator when config changes
  useEffect(() => {
    setGenerator(new NXGenerator(config))
  }, [config])

  const handleInputChange = (field: keyof typeof inputValues, value: string) => {
    // Update input value immediately
    setInputValues(prev => ({ ...prev, [field]: value }))

    // Parse and update config if valid number
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Width (X-axis, inches)</label>
                  <input
                    type="text"
                    value={inputValues.width}
                    onChange={(e) => handleInputChange('width', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (Z-axis, inches)</label>
                  <input
                    type="text"
                    value={inputValues.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (pounds)</label>
                  <input
                    type="text"
                    value={inputValues.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
              </div>
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
                    <CrateVisualizer boxes={generator.getBoxes()} />
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