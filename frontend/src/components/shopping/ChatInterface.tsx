
import { useState } from "react";
import { Bot, Send } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatInterface() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! What would you like to shop for today?",
        },
    ]);

    function sendMessage() {
        const text = input.trim();
        if (!text) return;

        setMessages((previous) => [
            ...previous,
            { role: "user", content: text },
            {
                role: "assistant",
                content:
                    "Demo preview: Explore the sample recommendations below. Live AI recommendations are not connected yet.",
            },
        ]);

        setInput("");
    }

    return (
        <div className="panel">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <Bot className="text-teal-700" />
                <div>
                    <h2 className="font-bold">GuardCart AI</h2>
                    <p className="text-xs text-slate-500">
                        Demo Shopping Assistant
                    </p>
                </div>
            </div>

            <div className="max-h-96 min-h-72 space-y-4 overflow-y-auto py-6">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`max-w-md rounded-xl p-4 text-sm ${message.role === "user"
                                ? "ml-auto bg-teal-700 text-white"
                                : "bg-slate-100 text-slate-800"
                            }`}
                    >
                        {message.content}
                    </div>
                ))}
            </div>

            <form
                className="flex gap-3 border-t border-slate-200 pt-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
                }}
            >
                <input
                    className="field"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Find a wireless keyboard under $50..."
                />

                <button
                    type="submit"
                    className="primary-btn"
                    aria-label="Send shopping message"
                >
                    <Send size={19} />
                </button>
            </form>
        </div>
    );
}
