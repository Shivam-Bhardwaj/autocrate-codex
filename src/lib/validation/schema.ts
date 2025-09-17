import { z } from 'zod'

export const crateConfigurationSchema = z.object({
  name: z.string().min(3).max(100),
  product: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    weight: z.number().positive(),
    centerOfGravity: z.object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    })
  }),
  clearances: z.object({
    width: z.number().min(0.5),
    length: z.number().min(0.5),
    height: z.number().min(0.5)
  }),
  skids: z.object({
    overhang: z.object({
      front: z.number().min(0),
      back: z.number().min(0)
    }),
    material: z.string().min(2),
    spacing: z.number().min(12)
  }),
  materials: z.object({
    lumber: z.object({
      grade: z.string().min(2),
      treatment: z.string().min(1)
    }),
    plywood: z.object({
      grade: z.string().min(2),
      thickness: z.number().min(0.25)
    }),
    hardware: z.object({
      coating: z.string().min(2)
    })
  })
})

export type CrateConfigurationInput = z.infer<typeof crateConfigurationSchema>
