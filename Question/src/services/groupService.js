const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function createGroup(groupName, username, pin) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/group-join`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ action: "create", groupName, username, pin }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function joinGroup(groupCode, username, pin) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/group-join`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ action: "join", groupCode, username, pin }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function getLeaderboard(groupId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/participants?group_id=eq.${groupId}&select=username,monthly_points,current_streak,avatar&order=monthly_points.desc`,
    {
      headers: {
        "apikey":        SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
    }
  )
  return res.json()
}

export async function getTodayGroupQuestion(lang = "es") {
  const today = new Date().toISOString().split("T")[0]
  const isEn  = lang === "en"
  const res   = await fetch(
    `${SUPABASE_URL}/rest/v1/questions?play_date=eq.${today}&mode=eq.group&select=*`,
    {
      headers: {
        "apikey":        SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
    }
  )
  const rows = await res.json()
  if (!rows || rows.length === 0) throw new Error("No hay pregunta de grupo para hoy")
  const q = rows[0]
  return {
    id:       q.id,
    question: isEn ? q.question_en    : q.question,
    explanation: isEn ? q.explanation_en : q.explanation,
    options: [
      { id: "a", text: isEn ? q.option_a_en : q.option_a },
      { id: "b", text: isEn ? q.option_b_en : q.option_b },
      { id: "c", text: isEn ? q.option_c_en : q.option_c },
      { id: "d", text: isEn ? q.option_d_en : q.option_d },
    ],
  }
}

export async function submitGroupAnswer(participantId, questionId, selectedOption, responseTimeMs) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/group-answer`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ participantId, questionId, selectedOption, responseTimeMs }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

// Guardar sesión del grupo en localStorage
export function saveGroupSession(group, participant) {
  localStorage.setItem("triviaGroup", JSON.stringify({ group, participant }))
}

export function getGroupSession() {
  const data = localStorage.getItem("triviaGroup")
  return data ? JSON.parse(data) : null
}

export function clearGroupSession() {
  localStorage.removeItem("triviaGroup")
}

export async function getGroupInfo(code) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/trivia_groups?code=eq.${code}&select=*`,
    { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
  )
  const rows = await res.json()
  return rows[0] || null
}

export async function kickParticipant(participantId, groupId, requesterUsername, creatorUsername) {
  if (requesterUsername !== creatorUsername) {
    throw new Error("Solo el creador puede expulsar jugadores")
  }
  const res = await fetch(`${SUPABASE_URL}/functions/v1/group-admin`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ action: "kick", participantId, groupId, requesterUsername }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function deleteGroup(groupId, requesterUsername, creatorUsername) {
  if (requesterUsername !== creatorUsername) {
    throw new Error("Solo el creador puede eliminar el grupo")
  }
  const res = await fetch(`${SUPABASE_URL}/functions/v1/group-admin`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ action: "delete", groupId, requesterUsername }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function getLeaderboard(groupId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/participants?group_id=eq.${groupId}&select=id,username,monthly_points,current_streak,avatar&order=monthly_points.desc`,
    {
      headers: {
        "apikey":        SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
    }
  )
  return res.json()
}