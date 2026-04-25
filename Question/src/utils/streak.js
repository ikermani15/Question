export function getStreaks() {
  const visit   = JSON.parse(localStorage.getItem("triviaVisitStreak")  || "{}")
  const correct = JSON.parse(localStorage.getItem("triviaCorrectStreak") || "{}")

  return {
    visitStreak:       visit.streak   || 0,
    lastVisitDate:     visit.lastDate || null,
    correctStreak:     correct.streak   || 0,
    lastCorrectDate:   correct.lastDate || null,
    answeredToday:     visit.answeredToday  || false,
    lastAnswerCorrect: visit.lastAnswerCorrect ?? null,
  }
}

export function registerVisit() {
  const today     = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
  const current   = JSON.parse(localStorage.getItem("triviaVisitStreak") || "{}")

  if (current.lastDate === today) return

  let newStreak = 1
  if (current.lastDate === yesterday) {
    newStreak = (current.streak || 0) + 1
  }

  localStorage.setItem("triviaVisitStreak", JSON.stringify({
    streak:            newStreak,
    lastDate:          today,
    answeredToday:     false,
    lastAnswerCorrect: null,
  }))
}

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

  // Solo guardamos lo mínimo, sin texto traducido
  localStorage.setItem("triviaTodayResult", JSON.stringify({
    date:          today,
    questionId:    questionData.id,
    selectedId,
    correctOption,
    isCorrect,
  }))

  return newCorrectStreak
}

export function hasAnsweredToday() {
  const today   = new Date().toISOString().split("T")[0]
  const current = JSON.parse(localStorage.getItem("triviaVisitStreak") || "{}")
  return current.lastDate === today && current.answeredToday === true
}

export function getTodayResult() {
  const data  = JSON.parse(localStorage.getItem("triviaTodayResult") || "null")
  const today = new Date().toISOString().split("T")[0]
  if (!data || data.date !== today) return null
  return data
}