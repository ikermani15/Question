const express = require("express")
const cors = require("cors")
const cron = require("node-cron")
require("dotenv").config()

const questionsRouter = require("./routes/questions")
const adminRouter     = require("./routes/admin")
const { generateAndSave } = require("./services/questionGenerator")

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

app.use("/api/questions", questionsRouter)
app.use("/api/admin", adminRouter)

app.get("/health", (req, res) => res.json({ status: "ok" }))

// Cron: genera la pregunta del día siguiente cada noche a las 23:00
// Formato: segundo minuto hora día mes díaSemana
cron.schedule("0 0 23 * * *", async () => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
  console.log(`⏰ Cron ejecutándose: generando pregunta para ${tomorrow}`)
  try {
    await generateAndSave(tomorrow)
  } catch (error) {
    console.error("Error en cron:", error.message)
  }
})

console.log("⏰ Cron programado: genera pregunta mañana cada día a las 23:00")

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})