import { createContext, useContext, useState, useEffect } from "react"
import { getGroupSession, saveGroupSession, clearGroupSession } from "../services/groupService"

const GroupContext = createContext(null)

export function GroupProvider({ children }) {
  const [group, setGroup]             = useState(null)
  const [participant, setParticipant] = useState(null)

  useEffect(() => {
    const session = getGroupSession()
    if (session) {
      setGroup(session.group)
      setParticipant(session.participant)
    }
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

  return (
    <GroupContext.Provider value={{ group, participant, enterGroup, leaveGroup }}>
      {children}
    </GroupContext.Provider>
  )
}

export function useGroup() {
  return useContext(GroupContext)
}