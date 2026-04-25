import { useLocation, useNavigate } from "react-router-dom"
import Countdown from "../components/Countdown"

function Result() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state) {
    navigate("/")
    return null
  }

  const { isCorrect, selectedId, correctOption, question, correctStreak, visitStreak } = state
  const correctOptionObj = question.options.find(o => o.id === correctOption)
  const selectedOptionObj = question.options.find(o => o.id === selectedId)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl mx-auto text-center">

        <div className="text-6xl mb-4">
          {isCorrect ? "🎉" : "❌"}
        </div>

        <h1 className={`text-3xl font-bold mb-2 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
          {isCorrect ? "¡Correcto!" : "Fallaste"}
        </h1>

        <p className="text-gray-400 mb-6 text-lg">
          {question.question}
        </p>

        {!isCorrect && selectedOptionObj && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-5 py-3 mb-3 text-left">
            <p className="text-sm text-red-400 font-semibold mb-1">Tu respuesta</p>
            <p className="text-white">{selectedOptionObj.text}</p>
          </div>
        )}

        {correctOptionObj && (
          <div className="bg-green-900/30 border border-green-700 rounded-xl px-5 py-3 mb-6 text-left">
            <p className="text-sm text-green-400 font-semibold mb-1">Respuesta correcta</p>
            <p className="text-white">{correctOptionObj.text}</p>
          </div>
        )}

        <p className="text-gray-400 text-sm mb-8 italic">
          {question.explanation}
        </p>

        {/* Rachas actualizadas */}
        <div className="flex gap-8 justify-center mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">🔥 {visitStreak}</p>
            <p className="text-xs text-gray-400 mt-1">Días seguidos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">✅ {correctStreak}</p>
            <p className="text-xs text-gray-400 mt-1">Aciertos seguidos</p>
          </div>
        </div>

        <div className="mb-6">
          <Countdown />
        </div>

        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-500
                     text-white font-semibold rounded-xl transition-colors"
        >
          Volver al inicio
        </button>

      </div>
    </div>
  )
}

export default Result