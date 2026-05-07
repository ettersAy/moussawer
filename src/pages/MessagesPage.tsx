import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api, shortDate, type Conversation, type Message } from "../lib/api";

export function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    api<Conversation[]>("/conversations").then((response) => {
      setConversations(response.data);
      setActiveId(response.data[0]?.id ?? "");
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    api<Message[]>(`/conversations/${activeId}/messages`).then((response) => setMessages(response.data));
    api(`/conversations/${activeId}/read`, { method: "PATCH" }).catch(() => undefined);
  }, [activeId]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim() || !activeId) return;
    const response = await api<Message>(`/conversations/${activeId}/messages`, { method: "POST", body: { body } });
    setMessages((current) => [...current, response.data]);
    setBody("");
  }

  return (
    <section className="page">
      <div className="split-heading">
        <div>
          <span className="eyebrow">Messaging</span>
          <h1>Conversations linked to bookings and support work.</h1>
        </div>
      </div>
      <div className="messages-layout">
        <aside className="thread-list">
          {conversations.map((conversation) => (
            <button className={activeId === conversation.id ? "thread active" : "thread"} key={conversation.id} onClick={() => setActiveId(conversation.id)} type="button">
              <strong>{conversation.subject}</strong>
              <span>{conversation.lastMessage?.body ?? "No messages yet"}</span>
            </button>
          ))}
          {!conversations.length && <div className="panel muted">No conversations yet.</div>}
        </aside>
        <section className="message-panel">
          <div className="message-stream">
            {messages.map((message) => (
              <article className={message.sender.id === user?.id ? "bubble mine" : "bubble"} key={message.id}>
                <strong>{message.sender.name}</strong>
                <p>{message.body}</p>
                <span>{shortDate(message.createdAt)}</span>
              </article>
            ))}
          </div>
          <form className="message-form" onSubmit={send}>
            <input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message" />
            <button className="solid-button compact" type="submit"><Send size={16} /> Send</button>
          </form>
        </section>
      </div>
    </section>
  );
}
