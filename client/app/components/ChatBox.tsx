"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  MessageCircle,
  FileText,
  Search,
  Settings,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAskQuestionMutation } from "../services/pdfApi";

type Message = { id: string; role: "user" | "ai"; content: string };

export default function ChatBox({ pdfId }: { pdfId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Hello! I've successfully analyzed your PDF document. I can help you find information, summarize content, answer questions, and extract key insights. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [askQuestion, { isLoading }] = useAskQuestionMutation();

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Safe ID generator
  const generateId = () => crypto.randomUUID();

  const send = async (customInput?: string) => {
    const text = (customInput ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await askQuestion({ docId: pdfId, question: text }).unwrap();
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "ai", content: res.answer },
      ]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "ai",
          content:
            "I apologize, but I encountered an error processing your request. Please try again.",
        },
      ]);
    }
  };

const MessageBubble = ({
  message,
  index,
}: {
  message: Message;
  index: number;
}) => {
  const isUser = message.role === "user";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={`flex gap-3 mb-6 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 border border-gray-200"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <motion.div
          layout
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
            isUser
              ? "bg-blue-600 text-white rounded-br-md self-end"
              : "bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm self-start"
          }`}
        >
          {message.content}
        </motion.div>
      </div>
    </motion.div>
  );
};


  const LoadingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 mb-6"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
        <Bot className="w-4 h-4 text-gray-600" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500 ml-2">Analyzing...</span>
      </div>
    </motion.div>
  );

  const suggestionQueries = [
    "Summarize this document",
    "What are the key points?",
    "Extract important dates",
    "Find contact information",
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                PDF Assistant
              </h1>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                Ready to help
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  index={index}
                />
              ))}
              {isTyping && <LoadingIndicator />}
            </AnimatePresence>
            <div ref={messagesEndRef} />

            {/* Quick Suggestions */}
            {messages.length === 1 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <p className="text-sm text-gray-500 mb-3 px-1">Try asking:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {suggestionQueries.map((query, index) => (
                    <motion.button
                      key={index}
                      onClick={() => send(query)}
                      className="text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      "{query}"
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0"
      >
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <motion.textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask a question about your document..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
            rows={1}
            disabled={isLoading}
          />
          <motion.button
            onClick={() => send()}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
