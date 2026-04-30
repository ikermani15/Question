import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { identifyUser, createGroup, joinGroup } from "../services/groupService"
import { useGroup } from "../context/GroupContext"
import { useLang } from "../context/LangContext"

const STEP = {
  INITIAL:   "initial",
  IDENTIFY:  "identify",
  MY_GROUPS: "myGroups",
  CREATE:    "create",
  JOIN:      "join",
}

function Grupos({ initialStep }) {
  const navigate         = useNavigate()
  const { code: inviteCode } = useParams() // código del enlace compartido
  const { enterGroup, getUserData, saveUserData, sessionLoaded, group } = useGroup()
  const { lang }         = useLang()
  const t                = lang === "en"

  const [step, setStep]         = useState(STEP.INITIAL)
  const [intent, setIntent]     = useState(null)
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [userData, setUserData_] = useState(null)

  const [form, setForm] = useState({
    username: "", pin: "", groupName: "", groupCode: inviteCode || "",
  })

  useEffect(() => {
    if (!sessionLoaded) return

    // Si viene de "mis grupos" y ya tiene sesión, ir directo a mis grupos
    if (initialStep === "myGroups") {
      const saved = getUserData()
      if (saved) {
        setUserData_(saved)
        setStep(STEP.MY_GROUPS)
        return
      }
      setStep(STEP.IDENTIFY)
      return
    }

    // Si viene de enlace compartido /grupos/join/:code
    if (initialStep === "joinWithCode") {
      const saved = getUserData()
      if (saved) {
        setUserData_(saved)
        setForm(f => ({ ...f, groupCode: inviteCode || "" }))
        setStep(STEP.JOIN)
        return
      }
      setIntent("join")
      setStep(STEP.IDENTIFY)
      return
    }
  }, [sessionLoaded, initialStep])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function goBack() {
    setError(null)
    if (step === STEP.IDENTIFY)  setStep(STEP.INITIAL)
    if (step === STEP.MY_GROUPS) setStep(STEP.INITIAL)
    if (step === STEP.CREATE)    setStep(STEP.MY_GROUPS)
    if (step === STEP.JOIN)      userData ? setStep(STEP.MY_GROUPS) : setStep(STEP.INITIAL)
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
      const ud = { username: form.username, pin: form.pin, ...data }
      setUserData_(ud)
      saveUserData(ud)

      // Si venía de enlace compartido, ir directo a unirse
      if (intent === "join" || initialStep === "joinWithCode") {
        setStep(STEP.JOIN)
      } else if (intent === "create") {
        setStep(STEP.MY_GROUPS)
      } else {
        setStep(STEP.MY_GROUPS)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setError(null)
    if (!form.groupName) {
      setError(t ? "Group name required" : "Nombre obligatorio")
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
      setError(t ? "Group code required" : "Código obligatorio")
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

  if (!sessionLoaded) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400">...</p>
    </div>
  )

  // ── INICIAL ───────────────────────────────────────────────────────
  if (step === STEP.INITIAL) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-white mb-2">{t ? "🏆 Groups" : "🏆 Grupos"}</h1>
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
        <h2 className="text-2xl font-bold text-white mb-2">{t ? "Who are you?" : "¿Quién eres?"}</h2>
        <p className="text-gray-400 text-sm mb-6">
          {t
            ? "Enter your username and PIN. New? Choose one to remember."
            : "Introduce tu nombre y PIN. ¿Nuevo? Elige uno que recuerdes."}
        </p>
        {inviteCode && (
          <div className="bg-purple-900/30 border border-purple-700 rounded-xl px-4 py-3 mb-4">
            <p className="text-purple-300 text-sm">
              {t ? `You've been invited to join group ` : `Te han invitado al grupo `}
              <span className="font-mono font-bold">{inviteCode}</span>
            </p>
          </div>
        )}
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
            {t ? "Your PIN identifies you across devices." : "Tu PIN te identifica en todos los dispositivos."}
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
        <h2 className="text-2xl font-bold text-white mb-1">
          {t ? `Hello, ${userData?.username}!` : `¡Hola, ${userData?.username}!`}
        </h2>
        <p className="text-gray-400 text-sm mb-6">{t ? "Your groups" : "Tus grupos"}</p>

        {userData?.groups?.length > 0 ? (
          <div className="flex flex-col gap-3 mb-6">
            {userData.groups.map(g => (
              <button
                key={g.groupCode}
                onClick={() => enterExistingGroup(g)}
                className="w-full text-left px-4 py-4 bg-gray-800 hover:bg-gray-700
                           border border-gray-700 hover:border-purple-500 rounded-xl transition-colors"
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

        <div className="flex flex-col gap-3">
          {userData?.groups?.length < 3 && (
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
          <button
            onClick={() => { saveUserData(null); localStorage.removeItem("triviaUserData"); navigate("/grupos") }}
            className="py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            {t ? "Switch user" : "Cambiar usuario"}
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
        <h2 className="text-2xl font-bold text-white mb-6">{t ? "Name your group" : "Nombre del grupo"}</h2>
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

  // ── UNIRSE ────────────────────────────────────────────────────────
  if (step === STEP.JOIN) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button onClick={goBack} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
          ← {t ? "Back" : "Volver"}
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">{t ? "Enter group code" : "Código del grupo"}</h2>
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