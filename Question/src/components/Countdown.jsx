import { useState, useEffect } from "react"
import { useLang } from "../context/LangContext"

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight())
  const { lang } = useLang()
  const t = lang === "en"

  function getTimeUntilMidnight() {
    const now       = new Date()
    const midnight  = new Date()
    midnight.setHours(24, 0, 0, 0)
    const diff = midnight - now

    const hours   = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { hours, minutes, seconds, diff }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const next = getTimeUntilMidnight()
      setTimeLeft(next)

      // Cuando llega a 0, recargar la página para mostrar la nueva pregunta
      if (next.diff <= 0) window.location.reload()
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const pad = (n) => String(n).padStart(2, "0")

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
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 min-w-48px text-center">
        <span className="text-white font-bold text-lg font-mono">{value}</span>
      </div>
      <span className="text-gray-600 text-xs mt-1">{label}</span>
    </div>
  )
}

export default Countdown