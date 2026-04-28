import { Link } from "react-router-dom"
import { useLang } from "../context/LangContext"

function Navbar() {
  const { lang, setLangTo } = useLang()

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-xl tracking-tight">
          🧠 QuestionDay
        </Link>
        <div className="flex items-center gap-4">

          {/* Selector de idioma */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setLangTo("es")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                lang === "es"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🇪🇸 ES
            </button>
            <button
              onClick={() => setLangTo("en")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                lang === "en"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            {lang === "es" ? "Jugar" : "Play"}
          </Link>

          <Link to="/grupos" className="text-sm text-gray-400 hover:text-white transition-colors">
            {lang === "en" ? "Groups" : "Grupos"}
          </Link>

        </div>
      </div>
    </nav>
  )
}

export default Navbar