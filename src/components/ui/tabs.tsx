'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import clsx from 'clsx'
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg bg-slate-900/60 p-1 text-slate-400 shadow-inner shadow-slate-900/80 backdrop-blur',
        className
      )}
      {...props}
    />
  )
)

TabsList.displayName = TabsPrimitive.List.displayName

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={clsx(
      'inline-flex min-w-[120px] items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 data-[state=active]:bg-primary-500 data-[state=active]:text-white data-[state=active]:shadow-elevation data-[state=inactive]:text-slate-300',
      className
    )}
    {...props}
  />
))

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={clsx('mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-inner', className)}
    {...props}
  />
))

TabsContent.displayName = TabsPrimitive.Content.displayName
