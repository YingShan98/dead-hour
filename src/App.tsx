import { Routes, Route } from 'react-router-dom'
import TitlePage from '@/pages/TitlePage'
import GamePage from '@/pages/GamePage'
import EndingPage from '@/pages/EndingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TitlePage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/ending/:endingId" element={<EndingPage />} />
    </Routes>
  )
}
