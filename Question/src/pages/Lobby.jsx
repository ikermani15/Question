import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLeaderboard } from "../services/groupService"
import { useGroup } from "../context/GroupContext"
import { useLang } from "../context/LangContext"

function Lobby() {
  const { code }                    = useParams()
  const navigate                    = useNavigate()
  const { group, participant, leaveGroup } = useGroup()
  const { lang }                    = useLang()
  const t                           = lang === "en"

  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!group) {
      navigate("/grupos")
      return
    }
    loadLeaderboard()
    // Actualizar clasificación cada 30 segundos
    const interval = setInterval(loadLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [group])

  async function loadLeaderboard() {
    try {
      const data = await getLeaderboard(group.id)
      setLeaderboard(data)
    } finally {
      setLoading(false)
    }
  }

  function shareGroup() {
    const url  = `${window.location.origin}/grupos/${code}`
    const text = t
      ? `Join my QuestionDay group! Code: ${code} 🧠`
      : `¡Únete a mi grupo de QuestionDay! Código: ${code} 🧠`
    if (navigator.share) {
      navigator.share({ title: "QuestionDay", text, url })
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`)
      alert(t ? "Link copied!" : "¡Enlace copiado!")
    }
  }

  if (!group) return null

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="w-full max-w-xl mx-auto">

        {/* Cabecera del grupo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">{group.name}</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gray-400 text-sm">
              {t ? "Code:" : "Código:"}
            </span>
            <span className="bg-gray-800 text-purple-400 font-mono font-bold
                             px-3 py-1 rounded-lg text-sm tracking-widest">
              {code}
            </span>
          </div>

          <button
            onClick={shareGroup}
            className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300
                       hover:text-white rounded-lg border border-gray-700 transition-colors"
          >
            {t ? "📤 Share group" : "📤 Compartir grupo"}
          </button>
        </div>

        {/* Tu posición */}
        {participant && (
          <div className="bg-purple-900/30 border border-purple-700 rounded-xl p-4 mb-6">
            <p className="text-purple-400 text-xs font-semibold uppercase mb-1">
              {t ? "You" : "Tú"}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{participant.avatar || "🌱"}</span>
                <span className="text-white font-semibold">{participant.username}</span>
              </div>
              <span className="text-purple-400 font-bold">
                {participant.monthly_points || 0} pts
              </span>
            </div>
          </div>
        )}

        {/* Clasificación */}
        <div className="mb-8">
          <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">
            {t ? "Monthly ranking" : "Clasificación mensual"}
          </h2>

          {loading ? (
            <p className="text-gray-500 text-center py-4">
              {t ? "Loading..." : "Cargando..."}
            </p>
          ) : leaderboard.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {t ? "No players yet" : "Aún no hay jugadores"}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((player, index) => (
                <div
                  key={player.username}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl
                    ${index === 0 ? "bg-yellow-900/20 border border-yellow-700/50" :
                      index === 1 ? "bg-gray-700/30 border border-gray-600/50" :
                      index === 2 ? "bg-orange-900/20 border border-orange-700/50" :
                      "bg-gray-800/50 border border-gray-700/30"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}
                    </span>
                    <span className="text-xl">{player.avatar || "🌱"}</span>
                    <span className={`font-semibold ${
                      player.username === participant?.username ? "text-purple-400" : "text-white"
                    }`}>
                      {player.username}
                    </span>
                    {player.current_streak >= 3 && (
                      <span className="text-xs text-orange-400">🔥{player.current_streak}</span>
                    )}
                  </div>
                  <span className="text-gray-300 font-bold">{player.monthly_points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(`/grupos/${code}/jugar`)}
            className="py-4 bg-purple-600 hover:bg-purple-500 text-white
                       font-bold rounded-xl transition-colors text-lg"
          >
            {t ? "Ready to play? 🎯" : "¿Listo para jugar? 🎯"}
          </button>
          <button
            onClick={() => { leaveGroup(); navigate("/grupos") }}
            className="py-3 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            {t ? "Leave group" : "Salir del grupo"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default Lobby