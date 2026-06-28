import { MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import {
  defaultStarterQuestions,
  fetchAssistantConfig,
  streamAssistantChat,
} from '../lib/assistantApi.js';

function AssistantMessage({ role, content, isStreaming = false }) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
          isUser ? 'bg-harbor text-white' : 'bg-white ring-1 ring-tide/30'
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          <span className="text-xs font-bold">You</span>
        ) : (
          <Logo variant="assistant" className="h-6 w-6" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? 'rounded-tr-md bg-harbor text-white'
            : 'rounded-tl-md border border-ink/8 bg-white text-ink/80'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {isStreaming && (
          <span className="mt-1 inline-block h-4 w-0.5 animate-pulse bg-tide align-middle" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

export default function AssistantWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [starterQuestions, setStarterQuestions] = useState(defaultStarterQuestions);
  const [assistantName, setAssistantName] = useState('Traviona Assistant');
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    fetchAssistantConfig()
      .then((config) => {
        setAssistantName(config.name || 'Traviona Assistant');
        if (Array.isArray(config.starter_questions) && config.starter_questions.length > 0) {
          setStarterQuestions(config.starter_questions);
        }
      })
      .catch(() => {
        setStarterQuestions(defaultStarterQuestions);
      });
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setError('');
    setInput('');

    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setIsLoading(true);

    const assistantIndex = nextMessages.length;
    setMessages((current) => [...current, { role: 'assistant', content: '' }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamAssistantChat(nextMessages, {
        signal: controller.signal,
        onDelta: (delta) => {
          setMessages((current) =>
            current.map((message, index) =>
              index === assistantIndex
                ? { ...message, content: `${message.content}${delta}` }
                : message,
            ),
          );
        },
        onError: (message) => setError(message),
      });
    } catch (caught) {
      if (caught.name !== 'AbortError') {
        setError('Unable to reach Traviona Assistant. Please try again.');
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(input);
  }

  function closePanel() {
    abortRef.current?.abort();
    setIsOpen(false);
  }

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-tide px-5 py-3.5 text-sm font-bold text-ink shadow-[0_16px_40px_rgba(43,196,182,0.35)] transition hover:bg-harbor hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-tide focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
          aria-label="Open Traviona Assistant"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">Ask Traviona</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[70] sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto">
          <button
            type="button"
            className="absolute inset-0 bg-ink/35 backdrop-blur-[1px] sm:hidden"
            aria-label="Close assistant"
            onClick={closePanel}
          />

          <section
            className="absolute inset-x-0 bottom-0 flex h-[min(100dvh,640px)] flex-col overflow-hidden rounded-t-3xl border border-ink/10 bg-white shadow-[0_24px_80px_rgba(7,19,31,0.22)] sm:relative sm:h-[min(82dvh,680px)] sm:w-[min(100vw-2rem,24rem)] sm:rounded-3xl"
            aria-label="Traviona Assistant chat"
          >
            <header className="relative overflow-hidden bg-gradient-to-r from-ink via-midnight to-harbor px-5 py-4 text-white">
              <div
                className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-tide/25 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/95 p-1.5 ring-1 ring-white/20">
                    <Logo variant="assistant" className="h-7 w-7" />
                  </span>
                  <div>
                    <h2 className="font-display text-base font-bold">{assistantName}</h2>
                    <p className="text-xs text-white/70">Services, insights, careers & talent</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-ivory/70 to-white px-4 py-4">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-tide/20 bg-white p-4 shadow-sm">
                  <p className="text-sm leading-6 text-ink/75">
                    Hello — I&apos;m {assistantName}. Ask about Traviona&apos;s advisory services, global insights,
                    careers, or how to join our talent network.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {starterQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => sendMessage(question)}
                        className="rounded-full border border-harbor/20 bg-tide/10 px-3 py-1.5 text-left text-xs font-semibold text-harbor transition hover:bg-tide/20"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <AssistantMessage
                  key={`${message.role}-${index}`}
                  role={message.role}
                  content={message.content}
                  isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
                />
              ))}

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-ink/8 bg-white px-4 py-3"
            >
              <div className="flex items-end gap-2">
                <label className="sr-only" htmlFor="assistant-input">
                  Message Traviona Assistant
                </label>
                <textarea
                  id="assistant-input"
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit(event);
                    }
                  }}
                  placeholder="Ask about services, insights, careers..."
                  className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-ink/12 bg-mist/30 px-4 py-3 text-sm text-ink outline-none ring-tide/30 placeholder:text-ink/40 focus:border-tide focus:ring-2"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tide text-ink transition hover:bg-harbor hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
