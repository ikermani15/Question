import { createContext, useContext, useState, useEffect } from "react"
import { getGroupSession, saveGroupSession, clearGroupSession } from "../services/groupService"

const GroupContext = createContext(null)

export function GroupProvider({ children }) {
  const [group, setGroup]             = useState(null)
  const [participant, setParticipant] = useState(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  useEffect(() => {
    const session = getGroupSession()
    if (session) {
      setGroup(session.group)
      setParticipant(session.participant)
    }
    setSessionLoaded(true)
  }, [])

  function enterGroup(groupData, participantData) {
    setGroup(groupData)
    setParticipant(participantData)
    saveGroupSession(groupData, participantData)
  }

  function leaveGroup() {
    setGroup(null)
    setParticipant(null)
    clearGroupSession()
  }

  // Guardar userData (username + PIN) para no pedirlo de nuevo
  function saveUserData(data) {
    localStorage.setItem("triviaUserData", JSON.stringify(data))
  }

  function getUserData() {
    const d = localStorage.getItem("triviaUserData")
    return d ? JSON.parse(d) : null
  }

  return (
    <GroupContext.Provider value={{
      group, participant, sessionLoaded,
      enterGroup, leaveGroup, saveUserData, getUserData
    }}>
      {children}
    </GroupContext.Provider>
  )
}

export function useGroup() {
  return useContext(GroupContext)
}