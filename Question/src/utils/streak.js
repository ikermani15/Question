// Racha de visitas diarias (entra a la página)
// Racha de aciertos consecutivos (responde correctamente)

export function getStreaks() {
  const visit  = JSON.parse(localStorage.getItem("triviaVisitStreak")  || "{}")
  const correct = JSON.parse(localStorage.getItem("triviaCorrectStreak") || "{}")

  return {
    visitStreak:        visit.streak   || 0,
    lastVisitDate:      visit.lastDate || null,

    correctStreak:      correct.streak   || 0,
    lastCorrectDate:    correct.lastDate || null,

    answeredToday:      visit.answeredToday  || false,
    lastAnswerCorrect:  visit.lastAnswerCorrect ?? null,
  }
}

// Se llama cuando el usuario entra a la página (en Home al cargar)
export function registerVisit() {
  const today     = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
  const current   = JSON.parse(localStorage.getItem("triviaVisitStreak") || "{}")

  // Si ya registramos la visita hoy, no hacemos nada
  if (current.lastDate === today) return

  let newStreak = 1
  if (current.lastDate === yesterday) {
    newStreak = (current.streak || 0) + 1  // visitó ayer → racha continúa
  }

  localStorage.setItem("triviaVisitStreak", JSON.stringify({
    streak:            newStreak,
    lastDate:          today,
    answeredToday:     false,
    lastAnswerCorrect: null,
  }))
}

// Se llama cuando el usuario responde la pregunta
export function registerAnswer(isCorrect, questionData, selectedId, correctOption) {
  const today     = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  // --- Actualizar racha de aciertos ---
  const currentCorrect = JSON.parse(localStorage.getItem("triviaCorrectStreak") || "{}")
  let newCorrectStreak = 0

  if (isCorrect) {
    if (currentCorrect.lastDate === yesterday) {
      newCorrectStreak = (currentCorrect.streak || 0) + 1  // acertó ayer y hoy → continúa
    } else if (currentCorrect.lastDate === today) {
      newCorrectStreak = currentCorrect.streak              // ya respondió hoy, no cambia
    } else {
      newCorrectStreak = 1                                  // primer acierto o racha rota
    }
  }
  // Si falla → newCorrectStreak queda en 0 (racha de aciertos se rompe)

  localStorage.setItem("triviaCorrectStreak", JSON.stringify({
    streak:   newCorrectStreak,
    lastDate: today,
  }))

  // --- Marcar que ya respondió hoy en la racha de visitas ---
  const currentVisit = JSON.parse(localStorage.getItem("triviaVisitStreak") || "{}")
  localStorage.setItem("triviaVisitStreak", JSON.stringify({
    ...currentVisit,
    answeredToday:     true,
    lastAnswerCorrect: isCorrect,
  }))

  // --- Guardar la pregunta y respuesta del día para poder revisarla ---
  localStorage.setItem("triviaTodayResult", JSON.stringify({
    date:          today,
    question:      questionData.question,
    options:       questionData.options,
    explanation:   questionData.explanation,
    selectedId:    selectedId,
    correctOption: correctOption,
    isCorrect:     isCorrect,
  }))

  return newCorrectStreak
}

// Comprueba si el usuario ya respondió hoy
export function hasAnsweredToday() {
  const today   = new Date().toISOString().split("T")[0]
  const current = JSON.parse(localStorage.getItem("triviaVisitStreak") || "{}")
  return current.lastDate === today && current.answeredToday === true
}

export function getTodayResult() {
  const data  = JSON.parse(localStorage.getItem("triviaTodayResult") || "null")
  const today = new Date().toISOString().split("T")[0]
  // Solo devuelve el resultado si es de hoy
  if (!data || data.date !== today) return null
  return data
}