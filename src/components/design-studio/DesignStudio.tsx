'use client'

import { useCallback, useMemo, useState } from 'react'
import { type Path, useForm } from 'react-hook-form'
import { crateConfigurationSchema, CrateConfigurationInput } from '@/lib/validation/schema'
import { useDesignStore } from '@/stores/design-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { CrateVisualizer } from '@/components/cad-viewer/CrateVisualizer'
import { generateCadModel } from '@/lib/cad-engine'
import { requestExpressionGeneration } from '@/lib/nx-api/client'
import type { CrateDesign } from '@/types/cad'

export function DesignStudio() {
  const { configuration, setConfiguration, recordDesign } = useDesignStore()
  const [showPMI, setShowPMI] = useState(true)
  const [showDimensions, setShowDimensions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const form = useForm<CrateConfigurationInput>({
    defaultValues: useMemo(
      () => ({
        name: configuration.name,
        product: configuration.product,
        clearances: configuration.clearances,
        skids: configuration.skids,
        materials: configuration.materials
      }),
      [configuration]
    )
  })

  const onSubmit = useCallback(
    async (values: CrateConfigurationInput) => {
      form.clearErrors()
      setStatusMessage(null)

      const overrides: Partial<CrateConfigurationInput> = values

      const candidateConfig: CrateConfigurationInput = {
        name: overrides.name ?? configuration.name,
        product: {
          ...configuration.product,
          ...overrides.product
        },
        clearances: {
          ...configuration.clearances,
          ...overrides.clearances
        },
        skids: {
          ...configuration.skids,
          ...overrides.skids,
          overhang: {
            ...configuration.skids.overhang,
            ...overrides.skids?.overhang
          }
        },
        materials: {
          lumber: {
            ...configuration.materials.lumber,
            ...overrides.materials?.lumber
          },
          plywood: {
            ...configuration.materials.plywood,
            ...overrides.materials?.plywood
          },
          hardware: {
            ...configuration.materials.hardware,
            ...overrides.materials?.hardware
          }
        }
      }

      const parsed = await crateConfigurationSchema.safeParseAsync(candidateConfig)
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          if (!issue.path.length) {
            return
          }

          const fieldPath = issue.path.join('.') as Path<CrateConfigurationInput>
          form.setError(fieldPath, { type: issue.code, message: issue.message })
        })

        setStatusMessage('Please correct the highlighted fields before submitting.')
        return
      }

      setIsSubmitting(true)
      setStatusMessage('Generating CAD preview…')

      const mergedConfig = {
        ...configuration,
        ...parsed.data,
        product: { ...parsed.data.product },
        clearances: { ...parsed.data.clearances },
        skids: { ...parsed.data.skids },
        materials: { ...parsed.data.materials }
      }

      try {
        setConfiguration(mergedConfig)

        const cad = await generateCadModel(mergedConfig)
        setStatusMessage('Queuing NX expression job…')

        const job = await requestExpressionGeneration(mergedConfig)

        const design: CrateDesign = {
          configuration: mergedConfig,
          estimatedCost: 1250,
          materialEfficiency: 88,
          lastValidatedAt: new Date().toISOString()
        }

        recordDesign(design)
        setStatusMessage(`NX job ${job.id} queued. Geometry handle: ${cad.geometryHandle}`)
      } catch (error) {
        console.error('Failed to submit crate design', error)
        setStatusMessage('Failed to generate NX expressions. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [configuration, form, recordDesign, setConfiguration]
  )

  return (
    <div className="space-y-8">
      <Tabs defaultValue="configuration">
        <TabsList>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Product Specifications</h2>
                <p className="text-sm text-slate-400">
                  Define the physical properties of the hardware being crated.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['length', 'width', 'height', 'weight'] as const).map((field) => (
                  <label key={field} className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-slate-400">{field}</span>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
                      {...form.register(`product.${field}`, { valueAsNumber: true })}
                    />
                  </label>
                ))}
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-3">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <label key={axis} className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-slate-400">CG {axis}</span>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
                      {...form.register(`product.centerOfGravity.${axis}`, { valueAsNumber: true })}
                    />
                  </label>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Standards & Materials</h2>
                <p className="text-sm text-slate-400">
                  Configure crate clearances, skid spacing, and material selections.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(['width', 'length', 'height'] as const).map((field) => (
                  <label key={field} className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-slate-400">Clearance {field}</span>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
                      {...form.register(`clearances.${field}`, { valueAsNumber: true })}
                    />
                  </label>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Skid Material</span>
                  <input
                    className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
                    {...form.register('skids.material')}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Skid Spacing</span>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
                    {...form.register('skids.spacing', { valueAsNumber: true })}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Lumber Grade</span>
                  <input
                    className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
                    {...form.register('materials.lumber.grade')}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Plywood Grade</span>
                  <input
                    className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
                    {...form.register('materials.plywood.grade')}
                  />
                </label>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Generate NX Expressions'}
              </Button>
              {statusMessage ? (
                <p className="text-sm text-primary-200">{statusMessage}</p>
              ) : null}
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="visualization">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={showPMI}
                  onChange={(event) => setShowPMI(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                />
                PMI Annotations
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={showDimensions}
                  onChange={(event) => setShowDimensions(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                />
                Dimensional Callouts
              </label>
            </div>
            <CrateVisualizer config={configuration} showPMI={showPMI} showDimensions={showDimensions} />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Recent Design Iterations</h2>
            {configuration.name ? (
              <p className="text-sm text-slate-400">
                Track automated NX jobs and validation artifacts for each iteration.
              </p>
            ) : null}
            <p className="text-sm text-slate-500">
              History persistence will connect to PostgreSQL via Prisma in a subsequent milestone.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
