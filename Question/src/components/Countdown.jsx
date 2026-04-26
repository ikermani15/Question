import { useState, useEffect } from "react"
import { useLang } from "../context/LangContext"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function getQuestionDate() {
  const today = new Date().toISOString().split("T")[0]
  const res   = await fetch(
    `${SUPABASE_URL}/rest/v1/questions?play_date=eq.${today}&select=created_at`,
    { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
  )
  const rows = await res.json()
  if (!rows || rows.length === 0) return null
  return new Date(rows[0].created_at)
}

function Countdown() {
  const { lang }        = useLang()
  const t               = lang === "en"
  const [timeLeft, setTimeLeft]   = useState(null)
  const [waiting, setWaiting]     = useState(false)

  useEffect(() => {
    let interval
    let retryInterval

    async function init() {
      const questionDate = await getQuestionDate()
      if (!questionDate) {
        setWaiting(true)
        // Reintentar cada 60 segundos hasta que haya pregunta nueva
        retryInterval = setInterval(async () => {
          const newDate = await getQuestionDate()
          if (newDate) window.location.reload()
        }, 60000)
        return
      }

      function tick() {
        const nextQuestion = new Date(questionDate.getTime() + 24 * 60 * 60 * 1000)
        const diff         = nextQuestion - new Date()

        if (diff <= 0) {
          setWaiting(true)
          clearInterval(interval)
          // Reintentar cada 60 segundos
          retryInterval = setInterval(async () => {
            const newDate = await getQuestionDate()
            if (newDate && newDate.getTime() !== questionDate.getTime()) {
              window.location.reload()
            }
          }, 60000)
          return
        }

        setTimeLeft({
          hours:   Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        })
      }

      tick()
      interval = setInterval(tick, 1000)
    }

    init()
    return () => {
      clearInterval(interval)
      clearInterval(retryInterval)
    }
  }, [])

  const pad = (n) => String(n).padStart(2, "0")

  // Esperando pregunta nueva
  if (waiting) return (
    <div className="text-center">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
        {t ? "Preparing next question..." : "Preparando nueva pregunta..."}
      </p>
      <p className="text-gray-600 text-sm animate-pulse">⏳</p>
    </div>
  )

  // Cargando
  if (!timeLeft) return (
    <div className="text-center">
      <p className="text-xs text-gray-600 uppercase tracking-widest">...</p>
    </div>
  )

  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
        {t ? "New question in" : "Nueva pregunta en"}
      </p>
      <div className="flex items-center gap-1 justify-center">
        <TimeBlock value={pad(timeLeft.hours)}   label="h" />
        <span className="text-gray-500 font-bold mb-3">:</span>
        <TimeBlock value={pad(timeLeft.minutes)} label="m" />
        <span className="text-gray-500 font-bold mb-3">:</span>
        <TimeBlock value={pad(timeLeft.seconds)} label="s" />
      </div>
    </div>
  )
}

function TimeBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 min-w-[48px] text-center">
        <span className="text-white font-bold text-lg font-mono">{value}</span>
      </div>
      <span className="text-gray-600 text-xs mt-1">{label}</span>
    </div>
  )
}

export default Countdown