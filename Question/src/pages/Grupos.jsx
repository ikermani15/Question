import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { identifyUser, createGroup, joinGroup } from "../services/groupService"
import { useGroup } from "../context/GroupContext"
import { useLang } from "../context/LangContext"

// Pasos del flujo
const STEP = {
  INITIAL:    "initial",    // Crear / Unirse
  IDENTIFY:   "identify",   // Username + PIN
  MY_GROUPS:  "myGroups",   // Lista de grupos del usuario
  CREATE:     "create",     // Nombre del grupo nuevo
  JOIN:       "join",       // Código del grupo
}

function Grupos() {
  const navigate       = useNavigate()
  const { enterGroup } = useGroup()
  const { lang }       = useLang()
  const t              = lang === "en"

  const [step, setStep]         = useState(STEP.INITIAL)
  const [intent, setIntent]     = useState(null) // "create" | "join"
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [userData, setUserData] = useState(null) // { username, pin, groups }

  const [form, setForm] = useState({
    username: "", pin: "", pinConfirm: "", groupName: "", groupCode: "",
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function goBack() {
    setError(null)
    if (step === STEP.IDENTIFY)   setStep(STEP.INITIAL)
    if (step === STEP.MY_GROUPS)  setStep(STEP.IDENTIFY)
    if (step === STEP.CREATE)     setStep(STEP.MY_GROUPS)
    if (step === STEP.JOIN)       setStep(STEP.MY_GROUPS)
  }

  async function handleIdentify() {
    setError(null)
    if (!form.username || !form.pin) {
      setError(t ? "All fields required" : "Todos los campos son obligatorios")
      return
    }
    if (form.pin.length !== 4 || !/^\d+$/.test(form.pin)) {
      setError(t ? "PIN must be 4 digits" : "El PIN debe ser de 4 dígitos")
      return
    }
    setLoading(true)
    try {
      const data = await identifyUser(form.username, form.pin)
      setUserData({ username: form.username, pin: form.pin, ...data })
      setStep(STEP.MY_GROUPS)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setError(null)
    if (!form.groupName) {
      setError(t ? "Group name required" : "El nombre del grupo es obligatorio")
      return
    }
    setLoading(true)
    try {
      const data = await createGroup(form.groupName, userData.username, userData.pin)
      enterGroup(data.group, data.participant)
      navigate(`/grupos/${data.group.code}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    setError(null)
    if (!form.groupCode) {
      setError(t ? "Group code required" : "El código del grupo es obligatorio")
      return
    }
    setLoading(true)
    try {
      const data = await joinGroup(form.groupCode, userData.username, userData.pin)
      enterGroup(data.group, data.participant)
      navigate(`/grupos/${data.group.code}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function enterExistingGroup(g) {
    enterGroup(
      { id: g.groupId, code: g.groupCode, name: g.groupName, creator_username: g.isCreator ? userData.username : "" },
      { id: g.participantId, username: userData.username, avatar: g.avatar, monthly_points: g.monthlyPoints }
    )
    navigate(`/grupos/${g.groupCode}`)
  }

  // ── PANTALLA INICIAL ──────────────────────────────────────────────
  if (step === STEP.INITIAL) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t ? "🏆 Groups" : "🏆 Grupos"}
        </h1>
        <p className="text-gray-400 mb-10">
          {t ? "Compete with your friends daily" : "Compite con tus amigos cada día"}
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => { setIntent("create"); setStep(STEP.IDENTIFY) }}
            className="py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
          >
            {t ? "Create group" : "Crear grupo"}
          </button>
          <button
            onClick={() => { setIntent("join"); setStep(STEP.IDENTIFY) }}
            className="py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-700 transition-colors"
          >
            {t ? "Join with code" : "Unirse con código"}
          </button>
        </div>
      </div>
    </div>
  )

  // ── IDENTIFICACIÓN ────────────────────────────────────────────────
  if (step === STEP.IDENTIFY) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button onClick={goBack} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
          ← {t ? "Back" : "Volver"}
        </button>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t ? "Who are you?" : "¿Quién eres?"}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {t
            ? "Enter your username and PIN. New user? Choose a PIN to remember."
            : "Introduce tu nombre y PIN. ¿Usuario nuevo? Elige un PIN que recuerdes."}
        </p>
        <div className="flex flex-col gap-4">
          <input
            name="username"
            placeholder={t ? "Username" : "Nombre de usuario"}
            value={form.username}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700
                       focus:outline-none focus:border-purple-500 placeholder-gray-500"
          />
          <input
            name="pin"
            type="password"
            placeholder={t ? "4-digit PIN" : "PIN de 4 dígitos"}
            value={form.pin}
            onChange={handleChange}
            maxLength={4}
            className="px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700
                       focus:outline-none focus:border-purple-500 placeholder-gray-500"
          />
          <p className="text-gray-500 text-xs px-1">
            {t
              ? "Your PIN identifies you across devices. Don't forget it!"
              : "Tu PIN te identifica en todos los dispositivos. ¡No lo olvides!"}
          </p>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            onClick={handleIdentify}
            disabled={loading}
            className="py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? "..." : (t ? "Continue" : "Continuar")}
          </button>
        </div>
      </div>
    </div>
  )

  // ── MIS GRUPOS ────────────────────────────────────────────────────
  if (step === STEP.MY_GROUPS) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button onClick={goBack} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
          ← {t ? "Back" : "Volver"}
        </button>
        <h2 className="text-2xl font-bold text-white mb-1">
          {t ? `Hello, ${userData?.username}!` : `¡Hola, ${userData?.username}!`}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {t ? "Your groups" : "Tus grupos"}
        </p>

        {userData?.groups?.length > 0 ? (
          <div className="flex flex-col gap-3 mb-6">
            {userData.groups.map(g => (
              <button
                key={g.groupCode}
                onClick={() => enterExistingGroup(g)}
                className="w-full text-left px-4 py-4 bg-gray-800 hover:bg-gray-700
                           border border-gray-700 hover:border-purple-500
                           rounded-xl transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{g.groupName}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {t ? "Code:" : "Código:"} <span className="font-mono text-purple-400">{g.groupCode}</span>
                      {g.isCreator && <span className="ml-2 text-yellow-400">👑</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-bold">{g.monthlyPoints} pts</p>
                    <p className="text-gray-500 text-xs">{t ? "this month" : "este mes"}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-center">
            <p className="text-gray-400 text-sm">
              {t ? "You're not in any group yet." : "Aún no estás en ningún grupo."}
            </p>
          </div>
        )}

        {/* Botones según la intención original */}
        <div className="flex flex-col gap-3">
          {(intent === "create" || userData?.groups?.length < 3) && (
            <button
              onClick={() => setStep(STEP.CREATE)}
              className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
            >
              {t ? "+ Create new group" : "+ Crear nuevo grupo"}
            </button>
          )}
          <button
            onClick={() => setStep(STEP.JOIN)}
            className="py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-700 transition-colors"
          >
            {t ? "Join with code" : "Unirse con código"}
          </button>
        </div>
      </div>
    </div>
  )

  // ── CREAR GRUPO ───────────────────────────────────────────────────
  if (step === STEP.CREATE) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button onClick={goBack} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
          ← {t ? "Back" : "Volver"}
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">
          {t ? "Name your group" : "Nombre del grupo"}
        </h2>
        <div className="flex flex-col gap-4">
          <input
            name="groupName"
            placeholder={t ? "e.g. Friday Squad" : "Ej. Los del jueves"}
            value={form.groupName}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700
                       focus:outline-none focus:border-purple-500 placeholder-gray-500"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? "..." : (t ? "Create" : "Crear")}
          </button>
        </div>
      </div>
    </div>
  )

  // ── UNIRSE CON CÓDIGO ─────────────────────────────────────────────
  if (step === STEP.JOIN) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button onClick={goBack} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
          ← {t ? "Back" : "Volver"}
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">
          {t ? "Enter group code" : "Código del grupo"}
        </h2>
        <div className="flex flex-col gap-4">
          <input
            name="groupCode"
            placeholder={t ? "e.g. ABC123" : "Ej. ABC123"}
            value={form.groupCode}
            onChange={handleChange}
            maxLength={6}
            className="px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700
                       focus:outline-none focus:border-purple-500 placeholder-gray-500 uppercase"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            onClick={handleJoin}
            disabled={loading}
            className="py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? "..." : (t ? "Join" : "Unirse")}
          </button>
        </div>
      </div>
    </div>
  )

  return null
}

export default Grupos