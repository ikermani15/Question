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

  const currentCorrect = JSON.parse(localStorage.getItem("triviaCorrectStreak") || "{}")
  let newCorrectStreak = 0

  if (isCorrect) {
    if (currentCorrect.lastDate === yesterday) {
      newCorrectStreak = (currentCorrect.streak || 0) + 1
    } else if (currentCorrect.lastDate === today) {
      newCorrectStreak = currentCorrect.streak
    } else {
      newCorrectStreak = 1
    }
  }

  localStorage.setItem("triviaCorrectStreak", JSON.stringify({
    streak:   newCorrectStreak,
    lastDate: today,
  }))

  const currentVisit = JSON.parse(localStorage.getItem("triviaVisitStreak") || "{}")
  localStorage.setItem("triviaVisitStreak", JSON.stringify({
    ...currentVisit,
    answeredToday:     true,
    lastAnswerCorrect: isCorrect,
  }))

  // Guardar siempre ES y EN por separado, independientemente del idioma activo
  const esOptions = questionData.options_es || questionData.options
  const enOptions = questionData.options_en || questionData.options

  localStorage.setItem("triviaTodayResult", JSON.stringify({
    date:           today,
    question_es:    questionData.options_es
                      ? (questionData.lang === "es" ? questionData.question : null)
                      : questionData.question,
    question_en:    questionData.question_en || questionData.question,
    options_es:     esOptions,
    options_en:     enOptions,
    explanation_es: questionData.lang === "es"
                      ? questionData.explanation
                      : null,
    explanation_en: questionData.explanation_en || questionData.explanation,
    selectedId,
    correctOption,
    isCorrect,
  }))

  return newCorrectStreak
}

// Comprueba si el usuario ya respondió hoy
export function hasAnsweredToday() {
  const today   = new Date().toISOString().split("T")[0]
  const current = JSON.parse(localStorage.getItem("triviaVisitStreak") || "{}")
  return current.lastDate === today && current.answeredToday === true
}

export function getTodayResult(lang = "es") {
  const data  = JSON.parse(localStorage.getItem("triviaTodayResult") || "null")
  const today = new Date().toISOString().split("T")[0]
  if (!data || data.date !== today) return null

  const isEn = lang === "en"
  return {
    ...data,
    question:    isEn ? data.question_en    : (data.question_es    || data.question_en),
    explanation: isEn ? data.explanation_en : (data.explanation_es || data.explanation_en),
    options:     isEn ? data.options_en     : (data.options_es     || data.options_en),
  }
}