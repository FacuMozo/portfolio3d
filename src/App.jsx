import { lazy, Suspense } from "react"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import SitePage from "./site/SitePage"
import { loadClassic, loadOcean, ROUTER_FUTURE } from "./routes"

// "/" (professional site) is imported statically: it's the landing route and its LCP is text,
// so an extra lazy round-trip would only delay it.
// The 3D variants pull in three.js / react-three-fiber (~1 MB) and are split into their own chunks,
// downloaded only when visited (or prefetched when the user hovers/focuses a link to them).
const Ocean = lazy(loadOcean)
const Classic = lazy(loadClassic)

// Old standalone pages now live as sections of the single-page site.
const LEGACY_REDIRECTS = {
  '/about': '#experience',
  '/projects': '#work',
  '/contact': '#contact',
}

export const AppRoutes = () => (
  <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
    <Routes>
      <Route path='/' element={<SitePage />} />
      <Route path='/ocean' element={<Ocean />} />
      <Route path='/classic' element={<Classic />} />
      {Object.entries(LEGACY_REDIRECTS).map(([from, hash]) => (
        <Route key={from} path={from} element={<Navigate to={{ pathname: '/', hash }} replace />} />
      ))}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  </Suspense>
)

const App = () => (
  <Router future={ROUTER_FUTURE}>
    <AppRoutes />
  </Router>
)

export default App
