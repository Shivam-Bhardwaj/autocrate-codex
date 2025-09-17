'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDesignStore } from '@/stores/design-store'
import { requestExpressionGeneration } from '@/lib/nx-api/client'

export function NXExportPanel() {
  const { configuration } = useDesignStore()
  const [status, setStatus] = useState<string>('Idle')
  const [jobId, setJobId] = useState<string | null>(null)

  const handleExport = async () => {
    setStatus('Submitting job to NX service…')
    const job = await requestExpressionGeneration(configuration)
    setJobId(job.id)
    setStatus('Job queued and awaiting processing')
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">NX Expression Export</h2>
        <p className="text-sm text-slate-400">
          Generate and deliver NX expression packages aligned with Applied Materials standards.
        </p>
      </div>
      <Button onClick={handleExport}>Queue NX Export</Button>
      <div className="space-y-1 text-sm text-slate-300">
        <p>Status: {status}</p>
        {jobId ? <p>Job ID: {jobId}</p> : null}
      </div>
    </Card>
  )
}
