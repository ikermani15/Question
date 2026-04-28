import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createGroup, joinGroup } from "../services/groupService"
import { useGroup } from "../context/GroupContext"
import { useLang } from "../context/LangContext"

function Grupos() {
  const navigate          = useNavigate()
  const { enterGroup }    = useGroup()
  const { lang }          = useLang()
  const t                 = lang === "en"

  const [mode, setMode]   = useState(null) // "create" | "join"
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    groupName: "", groupCode: "", username: "", pin: "", pinConfirm: "",
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      let data
      if (mode === "create") {
        if (form.pin !== form.pinConfirm) {
          setError(t ? "PINs don't match" : "Los PINs no coinciden")
          setLoading(false)
          return
        }
        data = await createGroup(form.groupName, form.username, form.pin)
      } else {
        data = await joinGroup(form.groupCode, form.username, form.pin)
      }
      enterGroup(data.group, data.participant)
      navigate(`/grupos/${data.group.code}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Pantalla inicial: elegir crear o unirse
  if (!mode) return (
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
            onClick={() => setMode("create")}
            className="py-4 bg-purple-600 hover:bg-purple-500 text-white
                       font-semibold rounded-xl transition-colors"
          >
            {t ? "Create group" : "Crear grupo"}
          </button>
          <button
            onClick={() => setMode("join")}
            className="py-4 bg-gray-800 hover:bg-gray-700 text-white
                       font-semibold rounded-xl border border-gray-700 transition-colors"
          >
            {t ? "Join with code" : "Unirse con código"}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button
          onClick={() => { setMode(null); setError(null) }}
          className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1"
        >
          ← {t ? "Back" : "Volver"}
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">
          {mode === "create"
            ? (t ? "Create group" : "Crear grupo")
            : (t ? "Join group"   : "Unirse a un grupo")}
        </h2>

        <div className="flex flex-col gap-4">
          {mode === "create" && (
            <input
              name="groupName"
              placeholder={t ? "Group name" : "Nombre del grupo"}
              value={form.groupName}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700
                         focus:outline-none focus:border-purple-500 placeholder-gray-500"
            />
          )}

          {mode === "join" && (
            <input
              name="groupCode"
              placeholder={t ? "Group code (e.g. ABC123)" : "Código del grupo (ej. ABC123)"}
              value={form.groupCode}
              onChange={handleChange}
              maxLength={6}
              className="px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700
                         focus:outline-none focus:border-purple-500 placeholder-gray-500 uppercase"
            />
          )}

          <input
            name="username"
            placeholder={t ? "Your username" : "Tu nombre de usuario"}
            value={form.username}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700
                       focus:outline-none focus:border-purple-500 placeholder-gray-500"
          />

          <div>
            <input
              name="pin"
              type="password"
              placeholder={t ? "4-digit PIN" : "PIN de 4 dígitos"}
              value={form.pin}
              onChange={handleChange}
              maxLength={4}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700
                         focus:outline-none focus:border-purple-500 placeholder-gray-500"
            />
            <p className="text-gray-500 text-xs mt-1 px-1">
              {t
                ? "Remember your PIN to access from other devices"
                : "Recuerda tu PIN para acceder desde otros dispositivos"}
            </p>
          </div>

          {mode === "create" && (
            <input
              name="pinConfirm"
              type="password"
              placeholder={t ? "Confirm PIN" : "Confirmar PIN"}
              value={form.pinConfirm}
              onChange={handleChange}
              maxLength={4}
              className="px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700
                         focus:outline-none focus:border-purple-500 placeholder-gray-500"
            />
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50
                       text-white font-semibold rounded-xl transition-colors"
          >
            {loading
              ? (t ? "Loading..." : "Cargando...")
              : mode === "create"
                ? (t ? "Create" : "Crear")
                : (t ? "Join"   : "Unirse")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Grupos