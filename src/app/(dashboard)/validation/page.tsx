import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const checks = [
  {
    id: 'health',
    title: 'NX Model Health',
    status: 'Healthy',
    description: 'No failed features detected. Regeneration time within target thresholds.'
  },
  {
    id: 'standards',
    title: 'Applied Materials Compliance',
    status: 'Pass',
    description: 'All corporate crate standards satisfied. Audit log recorded for review.'
  },
  {
    id: 'pmi',
    title: 'Semantic PMI Validation',
    status: 'Pending',
    description: 'Awaiting review of PMI annotations against manufacturing requirements.'
  }
]

export default function ValidationPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Validation Center</h1>
        <p className="text-sm text-slate-400">
          Execute automated NX validations, standards compliance checks, and PMI certification workflows.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        {checks.map((check) => (
          <Card key={check.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{check.title}</p>
                <p className="text-xs text-slate-400">Status: {check.status}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">{check.description}</p>
            <Button variant="outline" className="w-full">
              View Report
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
