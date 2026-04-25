import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Result from "./pages/Result"

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="pt-16"> {/* espacio para que el contenido no quede bajo la navbar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App