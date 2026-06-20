import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage }  from './pages/HomePage'
import { ItemsPage } from './pages/ItemsPage'
import { CharactersPage } from './pages/CharactersPage'
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
          </Routes>
        </Layout>
      </HashRouter>
    </VersionProvider>
  )
}
