import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage }  from './pages/HomePage'
import { ItemsPage } from './pages/ItemsPage'
import { VersionProvider } from './contexts/VersionContext'

export default function App() {
  return (
    <VersionProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/"      element={<HomePage />} />
            <Route path="/items" element={<ItemsPage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </VersionProvider>
  )
}
