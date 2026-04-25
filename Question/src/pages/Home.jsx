import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import QuestionCard from "../components/QuestionCard"
import { getTodayQuestion, submitAnswer } from "../services/questionService"
import { getStreaks, registerVisit, registerAnswer, hasAnsweredToday, getTodayResult } from "../utils/streak"
import { useLang } from "../context/LangContext"
import Countdown from "../components/Countdown"

function Home() {
  const navigate = useNavigate()
  const { lang } = useLang()

  const [question, setQuestion]         = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [answered, setAnswered]         = useState(false)
  const [streaks]                       = useState(getStreaks())
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const [todayResult, setTodayResult]   = useState(null)

  // Efecto 1 — solo al montar: registrar visita y comprobar si ya jugó
  useEffect(() => {
    registerVisit()
    const played = hasAnsweredToday()
    if (played) {
      setAlreadyPlayed(true)
      setLoading(false)
    }
  }, [])

  // Efecto 2 — cargar pregunta cuando cambia el idioma (solo si no ha jugado)
  useEffect(() => {
    if (alreadyPlayed) return
    setLoading(true)
    getTodayQuestion(lang)
      .then(setQuestion)
      .catch(() => setError("No se pudo cargar la pregunta de hoy"))
      .finally(() => setLoading(false))
  }, [lang, alreadyPlayed])

  // Efecto 3 — actualizar el resultado del día cuando cambia el idioma
  useEffect(() => {
    if (!alreadyPlayed) return
    setTodayResult(getTodayResult(lang))
  }, [lang, alreadyPlayed])

  async function handleAnswer(selectedId) {
    if (answered) return
    setAnswered(true)

    const { isCorrect, correctOption } = await submitAnswer(question.id, selectedId)
    const newCorrectStreak = registerAnswer(isCorrect, question, selectedId, correctOption)

    setTimeout(() => {
      navigate("/result", {
        state: {
          isCorrect,
          selectedId,
          correctOption,
          question,
          correctStreak: newCorrectStreak,
          visitStreak:   getStreaks().visitStreak,
        },
      })
    }, 600)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400">Cargando pregunta...</p>
    </div>
  )

  // Pantalla si ya jugó hoy
  if (alreadyPlayed) {
    const correctOptionObj = todayResult?.options?.find(o => o.id === todayResult.correctOption)
    const selectedOptionObj = todayResult?.options?.find(o => o.id === todayResult.selectedId)

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl mx-auto">

          <div className="flex gap-8 justify-center mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-400">🔥 {streaks.visitStreak}</p>
              <p className="text-sm text-gray-400 mt-1">{lang === "en" ? "Day streak" : "Días seguidos"}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">✅ {streaks.correctStreak}</p>
              <p className="text-sm text-gray-400 mt-1">{lang === "en" ? "Correct streak" : "Aciertos seguidos"}</p>
            </div>
          </div>

          {todayResult && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{todayResult.isCorrect ? "🎉" : "❌"}</span>
                <div>
                  <p className={`font-bold text-lg ${todayResult.isCorrect ? "text-green-400" : "text-red-400"}`}>
                    {todayResult.isCorrect
                      ? (lang === "en" ? "Correct!" : "¡Acertaste!")
                      : (lang === "en" ? "Wrong!" : "Fallaste")}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {lang === "en" ? "Today's question" : "Pregunta de hoy"}
                  </p>
                </div>
              </div>

              <p className="text-white font-semibold mb-4">{todayResult.question}</p>

              {!todayResult.isCorrect && selectedOptionObj && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 mb-3">
                  <p className="text-xs text-red-400 font-semibold mb-1">
                    {lang === "en" ? "Your answer" : "Tu respuesta"}
                  </p>
                  <p className="text-white text-sm">{selectedOptionObj.text}</p>
                </div>
              )}

              {correctOptionObj && (
                <div className="bg-green-900/30 border border-green-700 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs text-green-400 font-semibold mb-1">
                    {lang === "en" ? "Correct answer" : "Respuesta correcta"}
                  </p>
                  <p className="text-white text-sm">{correctOptionObj.text}</p>
                </div>
              )}

              {todayResult.explanation && (
                <p className="text-gray-400 text-sm italic">{todayResult.explanation}</p>
              )}
            </div>
          )}

          <div className="mt-6">
            <Countdown />
          </div>

          <p className="text-gray-500 text-sm text-center mt-4">
            {lang === "en" ? "Come back tomorrow for a new question 🗓️" : "Vuelve mañana para una nueva pregunta 🗓️"}
          </p>
        </div>
      </div>
    )
  }

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="flex gap-8 mb-8">
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-400">🔥 {streaks.visitStreak}</p>
          <p className="text-xs text-gray-400 mt-1">{lang === "en" ? "Day streak" : "Días seguidos"}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">✅ {streaks.correctStreak}</p>
          <p className="text-xs text-gray-400 mt-1">{lang === "en" ? "Correct streak" : "Aciertos seguidos"}</p>
        </div>
      </div>
      <QuestionCard question={question} onAnswer={handleAnswer} />
    </div>
  )
}

export default Home