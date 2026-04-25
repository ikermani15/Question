import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import QuestionCard from "../components/QuestionCard"
import { getTodayQuestion, submitAnswer } from "../services/questionService"
import { getStreaks, registerVisit, registerAnswer, hasAnsweredToday, getTodayResult } from "../utils/streak"
import { useLang } from "../context/LangContext"
import Countdown from "../components/Countdown"

function Home() {
  const navigate  = useNavigate()
  const { lang }  = useLang()

  const [question, setQuestion]             = useState(null)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [answered, setAnswered]             = useState(false)
  const [streaks]                           = useState(getStreaks())
  const [alreadyPlayed, setAlreadyPlayed]   = useState(false)
  const [savedResult, setSavedResult]       = useState(null)

  // Efecto 1 — solo al montar: registrar visita y comprobar si ya jugó
  useEffect(() => {
    registerVisit()
    const played = hasAnsweredToday()
    if (played) {
      setAlreadyPlayed(true)
      setSavedResult(getTodayResult())
    }
  }, [])

  // Efecto 2 — cargar pregunta del día con el idioma actual
  // Se ejecuta cuando cambia lang o cuando sabemos si jugó o no
  useEffect(() => {
    setLoading(true)
    getTodayQuestion(lang)
      .then(setQuestion)
      .catch(() => setError("No se pudo cargar la pregunta de hoy"))
      .finally(() => setLoading(false))
  }, [lang])

  async function handleAnswer(selectedId) {
    if (answered) return
    setAnswered(true)

    const { isCorrect, correctOption } = await submitAnswer(question.id, selectedId)
    const newCorrectStreak = registerAnswer(isCorrect, question, selectedId, correctOption)
    setSavedResult(getTodayResult())
    setAlreadyPlayed(true)

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
      <p className="text-gray-400">{lang === "en" ? "Loading..." : "Cargando pregunta..."}</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  )

  // Pantalla si ya jugó hoy — question ya tiene el idioma correcto
  if (alreadyPlayed && question && savedResult) {
    const correctOptionObj  = question.options.find(o => o.id === savedResult.correctOption)
    const selectedOptionObj = question.options.find(o => o.id === savedResult.selectedId)
    const t = lang === "en"

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl mx-auto">

          <div className="flex gap-8 justify-center mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-400">🔥 {streaks.visitStreak}</p>
              <p className="text-sm text-gray-400 mt-1">{t ? "Day streak" : "Días seguidos"}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">✅ {streaks.correctStreak}</p>
              <p className="text-sm text-gray-400 mt-1">{t ? "Correct streak" : "Aciertos seguidos"}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{savedResult.isCorrect ? "🎉" : "❌"}</span>
              <div>
                <p className={`font-bold text-lg ${savedResult.isCorrect ? "text-green-400" : "text-red-400"}`}>
                  {savedResult.isCorrect
                    ? (t ? "Correct!"       : "¡Acertaste!")
                    : (t ? "Wrong!"         : "Fallaste")}
                </p>
                <p className="text-gray-400 text-sm">
                  {t ? "Today's question" : "Pregunta de hoy"}
                </p>
              </div>
            </div>

            <p className="text-white font-semibold mb-4">{question.question}</p>

            {!savedResult.isCorrect && selectedOptionObj && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 mb-3">
                <p className="text-xs text-red-400 font-semibold mb-1">
                  {t ? "Your answer" : "Tu respuesta"}
                </p>
                <p className="text-white text-sm">{selectedOptionObj.text}</p>
              </div>
            )}

            {correctOptionObj && (
              <div className="bg-green-900/30 border border-green-700 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-green-400 font-semibold mb-1">
                  {t ? "Correct answer" : "Respuesta correcta"}
                </p>
                <p className="text-white text-sm">{correctOptionObj.text}</p>
              </div>
            )}

            {question.explanation && (
              <p className="text-gray-400 text-sm italic">{question.explanation}</p>
            )}
          </div>

          <div className="mt-6">
            <Countdown />
          </div>

          <p className="text-gray-500 text-sm text-center mt-4">
            {t ? "Come back tomorrow for a new question 🗓️" : "Vuelve mañana para una nueva pregunta 🗓️"}
          </p>
        </div>
      </div>
    )
  }

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