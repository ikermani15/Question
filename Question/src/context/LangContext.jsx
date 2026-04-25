import { createContext, useContext, useState } from "react"

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    localStorage.getItem("triviaLang") || "es"
  )

  function setLangTo(newLang) {
    localStorage.setItem("triviaLang", newLang)
    setLang(newLang)
  }

  return (
    <LangContext.Provider value={{ lang, setLangTo }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}