import type { Icon } from '@tabler/icons-react'
import {
  IconBrandAppleArcade,
  IconBrandDatabricks,
  IconBrandGoogleBigQuery,
  IconBrandMysql,
  IconBrandSublimeText,
  IconDatabase,
} from '@tabler/icons-react'

export type Field = { key: string; label: string; secret?: boolean; hint?: string }

export type DataSource = {
  id: string
  name: string
  vendor: string
  icon: Icon
  color: string
  beta?: boolean
  fields: Field[]
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'athena',
    name: 'Athena',
    vendor: 'Amazon Web Services',
    icon: IconBrandAppleArcade,
    color: '#f0913c',
    fields: [
      { key: 'region', label: 'Region', hint: 'e.g. eu-west-1' },
      { key: 'database', label: 'Database' },
      { key: 'accessKey', label: 'Access key' },
      { key: 'secret', label: 'Secret access key', secret: true },
    ],
  },
  {
    id: 'bigquery',
    name: 'BigQuery',
    vendor: 'Google Cloud',
    icon: IconBrandGoogleBigQuery,
    color: '#4c86f0',
    fields: [
      { key: 'project', label: 'Project ID' },
      { key: 'dataset', label: 'Dataset' },
      { key: 'serviceAccount', label: 'Service account key', secret: true },
    ],
  },
  {
    id: 'databricks',
    name: 'Databricks',
    vendor: 'Databricks',
    icon: IconBrandDatabricks,
    color: '#e8503a',
    beta: true,
    fields: [
      { key: 'host', label: 'Server hostname' },
      { key: 'httpPath', label: 'HTTP path' },
      { key: 'token', label: 'Access token', secret: true },
    ],
  },
  {
    id: 'mysql',
    name: 'MySQL',
    vendor: 'Oracle',
    icon: IconBrandMysql,
    color: '#2f8f9d',
    fields: [
      { key: 'host', label: 'Host' },
      { key: 'port', label: 'Port', hint: '3306' },
      { key: 'database', label: 'Database' },
      { key: 'user', label: 'User' },
      { key: 'password', label: 'Password', secret: true },
    ],
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    vendor: 'Open source',
    icon: IconDatabase,
    color: '#5b8fd6',
    fields: [
      { key: 'host', label: 'Host' },
      { key: 'port', label: 'Port', hint: '5432' },
      { key: 'database', label: 'Database' },
      { key: 'user', label: 'User' },
      { key: 'password', label: 'Password', secret: true },
    ],
  },
  {
    id: 'redshift',
    name: 'Redshift',
    vendor: 'Amazon Web Services',
    icon: IconBrandSublimeText,
    color: '#4a7fe0',
    fields: [
      { key: 'cluster', label: 'Cluster endpoint' },
      { key: 'database', label: 'Database' },
      { key: 'user', label: 'User' },
      { key: 'password', label: 'Password', secret: true },
    ],
  },
]

export type Report = {
  id: string
  name: string
  owner: string
  access: 'Private' | 'Team' | 'Workspace'
  updated: string
  mine?: boolean
  shared?: boolean
  metrics: number
}

export const REPORTS: Report[] = [
  { id: 'wbr', name: 'Weekly business review', owner: 'Rania Aziz', access: 'Workspace', updated: '2h ago', metrics: 12, shared: true },
  { id: 'funnel', name: 'Growth funnel Q3', owner: 'Mariam Ghanem', access: 'Team', updated: 'Yesterday', metrics: 7, shared: true },
  { id: 'support', name: 'Support health', owner: 'Rania Aziz', access: 'Team', updated: 'Aug 2', metrics: 5 },
  { id: 'orders', name: 'Order cancellations deep-dive', owner: 'Karim Mansour', access: 'Private', updated: 'Aug 1', metrics: 4 },
  { id: 'uk', name: 'UK launch tracker', owner: 'Tariq Badawi', access: 'Team', updated: 'Jul 29', metrics: 9, shared: true },
]

export type Team = {
  id: string
  name: string
  initial: string
  color: string
  members: string[]
  locked?: boolean
  mine?: boolean
  metrics: number
}

export const TEAMS: Team[] = [
  { id: 'finance', name: 'Finance', initial: 'F', color: '#7fa7f0', members: ['RA', 'KM', 'TB'], locked: true, mine: true, metrics: 8 },
  { id: 'uk', name: 'UK launchclock', initial: 'U', color: '#e6e1c4', members: ['TB', 'MG', 'LH', 'KM'], mine: true, metrics: 11 },
  { id: 'growth', name: 'Growth', initial: 'G', color: '#d6a07a', members: ['MG', 'LH'], metrics: 14 },
  { id: 'platform', name: 'Data platform', initial: 'D', color: '#8cc5a2', members: ['TB', 'RA', 'LH', 'MG', 'KM'], metrics: 6 },
]

export const PEOPLE: Record<string, { name: string; color: string }> = {
  RA: { name: 'Rania Aziz', color: '#c9b6f2' },
  KM: { name: 'Karim Mansour', color: '#f2c6a0' },
  TB: { name: 'Tariq Badawi', color: '#a8d5e2' },
  MG: { name: 'Mariam Ghanem', color: '#f4a9a0' },
  LH: { name: 'Layla Haddad', color: '#b5e0b8' },
}

export const MEMBERS = [
  { id: 'LH', role: 'Owner', email: 'layla@saasbyahmed.com', active: 'Now' },
  { id: 'RA', role: 'Admin', email: 'rania@saasbyahmed.com', active: '12m ago' },
  { id: 'MG', role: 'Editor', email: 'mariam@saasbyahmed.com', active: '1h ago' },
  { id: 'KM', role: 'Editor', email: 'karim@saasbyahmed.com', active: 'Yesterday' },
  { id: 'TB', role: 'Viewer', email: 'tariq@saasbyahmed.com', active: 'Aug 2' },
]

export type TargetSet = {
  name: string
  rows: Array<{ metric: string; grain: string; from: string; to: string }>
}

export const TARGETS: TargetSet[] = [
  {
    name: 'Budget 2023',
    rows: [
      { metric: 'Order volume', grain: 'monthly', from: 'January 2023', to: 'December 2023' },
      { metric: 'Registrations', grain: 'monthly', from: 'January 2023', to: 'December 2023' },
    ],
  },
  {
    name: 'Budget 2024',
    rows: [
      { metric: 'MAU', grain: 'monthly', from: 'January 2024', to: 'December 2024' },
      { metric: 'Order volume', grain: 'monthly', from: 'January 2024', to: 'December 2024' },
      { metric: 'Registrations', grain: 'monthly', from: 'January 2024', to: 'December 2024' },
    ],
  },
]

export const DEMO_TABLES = [
  { name: 'public_demo_v1.users', rows: '184,201', columns: 18, kind: 'table' as const },
  { name: 'public_demo_v1.orders', rows: '1,204,553', columns: 24, kind: 'table' as const },
  { name: 'public_demo_v1.sessions', rows: '9,840,112', columns: 12, kind: 'table' as const },
  { name: 'public_demo_v1.tickets', rows: '61,430', columns: 15, kind: 'table' as const },
  { name: 'analytics.daily_active', rows: '2,190', columns: 6, kind: 'view' as const },
]
