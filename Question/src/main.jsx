import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { LangProvider } from "./context/LangContext"
import { GroupProvider } from "./context/GroupContext"
import App from "./App.jsx"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LangProvider>
      <GroupProvider>
        <App />
      </GroupProvider>
    </LangProvider>
  </StrictMode>
)