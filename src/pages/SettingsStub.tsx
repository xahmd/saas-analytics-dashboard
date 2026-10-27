import { Navigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Button, PaperBanner } from '../components/ui'
import { useApp } from '../state'

const SECTIONS: Record<string, { title: string; body: string; art: string; cta: string }> = {
  integrations: {
    title: 'Integrations',
    body: 'Send metric digests to Slack, sync targets from Google Sheets and embed charts in Notion.',
    art: '/illustrations/data-sources.png',
    cta: 'Browse integrations',
  },
  upgrade: {
    title: 'Upgrade',
    body: 'Unlock unlimited metrics, SSO and audit logs with Steep Business.',
    art: '/illustrations/reports.png',
    cta: 'Compare plans',
  },
  workspace: {
    title: 'Workspace',
    body: 'Rename SaaS By Ahmed, set the default timezone and manage your workspace domain.',
    art: '/illustrations/tables.png',
    cta: 'Edit workspace',
  },
}

export function SettingsStub() {
  const { section = '' } = useParams()
  const { toast } = useApp()
  const content = SECTIONS[section]
  if (!content) return <Navigate to="/settings/data-sources" replace />

  return (
    <>
      <PageHeader title={content.title} />
      <div className="page page-narrow rise">
        <PaperBanner
          title={content.title}
          body={content.body}
          art={content.art}
          actions={
            <Button variant="ink" onClick={() => toast(`${content.title} is coming soon`)}>
              {content.cta}
            </Button>
          }
        />
      </div>
    </>
  )
}
