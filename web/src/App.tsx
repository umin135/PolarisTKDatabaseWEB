import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage }  from './pages/HomePage'
import { ItemsPage } from './pages/ItemsPage'
import { CharactersPage } from './pages/CharactersPage'
import { StagesPage } from './pages/StagesPage'
import { VersionProvider } from './contexts/VersionContext'

export default function App() {
  return (
    <VersionProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/"      element={<HomePage />} />
            <Route path="/items"      element={<ItemsPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/stages"     element={<StagesPage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </VersionProvider>
  )
}
