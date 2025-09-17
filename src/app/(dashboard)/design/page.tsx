import { DesignStudio } from '@/components/design-studio/DesignStudio'
import { NXExportPanel } from '@/components/nx-integration/NXExportPanel'

export const metadata = {
  title: 'AutoCrate Design Studio'
}

export default function DesignPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Design Studio</h1>
        <p className="text-sm text-slate-400">
          Configure crate parameters, generate NX expressions, and preview PMI-rich CAD assemblies in
          real-time.
        </p>
      </header>
      <DesignStudio />
      <NXExportPanel />
    </div>
  )
}
