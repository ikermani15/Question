const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function getTodayQuestion(lang = "es", mode = "daily") {
  const today = new Date().toISOString().split("T")[0]
  const isEn  = lang === "en"

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/questions?play_date=eq.${today}&mode=eq.${mode}&select=*`,
    {
      headers: {
        "apikey":        SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      }
    }
  )

  const rows = await response.json()
  if (!rows || rows.length === 0) throw new Error("No hay pregunta para hoy")

  const q = rows[0]
  return {
    id:       q.id,
    lang,
    question:    isEn ? q.question_en    : q.question,
    explanation: isEn ? q.explanation_en : q.explanation,
    options: [
      { id: "a", text: isEn ? q.option_a_en : q.option_a },
      { id: "b", text: isEn ? q.option_b_en : q.option_b },
      { id: "c", text: isEn ? q.option_c_en : q.option_c },
      { id: "d", text: isEn ? q.option_d_en : q.option_d },
    ],
    // Guardar también la versión alternativa para el localStorage
    question_en:    q.question_en,
    explanation_en: q.explanation_en,
    options_en: [
      { id: "a", text: q.option_a_en },
      { id: "b", text: q.option_b_en },
      { id: "c", text: q.option_c_en },
      { id: "d", text: q.option_d_en },
    ],
    options_es: [
      { id: "a", text: q.option_a },
      { id: "b", text: q.option_b },
      { id: "c", text: q.option_c },
      { id: "d", text: q.option_d },
    ],
  }
}

export async function submitAnswer(questionId, selectedOption) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/check-answer`,
    {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ questionId, selectedOption }),
    }
  )
  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  return data
}