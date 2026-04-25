const { GoogleGenerativeAI } = require("@google/generative-ai")
const pool = require("../db")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

const TOPICS = [
  "historia universal", "geografía", "ciencia y tecnología",
  "arte y literatura", "música", "cine", "deportes",
  "gastronomía", "naturaleza y animales", "astronomía",
  "mitología", "filosofía", "economía", "arquitectura",
]

async function generateQuestion(date) {
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)]
  console.log(`Generando pregunta para ${date} sobre: ${topic}`)

  const prompt = `Genera una pregunta de cultura general sobre el tema: "${topic}".

La pregunta debe:
- Ser interesante y no demasiado obvia ni demasiado difícil
- Tener exactamente 4 opciones de respuesta (a, b, c, d)
- Solo una opción debe ser correcta
- Incluir una explicación breve de por qué es correcta

Responde ÚNICAMENTE con este JSON exacto, sin texto adicional, sin bloques de código, sin comillas extra:
{
  "es": {
    "question": "pregunta en español",
    "option_a": "opción a en español",
    "option_b": "opción b en español",
    "option_c": "opción c en español",
    "option_d": "opción d en español",
    "explanation": "explicación en español"
  },
  "en": {
    "question": "question in english",
    "option_a": "option a in english",
    "option_b": "option b in english",
    "option_c": "option c in english",
    "option_d": "option d in english",
    "explanation": "explanation in english"
  },
  "correct_option": "letra correcta (a, b, c o d)"
}`

  const result = await model.generateContent(prompt)
  const raw = result.response.text().trim()

  // Limpiar posibles bloques de código que Gemini a veces añade
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

  const data = JSON.parse(cleaned)

  // Validar estructura
  const required = ["question", "option_a", "option_b", "option_c", "option_d", "explanation"]
  for (const field of required) {
    if (!data.es[field] || !data.en[field]) {
      throw new Error(`Campo faltante: ${field}`)
    }
  }
  if (!["a", "b", "c", "d"].includes(data.correct_option)) {
    throw new Error("Opción correcta inválida")
  }

  return data
}

async function saveQuestion(date, data) {
  const existing = await pool.query(
    "SELECT id FROM questions WHERE play_date = $1", [date]
  )
  if (existing.rows.length > 0) {
    console.log(`Ya existe una pregunta para ${date}, saltando...`)
    return
  }

  await pool.query(
    `INSERT INTO questions (
      question, option_a, option_b, option_c, option_d, explanation,
      question_en, option_a_en, option_b_en, option_c_en, option_d_en, explanation_en,
      correct_option, play_date
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      data.es.question, data.es.option_a, data.es.option_b,
      data.es.option_c, data.es.option_d, data.es.explanation,
      data.en.question, data.en.option_a, data.en.option_b,
      data.en.option_c, data.en.option_d, data.en.explanation,
      data.correct_option, date,
    ]
  )

  console.log(`✅ Pregunta guardada para ${date}`)
}

async function generateAndSave(date) {
  try {
    const data = await generateQuestion(date)
    await saveQuestion(date, data)
    return data
  } catch (error) {
    console.error("Error generando pregunta:", error.message)
    throw error
  }
}

module.exports = { generateAndSave }