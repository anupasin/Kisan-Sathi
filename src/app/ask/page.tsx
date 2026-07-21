"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MessageCircleQuestion,
  Mic,
  MicOff,
  SendHorizontal,
  Volume2,
  Square,
  Crown,
  LogIn,
} from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { useLocation } from "@/lib/location-provider";
import type { ApiResult } from "@/lib/types";
import { PageHeading } from "@/components/bits";
import { Spinner } from "@/components/ui";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_KEY = "kisan-ask-chat";

const STT_LANG: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  kn: "kn-IN",
  ta: "ta-IN",
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

function getRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (
    (w.SpeechRecognition as new () => SpeechRecognitionLike) ??
    (w.webkitSpeechRecognition as new () => SpeechRecognitionLike) ??
    null
  );
}

export default function AskPage() {
  const { t, lang } = useLang();
  const { user, premium, loading: authLoading } = useAuth();
  const { place } = useLocation();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [hasVoice, setHasVoice] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sttSupported = getRecognition() != null;

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(CHAT_KEY);
      if (raw) setMessages(JSON.parse(raw) as Msg[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  // TTS voice availability for the current language (varies by device).
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const check = () => {
      const voices = window.speechSynthesis.getVoices();
      setHasVoice(voices.some((v) => v.lang.startsWith(lang)));
    };
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", check);
  }, [lang]);

  const persist = (msgs: Msg[]) => {
    setMessages(msgs);
    try {
      window.sessionStorage.setItem(CHAT_KEY, JSON.stringify(msgs));
    } catch {
      /* ignore */
    }
  };

  const send = useCallback(
    async (raw?: string) => {
      const question = (raw ?? input).trim();
      if (!question || busy) return;
      setInput("");
      const next: Msg[] = [...messages, { role: "user", content: question }];
      persist(next);
      setBusy(true);
      try {
        const res = (await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            lang,
            history: next.slice(-7, -1),
            context: {
              place: place
                ? `${place.district}, ${place.state}, India`
                : undefined,
            },
          }),
        }).then((r) => r.json())) as ApiResult<{ answer: string }>;
        if (res.ok && res.data) {
          persist([...next, { role: "assistant", content: res.data.answer }]);
        } else {
          persist([...next, { role: "assistant", content: t("ask.error") }]);
        }
      } catch {
        persist([...next, { role: "assistant", content: t("ask.error") }]);
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, busy, messages, lang, place, t],
  );

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.lang = STT_LANG[lang] ?? "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText = text;
      }
      setInput(text);
    };
    rec.onend = () => {
      setListening(false);
      if (finalText.trim()) void send(finalText);
    };
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const speak = (idx: number, text: string) => {
    if (!("speechSynthesis" in window)) return;
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.startsWith(lang));
    if (voice) utterance.voice = voice;
    utterance.lang = STT_LANG[lang] ?? "en-IN";
    utterance.onend = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const gated = !authLoading && (!user || premium === false);

  return (
    <div className="flex min-h-[70vh] flex-col space-y-4">
      <PageHeading
        title={t("ask.title")}
        subtitle={t("ask.subtitle")}
        icon={<MessageCircleQuestion className="size-6" />}
      />

      {gated ? (
        <div className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-card p-5 text-sm shadow-sm">
          <p className="text-foreground/90">{t("ask.intro")}</p>
          <p className="font-medium">{t("ask.premiumOnly")}</p>
          <Link
            href={user ? "/premium" : "/login?next=/ask"}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 font-semibold text-primary-foreground"
          >
            {user ? <Crown className="size-4" /> : <LogIn className="size-4" />}
            {user ? t("scan.goPremium") : t("auth.signIn")}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3">
            {messages.length === 0 ? (
              <p className="rounded-[var(--radius-lg)] border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                {t("ask.intro")}
                {sttSupported ? ` ${t("ask.tapMic")}` : ""}
              </p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-8 rounded-[var(--radius-lg)] rounded-br-sm bg-primary/12 p-3 text-sm"
                      : "mr-8 rounded-[var(--radius-lg)] rounded-bl-sm border border-border bg-card p-3 text-sm shadow-sm"
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </p>
                  {m.role === "assistant" && hasVoice ? (
                    <button
                      type="button"
                      onClick={() => speak(i, m.content)}
                      className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {speakingIdx === i ? (
                        <Square className="size-3" />
                      ) : (
                        <Volume2 className="size-3.5" />
                      )}
                      {speakingIdx === i ? t("ask.stop") : t("ask.speak")}
                    </button>
                  ) : null}
                </div>
              ))
            )}
            {busy ? (
              <div className="mr-8 flex items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-3 text-sm text-muted-foreground">
                <Spinner />
                {t("common.loading")}
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div className="sticky bottom-0 flex items-center gap-2 bg-background/95 py-2 backdrop-blur">
            <button
              type="button"
              onClick={toggleMic}
              disabled={!sttSupported}
              title={sttSupported ? t("ask.tapMic") : t("ask.micUnsupported")}
              aria-label={t("ask.tapMic")}
              className={`grid size-12 shrink-0 place-items-center rounded-full shadow-sm transition ${
                listening
                  ? "animate-pulse bg-danger text-danger-foreground"
                  : sttSupported
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {sttSupported ? (
                <Mic className="size-5" />
              ) : (
                <MicOff className="size-5" />
              )}
            </button>
            <input
              value={listening ? input || t("ask.listening") : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
              placeholder={t("ask.placeholder")}
              className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-3 text-sm"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={busy || !input.trim()}
              aria-label={t("ask.send")}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm disabled:opacity-50"
            >
              <SendHorizontal className="size-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
