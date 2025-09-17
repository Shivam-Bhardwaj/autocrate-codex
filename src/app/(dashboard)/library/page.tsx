import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const templates = [
  {
    id: 'std-mid-tower',
    name: 'Mid Tower Semiconductor Equipment',
    revision: 'REV D',
    description: 'Optimized for medium payloads with enhanced vibration dampening.',
    materials: 'Hem-Fir #2 / 19mm plywood'
  },
  {
    id: 'std-heavy-duty',
    name: 'Heavy Duty Crate',
    revision: 'REV B',
    description: 'High-mass assemblies with triple skid foundation and 125% safety factor.',
    materials: 'Douglas Fir #1 / 25mm plywood'
  }
]

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Template Library</h1>
        <p className="text-sm text-slate-400">
          Browse approved NX templates synchronized with Teamcenter for rapid crate generation.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{template.name}</p>
                <p className="text-xs text-slate-400">{template.revision}</p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-wide text-primary-200">
                STEP Ready
              </span>
            </div>
            <Separator />
            <p className="text-sm text-slate-300">{template.description}</p>
            <p className="text-xs text-slate-500">Materials: {template.materials}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
