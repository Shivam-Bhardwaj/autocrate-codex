'use client'

import { create } from 'zustand'
import { CrateConfiguration, CrateDesign } from '@/types/cad'

interface DesignStoreState {
  configuration: CrateConfiguration
  designHistory: CrateDesign[]
  setConfiguration: (config: Partial<CrateConfiguration>) => void
  recordDesign: (design: CrateDesign) => void
  reset: () => void
}

const defaultConfiguration: CrateConfiguration = {
  id: 'draft',
  name: 'New Crate Design',
  templateVersion: '2.0.0',
  product: {
    length: 60,
    width: 40,
    height: 48,
    weight: 500,
    centerOfGravity: { x: 0, y: 0, z: 0 }
  },
  clearances: {
    width: 2,
    length: 2,
    height: 4
  },
  skids: {
    overhang: { front: 2, back: 2 },
    material: 'Hem-Fir #2',
    spacing: 24
  },
  materials: {
    lumber: { grade: '#2', treatment: 'HT' },
    plywood: { grade: 'CDX', thickness: 0.75 },
    hardware: { coating: 'Zinc' }
  }
}

const generateId = () => `cfg_${Math.random().toString(36).slice(2, 10)}`

export const useDesignStore = create<DesignStoreState>((set) => ({
  configuration: defaultConfiguration,
  designHistory: [],
  setConfiguration: (config) =>
    set((state) => ({
      configuration: { ...state.configuration, ...config }
    })),
  recordDesign: (design) =>
    set((state) => ({
      designHistory: [
        {
          ...design,
          configuration: {
            ...design.configuration,
            id: design.configuration.id || generateId()
          }
        },
        ...state.designHistory
      ]
    })),
  reset: () =>
    set(() => ({
      configuration: { ...defaultConfiguration, id: generateId() },
      designHistory: []
    }))
}))
