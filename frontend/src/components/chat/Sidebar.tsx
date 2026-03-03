
import React from "react"
import { ChatConversation } from "../../types"

interface Props {
  conversations: ChatConversation[]
  activeConversation: ChatConversation | null
  setActiveConversation: (conv: ChatConversation) => void
  setConversations: React.Dispatch<React.SetStateAction<ChatConversation[]>>
}

const Sidebar: React.FC<Props> = ({
  conversations,
  activeConversation,
  setActiveConversation,
  setConversations
}) => {

  const openConversation = (conv: ChatConversation) => {
    setActiveConversation(conv)

    
    setConversations(prev =>
      prev.map(c =>
        c.id === conv.id ? { ...c, unread: 0 } : c
      )
    )
  }

  return (
    <div className="w-64 bg-deep-navy text-frosted-blue p-4">
      <h2 className="text-xl mb-4">Conversations</h2>

      {conversations.map(conv => (
        <div
          key={conv.id}
          onClick={() => openConversation(conv)}
          className={`p-3 mb-2 rounded cursor-pointer ${
            activeConversation?.id === conv.id
              ? "bg-cornflower-ocean"
              : "hover:bg-imperial-blue"
          }`}
        >
          <div className="flex justify-between">
            <span>{conv.name}</span>
            {conv.unread > 0 && (
              <span className="bg-cornflower-ocean px-2 rounded-full text-sm">
                {conv.unread}
              </span>
            )}
          </div>

          <p className="text-sm opacity-70">
            {conv.lastMessage}
          </p>
        </div>
      ))}
    </div>
  )
}

export default Sidebar