export function useSpeechRecognition(opts: { onResult: (t: string) => void; onEnd?: () => void }) {
  const supported = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  let recognition: any = null;
  if (supported && typeof window !== "undefined") {
    const Ctor: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      opts.onResult(transcript);
    };
    recognition.onend = () => {
      opts.onEnd?.();
    };
  }

  return {
    supported,
    start: () => recognition?.start?.(),
    stop: () => recognition?.stop?.(),
  } as const;
}

export async function speakText(text: string) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => resolve();
    speechSynthesis.speak(utterance);
  });
}
