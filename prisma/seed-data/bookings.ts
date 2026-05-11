export const seedAccounts = {
  admin: { email: "admin@example.com", name: "Moussawer Admin", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  client: { email: "client@example.com", name: "Nadia Client", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80", location: "Toronto, ON", bio: "Planning modern events and brand shoots across the GTA.", phone: "+1 416 555 0100" },
};

export const reviewData = {
  rating: 5,
  comment: "The direction was clear, the gallery was beautiful, and the whole process felt effortless."
};

export const conversationData = {
  subject: "Portrait session logistics",
  messages: [
    { from: "client", body: "Can we keep the shoot near covered walkways if it rains?" },
    { from: "photographer", body: "Absolutely. I have two backup spots within a five-minute walk." }
  ]
};

export const incidentData = {
  category: "Late arrival",
  description: "Sample incident for admin triage and client visibility."
};

export const disputeData = {
  type: "Package disagreement",
  description: "Sample dispute about deliverable scope.",
  comment: "I expected retouching to be included in the quote."
};

export const notificationsData = [
  { type: "booking.requested" as const, title: "New booking request", body: "Nadia requested a portrait session." },
  { type: "message.created" as const, title: "New message", body: "Amir replied to your session logistics." },
  { type: "dispute.created" as const, title: "Dispute awaiting response", body: "A package disagreement needs admin visibility." }
];
