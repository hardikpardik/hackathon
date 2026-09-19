import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Intro } from './components/Intro'
import { OrbitDashboard } from './pages/OrbitDashboard'
import { Dashboard } from './pages/Dashboard'
import { IncidentDetailPage } from './pages/IncidentDetail'
import { Incidents } from './pages/Incidents'
import { Services } from './pages/Services'
import { Settings } from './pages/Settings'
import './App.css'

export default function App() {
  const [introDone, setIntroDone] = useState(false)

  return (
    <>
      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
      <BrowserRouter>
      <Routes>
        {/* Main ORBIT Global Intelligence Dashboard */}
        <Route path="/" element={<OrbitDashboard />} />
        <Route path="/orbit" element={<OrbitDashboard />} />

        {/* System Operations & Console Sub-routes */}
        <Route element={<Layout />}>
          <Route path="/ops" element={<Dashboard />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}
