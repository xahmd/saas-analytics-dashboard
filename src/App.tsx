import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { CommandPalette } from './components/CommandPalette'
import { Toasts } from './components/ui'
import { SignIn } from './pages/SignIn'
import { Home } from './pages/Home'
import { MetricsCatalog } from './pages/MetricsCatalog'
import { MetricExplorer } from './pages/MetricExplorer'
import { EditMetric } from './pages/EditMetric'
import { Reports } from './pages/Reports'
import { Teams } from './pages/Teams'
import { DataSources } from './pages/DataSources'
import { DataSourceConnect } from './pages/DataSourceConnect'
import { TablesJoins } from './pages/TablesJoins'
import { Targets } from './pages/Targets'
import { Members } from './pages/Members'
import { SettingsStub } from './pages/SettingsStub'

function Shell() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  )
}

export function App() {
  return (
    <>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="metrics" element={<MetricsCatalog />} />
          <Route path="metrics/:slug" element={<MetricExplorer />} />
          <Route path="metrics/:slug/edit" element={<EditMetric />} />
          <Route path="reports" element={<Reports key="all" tab="All reports" />} />
          <Route path="reports/mine" element={<Reports key="mine" tab="My reports" />} />
          <Route path="teams" element={<Teams />} />
          <Route path="settings" element={<Navigate to="/settings/data-sources" replace />} />
          <Route path="settings/data-sources" element={<DataSources />} />
          <Route path="settings/data-sources/:id" element={<DataSourceConnect />} />
          <Route path="settings/tables" element={<TablesJoins />} />
          <Route path="settings/targets" element={<Targets />} />
          <Route path="settings/members" element={<Members />} />
          <Route path="settings/:section" element={<SettingsStub />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toasts />
    </>
  )
}
