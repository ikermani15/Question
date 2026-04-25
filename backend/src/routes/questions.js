const express = require("express")
const router = express.Router()
const pool = require("../db")

// GET /api/questions/today
// Devuelve la pregunta del día (sin revelar la respuesta correcta)
router.get("/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]
    const lang  = req.query.lang === "en" ? "en" : "es"  // ?lang=en o ?lang=es

    const result = await pool.query(
      `SELECT id, question, option_a, option_b, option_c, option_d, explanation,
              question_en, option_a_en, option_b_en, option_c_en, option_d_en, explanation_en
       FROM questions WHERE play_date = $1`,
      [today]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No hay pregunta para hoy" })
    }

    const q = result.rows[0]
    const isEn = lang === "en"

    res.json({
      id:       q.id,
      lang,
      question: isEn ? q.question_en : q.question,
      options: [
        { id: "a", text: isEn ? q.option_a_en : q.option_a },
        { id: "b", text: isEn ? q.option_b_en : q.option_b },
        { id: "c", text: isEn ? q.option_c_en : q.option_c },
        { id: "d", text: isEn ? q.option_d_en : q.option_d },
      ],
      explanation: isEn ? q.explanation_en : q.explanation,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

// POST /api/questions/answer
// Recibe la respuesta del usuario y devuelve si es correcta
router.post("/answer", async (req, res) => {
  try {
    const { questionId, selectedOption } = req.body

    if (!questionId || !selectedOption) {
      return res.status(400).json({ error: "Faltan datos" })
    }

    // Ahora sí consultamos la respuesta correcta
    const result = await pool.query(
      "SELECT correct_option FROM questions WHERE id = $1",
      [questionId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pregunta no encontrada" })
    }

    const correctOption = result.rows[0].correct_option
    const isCorrect = selectedOption.toLowerCase() === correctOption.toLowerCase()

    res.json({ isCorrect, correctOption })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error del servidor" })
  }
})

module.exports = router