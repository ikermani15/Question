const express = require("express")
const router = express.Router()
const { generateAndSave } = require("../services/questionGenerator")

// POST /api/admin/generate
// Genera la pregunta de hoy o de una fecha específica
router.post("/generate", async (req, res) => {
  try {
    const date = req.body.date || new Date().toISOString().split("T")[0]
    const data = await generateAndSave(date)
    res.json({ success: true, date, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/admin/generate-week
// Genera preguntas para los próximos 7 días de golpe
router.post("/generate-week", async (req, res) => {
  try {
    const results = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() + i * 86400000).toISOString().split("T")[0]
      const data = await generateAndSave(date)
      results.push({ date, ok: true })
      // Pequeña pausa entre llamadas para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    res.json({ success: true, results })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router