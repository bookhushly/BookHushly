"use client";

import { useState } from "react";
import AgentConversationList from "./AgentConversationList";
import AgentConversation from "./AgentConversation";

export default function SupportDashboard({ currentAgent, initialCounts }) {
  const [selectedConversation, setSelectedConversation] = useState(null);

  function handleSelect(conversation) {
    setSelectedConversation(conversation);
  }

  function handleConversationUpdate(updates) {
    setSelectedConversation((prev) =>
      prev ? { ...prev, ...updates } : prev
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <AgentConversationList
        currentAgent={currentAgent}
        initialCounts={initialCounts}
        selectedId={selectedConversation?.id}
        onSelect={handleSelect}
      />
      <AgentConversation
        conversation={selectedConversation}
        currentAgent={currentAgent}
        onUpdate={handleConversationUpdate}
      />
    </div>
  );
}
