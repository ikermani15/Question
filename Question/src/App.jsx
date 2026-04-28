import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Result from "./pages/Result"
import Grupos from "./pages/Grupos"
import Lobby from "./pages/Lobby"
import GroupPlay from "./pages/GroupPlay"

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="pt-16"> {/* espacio para que el contenido no quede bajo la navbar */}
        <Routes>
          <Route path="/"                      element={<Home />} />
          <Route path="/result"                element={<Result />} />
          <Route path="/grupos"                element={<Grupos />} />
          <Route path="/grupos/:code"          element={<Lobby />} />
          <Route path="/grupos/:code/jugar"    element={<GroupPlay />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App