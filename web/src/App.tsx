import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage }       from './pages/HomePage'
import { CharactersPage } from './pages/CharactersPage'
import { StagesPage }     from './pages/StagesPage'
import { JukeboxPage }    from './pages/JukeboxPage'
import { ItemsPage }      from './pages/ItemsPage'
import { RanksPage }      from './pages/RanksPage'
import { GalleryPage }    from './pages/GalleryPage'
import { MoviesPage }     from './pages/MoviesPage'
import { EpisodesPage }   from './pages/EpisodesPage'
import { RawDataPage }    from './pages/RawDataPage'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/stages"     element={<StagesPage />} />
          <Route path="/jukebox"    element={<JukeboxPage />} />
          <Route path="/items"      element={<ItemsPage />} />
          <Route path="/ranks"      element={<RanksPage />} />
          <Route path="/gallery"    element={<GalleryPage />} />
          <Route path="/movies"     element={<MoviesPage />} />
          <Route path="/episodes"   element={<EpisodesPage />} />
          <Route path="/raw"        element={<RawDataPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
