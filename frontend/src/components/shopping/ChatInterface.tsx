
import { useState } from "react";
import { Bot, Send, LoaderCircle } from "lucide-react";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface Props {
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
    onSend: (message: string) => Promise<void>;
}

export default function ChatInterface({
    messages,
    loading,
    error,
    onSend,
}: Props) {
    const [input, setInput] = useState("");

    function submit() {
        const message = input.trim();

        if (!message || loading) return;

        setInput("");
        void onSend(message);
    }

    return (
        <div className="panel flex flex-col">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200">
                <div className="rounded-xl bg-teal-50 p-3">
                    <Bot className="text-teal-700" />
                </div>
                <div>
                    <h2 className="font-bold">GuardCart AI Assistant</h2>
                    <p className="text-xs text-slate-500">
                        Intelligent Shopping Interface
                    </p>
                </div>
            </div>

            <div
                aria-live="polite"
                className="h-80 space-y-4 overflow-y-auto py-5"
            >
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`max-w-[85%] rounded-xl p-4 text-sm ${message.role === "user"
                                ? "ml-auto bg-teal-700 text-white"
                                : "bg-slate-100 text-slate-800"
                            }`}
                    >
                        {message.content}
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <LoaderCircle className="animate-spin" size={18} />
                        Processing your request...
                    </div>
                )}
            </div>

            {error && (
                <div role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form
                className="flex gap-3 border-t border-slate-200 pt-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    submit();
                }}
            >
                <input
                    className="field"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Find a keyboard under $50..."
                    disabled={loading}
                    aria-label="Shopping request"
                />

                <button
                    type="submit"
                    className="primary-btn"
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
