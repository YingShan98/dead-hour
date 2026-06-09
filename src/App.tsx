import { useLayoutEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import TitlePage from '@/pages/TitlePage'
import GamePage from '@/pages/GamePage'
import EndingPage from '@/pages/EndingPage'
import { initSettings } from '@/engine/settingsManager'

export default function App() {
  useLayoutEffect(() => {
    initSettings()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<TitlePage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/ending/:endingId" element={<EndingPage />} />
    </Routes>
  )
}
