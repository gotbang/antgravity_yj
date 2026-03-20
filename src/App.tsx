import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { WatchlistProvider } from './context/WatchlistProvider'

const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({ default: module.HomePage })),
)
const StockPage = lazy(() =>
  import('./pages/StockPage').then((module) => ({ default: module.StockPage })),
)
const EmotionPage = lazy(() =>
  import('./pages/EmotionPage').then((module) => ({ default: module.EmotionPage })),
)
const DiaryPage = lazy(() =>
  import('./pages/DiaryPage').then((module) => ({ default: module.DiaryPage })),
)
const JournalPage = lazy(() =>
  import('./pages/JournalPage').then((module) => ({ default: module.JournalPage })),
)

function App() {
  return (
    <BrowserRouter>
      <WatchlistProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="stock">
              <Route index element={<StockPage />} />
              <Route path=":symbol" element={<StockPage />} />
            </Route>
            <Route path="emotion" element={<EmotionPage />} />
            <Route path="diary" element={<DiaryPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </WatchlistProvider>
    </BrowserRouter>
  )
}

export default App
