import { lazy, Suspense } from "react"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

// Route-level code splitting: visitors only download the code for the page they open.
// Ocean / Home pull in three.js / react-three-fiber, the heaviest part of the bundle.
const Ocean = lazy(() => import("./pages/Ocean"))
const Home = lazy(() => import("./pages/Home"))
const About = lazy(() => import("./pages/About"))
const Projects = lazy(() => import("./pages/Projects"))
const Contact = lazy(() => import("./pages/Contact"))

const App = () => {
  return (
    <main className="bg-slate-300/20 h-full">
      <Router>
        <Navbar />
        <Suspense fallback={<div className="min-h-dvh" />}>
          <Routes>
            <Route path='/' element={<Ocean />} />
            <Route path='/classic' element={<Home />} />
            <Route
              path='/*'
              element={
                <>
                  <Routes>
                    <Route path='/about' element={<About />} />
                    <Route path='/projects' element={<Projects />} />
                    <Route path='/contact' element={<Contact />} />
                    <Route path='*' element={<Navigate to='/' replace />} />
                  </Routes>
                  <Footer />
                </>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </main>
  )
}

export default App
