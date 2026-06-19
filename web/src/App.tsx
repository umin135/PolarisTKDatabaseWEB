import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage }  from './pages/HomePage'
import { ItemsPage } from './pages/ItemsPage'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/"      element={<HomePage />} />
          <Route path="/items" element={<ItemsPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
