import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLeaderboard, getGroupInfo, kickParticipant, deleteGroup } from "../services/groupService"
import { useGroup } from "../context/GroupContext"
import { useLang } from "../context/LangContext"

function Lobby() {
  const { code }    = useParams()
  const navigate    = useNavigate()
  const { group, participant, sessionLoaded, leaveGroup } = useGroup()
  const { lang }    = useLang()
  const t           = lang === "en"

  const [leaderboard, setLeaderboard]     = useState([])
  const [groupInfo, setGroupInfo]         = useState(null)
  const [loading, setLoading]             = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isCreator = groupInfo?.creator_username === participant?.username

  useEffect(() => {
    // Esperar a que se cargue la sesión antes de redirigir
    if (!sessionLoaded) return
    if (!group) { navigate("/grupos"); return }
    loadData()
    const interval = setInterval(loadLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [group, sessionLoaded])

  async function loadData() {
    await Promise.all([loadLeaderboard(), loadGroupInfo()])
    setLoading(false)
  }

  async function loadLeaderboard() {
    const data = await getLeaderboard(group.id)
    setLeaderboard(data)
  }

  async function loadGroupInfo() {
    const data = await getGroupInfo(code)
    setGroupInfo(data)
  }

  async function handleKick(p) {
    if (!window.confirm(t ? `Kick ${p.username}?` : `¿Expulsar a ${p.username}?`)) return
    try {
      await kickParticipant(p.id, group.id, participant.username)
      loadLeaderboard()
    } catch (err) { alert(err.message) }
  }

  async function handleDelete() {
    try {
      await deleteGroup(group.id, participant.username)
      leaveGroup()
      navigate("/grupos")
    } catch (err) { alert(err.message) }
  }

  function shareGroup() {
    const url  = `${window.location.origin}/grupos/join/${code}`
    const text = t
      ? `Join my QuestionDay group! 🧠`
      : `¡Únete a mi grupo de QuestionDay! 🧠`
    if (navigator.share) {
      navigator.share({ title: "QuestionDay", text, url })
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`)
      alert(t ? "Link copied!" : "¡Enlace copiado!")
    }
  }

  // Mostrar loading mientras se recupera la sesión
  if (!sessionLoaded || loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400">{t ? "Loading..." : "Cargando..."}</p>
    </div>
  )

  if (!group) return null

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="w-full max-w-xl mx-auto">

        {/* Botón volver a mis grupos */}
        <button
          onClick={() => navigate("/grupos/mis-grupos")}
          className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1"
        >
          ← {t ? "My groups" : "Mis grupos"}
        </button>

        {/* Cabecera */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">{group.name}</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gray-400 text-sm">{t ? "Code:" : "Código:"}</span>
            <span className="bg-gray-800 text-purple-400 font-mono font-bold px-3 py-1 rounded-lg text-sm tracking-widest">
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
              {t ? "You" : "Tú"} {isCreator && "👑"}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{participant.avatar || "🌱"}</span>
                <span className="text-white font-semibold">{participant.username}</span>
              </div>
              <span className="text-purple-400 font-bold">{participant.monthly_points || 0} pts</span>
            </div>
          </div>
        )}

        {/* Clasificación */}
        <div className="mb-8">
          <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">
            {t ? "Monthly ranking" : "Clasificación mensual"}
          </h2>
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
                  <div>
                    <span className={`font-semibold ${player.username === participant?.username ? "text-purple-400" : "text-white"}`}>
                      {player.username}
                      {groupInfo?.creator_username === player.username && " 👑"}
                    </span>
                    {player.current_streak >= 3 && (
                      <span className="text-xs text-orange-400 ml-2">🔥{player.current_streak}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 font-bold">{player.monthly_points} pts</span>
                  {isCreator && player.username !== participant?.username && (
                    <button
                      onClick={() => handleKick(player)}
                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1
                                 rounded border border-red-800 hover:border-red-600 transition-colors"
                    >
                      {t ? "Kick" : "Expulsar"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(`/grupos/${code}/jugar`)}
            className="py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors text-lg"
          >
            {t ? "Ready to play? 🎯" : "¿Listo para jugar? 🎯"}
          </button>

          {isCreator && (
            <div>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-3 text-red-500 hover:text-red-400 text-sm transition-colors"
                >
                  {t ? "Delete group" : "Eliminar grupo"}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl"
                  >
                    {t ? "Confirm delete" : "Confirmar eliminación"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-3 bg-gray-800 text-gray-300 text-sm rounded-xl"
                  >
                    {t ? "Cancel" : "Cancelar"}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => { leaveGroup(); navigate("/grupos") }}
            className="py-3 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            {t ? "Log out" : "Cerrar sesión"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Lobby