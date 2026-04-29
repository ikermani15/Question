import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTodayGroupQuestion, submitGroupAnswer } from "../services/groupService"
import { useGroup } from "../context/GroupContext"
import { useLang } from "../context/LangContext"

const TIME_LIMIT = 20

function GroupPlay() {
  const { code }               = useParams()
  const navigate               = useNavigate()
  const { group, participant } = useGroup()
  const { lang }               = useLang()
  const t                      = lang === "en"

  const [question, setQuestion] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [result, setResult]     = useState(null)
  const [answered, setAnswered] = useState(false)

  const startTimeRef = useRef(null)
  const timerRef     = useRef(null)

  // Recargar pregunta en el idioma correcto si cambia lang y no ha respondido
  useEffect(() => {
    if (!question || answered) return
    getTodayGroupQuestion(lang).then(setQuestion).catch(() => {})
  }, [lang])

  // Recargar explicación/pregunta si ya respondió y cambia el idioma
  useEffect(() => {
    if (!answered || !result) return
    getTodayGroupQuestion(lang).then(setQuestion).catch(() => {})
  }, [lang])

  useEffect(() => {
    if (!group || !participant) {
      navigate("/grupos")
      return
    }

    async function load() {
      try {
        const q = await getTodayGroupQuestion(lang)
        setQuestion(q)

        // Comprobar si ya respondió hoy
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/group_answers?participant_id=eq.${participant.id}&question_id=eq.${q.id}&select=*`,
          {
            headers: {
              "apikey":        import.meta.env.VITE_SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            }
          }
        )
        const existing = await res.json()

        if (existing && existing.length > 0) {
          const prev = existing[0]

          // Obtener la opción correcta
          const qRes = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/questions?id=eq.${q.id}&select=correct_option`,
            {
              headers: {
                "apikey":        import.meta.env.VITE_SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              }
            }
          )
          const qData = await qRes.json()

          setResult({
            isCorrect:      prev.is_correct,
            selectedId:     prev.selected_option,
            correctOption:  qData[0].correct_option,
            points:         { base: 0, speedBonus: 0, streakBonus: 0, total: prev.points_earned },
            alreadyAnswered: true,
          })
          setAnswered(true)
          setLoading(false)  // ← importante
          return
        }

        // No ha respondido → iniciar contrarreloj
        setLoading(false)
        startTimeRef.current = Date.now()
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) { clearInterval(timerRef.current); return 0 }
            return prev - 1
          })
        }, 1000)

      } catch (err) {
        setError(t ? "Could not load today's question" : "No se pudo cargar la pregunta")
        setLoading(false)
      }
    }

    load()
    return () => clearInterval(timerRef.current)
  }, [])

  async function handleAnswer(selectedId) {
    if (answered) return
    setAnswered(true)
    clearInterval(timerRef.current)

    const responseTimeMs = Date.now() - startTimeRef.current

    try {
      const data = await submitGroupAnswer(
        participant.id, question.id, selectedId, responseTimeMs
      )
      setResult({ ...data, selectedId })
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400">{t ? "Loading..." : "Cargando..."}</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 gap-4">
      <p className="text-red-400 text-center">{error}</p>
      <button onClick={() => navigate(`/grupos/${code}`)} className="text-purple-400 hover:text-purple-300">
        ← {t ? "Back to lobby" : "Volver al lobby"}
      </button>
    </div>
  )

  // Pantalla de resultado
  if (result) {
    const correctObj  = question?.options?.find(o => o.id === result.correctOption)
    const selectedObj = question?.options?.find(o => o.id === result.selectedId)

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl mx-auto text-center">

          <div className="text-6xl mb-4">{result.isCorrect ? "🎉" : "❌"}</div>

          <h1 className={`text-3xl font-bold mb-2 ${result.isCorrect ? "text-green-400" : "text-red-400"}`}>
            {result.isCorrect ? (t ? "Correct!" : "¡Correcto!") : (t ? "Wrong!" : "Fallaste")}
          </h1>

          {/* Pregunta */}
          <p className="text-gray-400 mb-6 text-lg">{question?.question}</p>

          {/* Desglose de puntos — solo si acaba de responder, no si ya había respondido */}
          {!result.alreadyAnswered && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6 text-left">
              <h3 className="text-gray-400 text-sm font-semibold uppercase mb-4">
                {t ? "Points earned" : "Puntos obtenidos"}
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">{t ? "Correct answer" : "Respuesta correcta"}</span>
                  <span className="text-white font-bold">+{result.points.base}</span>
                </div>
                {result.points.speedBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">⚡ {t ? "Speed bonus" : "Bonus velocidad"}</span>
                    <span className="text-yellow-400 font-bold">+{result.points.speedBonus}</span>
                  </div>
                )}
                {result.points.streakBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">🔥 {t ? "Streak bonus" : "Bonus racha"}</span>
                    <span className="text-orange-400 font-bold">+{result.points.streakBonus}</span>
                  </div>
                )}
                <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-purple-400 font-bold text-xl">+{result.points.total}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tu respuesta si fallaste */}
          {!result.isCorrect && selectedObj && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl px-5 py-3 mb-3 text-left">
              <p className="text-xs text-red-400 font-semibold mb-1">
                {t ? "Your answer" : "Tu respuesta"}
              </p>
              <p className="text-white">{selectedObj.text}</p>
            </div>
          )}

          {/* Respuesta correcta */}
          {correctObj && (
            <div className="bg-green-900/30 border border-green-700 rounded-xl px-5 py-3 mb-6 text-left">
              <p className="text-xs text-green-400 font-semibold mb-1">
                {t ? "Correct answer" : "Respuesta correcta"}
              </p>
              <p className="text-white">{correctObj.text}</p>
            </div>
          )}

          {/* Explicación — viene de question que se recarga con el idioma */}
          {question?.explanation && (
            <p className="text-gray-400 text-sm italic mb-8">{question.explanation}</p>
          )}

          <button
            onClick={() => navigate(`/grupos/${code}`)}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
          >
            {t ? "See leaderboard" : "Ver clasificación"}
          </button>
        </div>
      </div>
    )
  }

  // Pantalla de pregunta con contrarreloj
  const timerPercent = (timeLeft / TIME_LIMIT) * 100
  const timerColor   = timeLeft > 13 ? "bg-green-500" : timeLeft > 7 ? "bg-yellow-500" : "bg-red-500"

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{t ? "Time" : "Tiempo"}</span>
            <span className={`text-2xl font-bold font-mono ${
              timeLeft > 13 ? "text-green-400" : timeLeft > 7 ? "text-yellow-400" : "text-red-400"
            }`}>
              {timeLeft}s
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${timerColor}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
          {timeLeft === 0 && !answered && (
            <p className="text-red-400 text-center text-sm mt-2">
              {t ? "Time's up! You can still answer." : "¡Tiempo agotado! Aún puedes responder."}
            </p>
          )}
        </div>

        <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-3">
          {t ? "Group question" : "Pregunta del grupo"}
        </p>
        <h2 className="text-2xl font-bold text-white mb-8 leading-snug">
          {question.question}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map(option => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              disabled={answered}
              className="w-full text-left px-5 py-4 rounded-xl border border-gray-700
                         bg-gray-800 text-white font-medium
                         hover:border-purple-500 hover:bg-gray-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              <span className="text-purple-400 font-bold mr-3">{option.id.toUpperCase()}.</span>
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GroupPlay