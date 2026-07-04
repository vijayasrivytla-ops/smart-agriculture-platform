import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Volume2, VolumeX, Trash2, ArrowRight, Languages, HelpCircle } from "lucide-react";
import { FarmerProfile } from "../types";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  locale: string;
  welcome: string;
  placeholder: string;
  faqTitle: string;
  faqs: string[];
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "English",
    name: "English",
    flag: "🇺🇸",
    locale: "en-US",
    welcome: "Hello! I am KisanAI, your multilingual smart agricultural assistant. How can I help you today?",
    placeholder: "Ask about crops, pests, soil, weather, yields...",
    faqTitle: "Common Questions",
    faqs: [
      "How to get rid of aphids organically?",
      "What is the best soil pH for basmati rice?",
      "How can I prevent wheat leaf rust disease?",
      "What are high-yield companion crops for maize?"
    ]
  },
  {
    code: "Hindi",
    name: "हिन्दी (Hindi)",
    flag: "🇮🇳",
    locale: "hi-IN",
    welcome: "नमस्ते! मैं किसान एआई हूं, आपका बहुभाषी स्मार्ट कृषि सहायक। आज मैं आपकी क्या मदद कर सकता हूँ?",
    placeholder: "फसलों, कीटों, मिट्टी, मौसम, उपज के बारे में पूछें...",
    faqTitle: "सामान्य प्रश्न",
    faqs: [
      "प्राकृतिक तरीके से एफिड्स (कीटों) से कैसे छुटकारा पाएं?",
      "बासमती चावल के लिए सबसे अच्छी मिट्टी का पीएच (pH) क्या है?",
      "गेहूं के पत्तों के गेरूआ रोग (रस्ट) से कैसे बचाव करें?",
      "मक्के के साथ उगाई जाने वाली उच्च उपज वाली फसलें कौन सी हैं?"
    ]
  },
  {
    code: "Spanish",
    name: "Español (Spanish)",
    flag: "🇪🇸",
    locale: "es-ES",
    welcome: "¡Hola! Soy KisanAI, su asistente agrícola inteligente multilingüe. ¿Cómo puedo ayudarle hoy?",
    placeholder: "Pregunte sobre cultivos, plagas, suelos, clima...",
    faqTitle: "Preguntas Frecuentes",
    faqs: [
      "¿Cómo eliminar los pulgones de forma orgánica?",
      "¿Cuál es el mejor pH del suelo para las patatas?",
      "¿Cómo prevenir el mildiu en el tomate?",
      "¿Qué cultivos asociados aumentan el rendimiento del maíz?"
    ]
  },
  {
    code: "French",
    name: "Français (French)",
    flag: "🇫🇷",
    locale: "fr-FR",
    welcome: "Bonjour ! Je suis KisanAI, votre assistant agricole intelligent multilingue. Comment puis-je vous aider aujourd'hui ?",
    placeholder: "Posez des questions sur les cultures, ravageurs, sols...",
    faqTitle: "Questions Fréquentes",
    faqs: [
      "Comment éliminer les pucerons de façon biologique ?",
      "Quel est le pH idéal du sol pour les pommes de terre ?",
      "Comment prévenir la rouille du blé ?",
      "Quelles sont les meilleures cultures associées pour le maïs ?"
    ]
  },
  {
    code: "Punjabi",
    name: "ਪੰਜਾਬੀ (Punjabi)",
    flag: "🇮🇳",
    locale: "pa-IN",
    welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਸਾਨ ਏਆਈ ਹਾਂ, ਤੁਹਾਡਾ ਬਹੁ-ਭਾਸ਼ਾਈ ਸਮਾਰਟ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    placeholder: "ਫ਼ਸਲਾਂ, ਕੀੜੇ-ਮਕੌੜੇ, ਮਿੱਟੀ, ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ...",
    faqTitle: "ਆਮ ਸਵਾਲ",
    faqs: [
      "ਕੁਦਰਤੀ ਤਰੀਕੇ ਨਾਲ ਤੇਲੇ ਤੋਂ ਕਿਵੇਂ ਛੁਟਕਾਰਾ ਪਾਇਆ ਜਾਵੇ?",
      "ਬਾਸਮਤੀ ਝੋਨੇ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਮਿੱਟੀ ਦਾ pH ਕੀ ਹੈ?",
      "ਕਣਕ ਦੀ ਕੰਗਿਆਰੀ (ਰਸਟ) ਦੀ ਬਿਮਾਰੀ ਤੋਂ ਬਚਾਅ ਕਿਵੇਂ ਕਰੀਏ?",
      "ਮੱਕੀ ਦੇ ਨਾਲ ਵਧੇਰੇ ਝਾੜ ਦੇਣ ਵਾਲੀਆਂ ਸਹਾਇਕ ਫ਼ਸਲਾਂ ਕਿਹੜੀਆਂ ਹਨ?"
    ]
  },
  {
    code: "Telugu",
    name: "తెలుగు (Telugu)",
    flag: "🇮🇳",
    locale: "te-IN",
    welcome: "నమస్కారం! నేను కిసాన్ ఏఐ, మీ బహుభాషా స్మార్ట్ వ్యవసాయ సహాయకుడిని. ఈ రోజు మీకు ఎలా సహాయపడగలను?",
    placeholder: "పంటలు, తెగుళ్లు, నేల, వాతావరణం గురించి అడగండి...",
    faqTitle: "సాధారణ ప్రశ్నలు",
    faqs: [
      "సేంద్రీయ పద్ధతిలో పేనుబంకను ఎలా నివారించాలి?",
      "వరి పంటకు అనుకూలమైన నేల pH ఎంత ఉండాలి?",
      "గోధుమ తుప్పు తెగులు నివారణ చర్యలు ఏమిటి?",
      "మొక్కజొన్నతో పాటు వేయగల లాభదాయక అంతర పంటలు ఏవి?"
    ]
  },
  {
    code: "Swahili",
    name: "Kiswahili (Swahili)",
    flag: "🇰🇪",
    locale: "sw-KE",
    welcome: "Habari! Mimi ni KisanAI, msaidizi wako wa kilimo bora wa lugha nyingi. Naweza kukusaidia vipi leo?",
    placeholder: "Uliza kuhusu mazao, wadudu, udongo, hali ya hewa...",
    faqTitle: "Maswali ya Kawaida",
    faqs: [
      "Jinsi ya kuondoa chawa wa mimea (aphids) kiasili?",
      "Ni kiwango gani cha pH cha udongo kinachofaa kwa viazi?",
      "Jinsi ya kuzuia ugonjwa wa ukungu kwenye mahindi?",
      "Ni mazao gani ya mseto yanayoongeza mavuno ya mtama?"
    ]
  },
  {
    code: "Portuguese",
    name: "Português (Portuguese)",
    flag: "🇵🇹",
    locale: "pt-PT",
    welcome: "Olá! Sou o KisanAI, o seu assistente agrícola inteligente multilíngue. Como posso ajudar você hoje?",
    placeholder: "Pergunte sobre plantio, pragas, solo, clima...",
    faqTitle: "Perguntas Comuns",
    faqs: [
      "Como combater pulgões de forma 100% orgânica?",
      "Qual é o pH de solo ideal para o cultivo de soja?",
      "Como tratar a ferrugem asiática na soja?",
      "Quais consórcios de culturas aumentam a produtividade do milho?"
    ]
  }
];

interface MultilingualAssistantProps {
  profile: FarmerProfile;
}

export default function MultilingualAssistant({ profile }: MultilingualAssistantProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when language changes OR on startup
  useEffect(() => {
    // If messages are empty, load the default welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: selectedLang.welcome,
          timestamp: new Date()
        }
      ]);
    }
  }, [selectedLang]);

  // Load chat session from sessionStorage
  useEffect(() => {
    const savedChat = sessionStorage.getItem("kisan_ai_chat");
    const savedLangCode = sessionStorage.getItem("kisan_ai_lang");
    
    if (savedLangCode) {
      const found = LANGUAGES.find((l) => l.code === savedLangCode);
      if (found) setSelectedLang(found);
    }

    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Error reading cached chatbot state:", e);
      }
    }
  }, []);

  // Sync to session storage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("kisan_ai_chat", JSON.stringify(messages));
    }
    sessionStorage.setItem("kisan_ai_lang", selectedLang.code);
  }, [messages, selectedLang]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen, isTyping]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const lang = LANGUAGES.find((l) => l.code === code);
    if (lang) {
      // Stop speech if speaking
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      setSelectedLang(lang);
      
      // Add translation helper welcome node
      const welcomeNode: Message = {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: lang.welcome,
        timestamp: new Date()
      };
      setMessages([welcomeNode]);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    // Stop TTS speaking
    window.speechSynthesis.cancel();
    setSpeakingMsgId(null);

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Structure chat context
      const chatHistory = messages
        .filter((m) => m.id !== "welcome") // ignore static welcome in raw context
        .slice(-6)
        .map((m) => ({
          sender: m.sender,
          text: m.text
        }));

      // Call server proxy
      const response = await fetch("/api/farmer-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: chatHistory,
          language: selectedLang.code
        })
      });

      if (!response.ok) {
        throw new Error("Agromission servers busy");
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text || "Sorry, I could not compile an agronomical response.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Multilingual bot error:", err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: "bot",
        text: `⚠️ [Connection Error] I experienced an issue reaching the AI service. Please make sure your server is running and your Gemini API key is configured.`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Speaks out the AI response
  const handleSpeak = (text: string, msgId: string) => {
    if ("speechSynthesis" in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }

      window.speechSynthesis.cancel(); // cancel any active speech
      
      // Strip markdown tags for better voice quality
      const cleanText = text
        .replace(/\*\*|__|\*|-|#/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = selectedLang.locale;
      
      utterance.onend = () => {
        setSpeakingMsgId(null);
      };

      utterance.onerror = () => {
        setSpeakingMsgId(null);
      };

      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your current browser session.");
    }
  };

  const handleClearHistory = () => {
    if (confirm("Reset assistant chat history?")) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      const welcomeNode: Message = {
        id: "welcome",
        sender: "bot",
        text: selectedLang.welcome,
        timestamp: new Date()
      };
      setMessages([welcomeNode]);
      sessionStorage.removeItem("kisan_ai_chat");
    }
  };

  // Safe markdown line renderer
  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Check if line is bullet list
      const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
      // Check if line is a header (### or ##)
      const isHeader3 = line.trim().startsWith("### ");
      const isHeader2 = line.trim().startsWith("## ");
      
      let processedLine = line;
      if (isBullet) {
        processedLine = line.trim().substring(2);
      } else if (isHeader3) {
        processedLine = line.trim().substring(4);
      } else if (isHeader2) {
        processedLine = line.trim().substring(3);
      }

      // Format bold segments (**bold**)
      const parts = processedLine.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pidx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pidx} className="font-extrabold text-[#94C973]">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isHeader2) {
        return (
          <h4 key={idx} className="text-sm font-black text-[#94C973] mt-2.5 mb-1.5 border-b border-white/5 pb-0.5">
            {formattedParts}
          </h4>
        );
      }

      if (isHeader3) {
        return (
          <h5 key={idx} className="text-xs font-extrabold text-[#94C973] mt-2 mb-1">
            {formattedParts}
          </h5>
        );
      }

      if (isBullet) {
        return (
          <div key={idx} className="flex gap-2 text-xs leading-relaxed pl-2.5 py-0.5">
            <span className="text-[#94C973] font-bold">●</span>
            <span>{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs leading-relaxed mb-1.5 last:mb-0">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans" id="multilingual-chatbot-widget">
      {/* Floating chatbot window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-80 sm:w-96 h-[500px] bg-[#122E23] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
            id="chatbot-expanded-window"
          >
            {/* Header */}
            <header className="px-4 py-3 bg-[#0A1F16]/95 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#94C973]/20 text-[#94C973] rounded-lg">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white leading-none">KisanAI Assistant</h3>
                  <span className="text-[9px] text-white/50 font-semibold uppercase tracking-wider">Multilingual AI Advisor</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearHistory}
                  title="Clear chat history"
                  className="p-1.5 text-white/40 hover:text-red-400 rounded-lg hover:bg-white/5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Quick Settings & Selection Panel */}
            <div className="px-4 py-2 bg-[#0A1F16]/40 border-b border-white/5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] text-white/60">
                <Languages className="w-3.5 h-3.5 text-[#94C973]" />
                <span>Advisor Language:</span>
              </div>
              <select
                value={selectedLang.code}
                onChange={handleLanguageChange}
                className="text-[11px] bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white font-extrabold focus:outline-none focus:border-[#94C973] cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar" id="chat-messages-container">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? "items-start" : "items-end"} space-y-1`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs shadow-xs ${
                        isBot
                          ? "bg-black/35 text-white border border-white/5 rounded-tl-xs"
                          : "bg-[#94C973] text-[#0A1F16] font-medium rounded-tr-xs"
                      }`}
                    >
                      {isBot ? renderMessageContent(msg.text) : msg.text}
                    </div>

                    {/* Metadata & Actions row (for bot messages only) */}
                    {isBot && msg.id !== "welcome" && (
                      <div className="flex items-center gap-2 pl-1">
                        <span className="text-[9px] text-white/30 font-semibold">
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          title="Speak out loud"
                          className={`p-1 rounded hover:bg-white/5 transition flex items-center gap-0.5 text-[9px] font-extrabold ${
                            speakingMsgId === msg.id ? "text-[#94C973]" : "text-white/40 hover:text-white"
                          }`}
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-[#94C973]" />
                              <span>Mute</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {!isBot && (
                      <span className="text-[9px] text-white/30 pr-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex flex-col items-start space-y-1">
                  <div className="bg-black/35 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#94C973] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-[#94C973] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-[#94C973] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Pills */}
            {messages.length === 1 && !isTyping && (
              <div className="px-4 py-2 border-t border-white/5 bg-black/10">
                <div className="flex items-center gap-1 text-[10px] text-white/40 font-bold mb-1.5">
                  <HelpCircle className="w-3 h-3 text-[#94C973]" />
                  <span>{selectedLang.faqTitle}:</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {selectedLang.faqs.map((faq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(faq)}
                      className="text-left text-[11px] font-semibold text-white/75 hover:text-[#94C973] hover:bg-[#94C973]/10 px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-[#94C973]/20 transition cursor-pointer flex items-center justify-between group"
                    >
                      <span className="line-clamp-1">{faq}</span>
                      <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-[#94C973] shrink-0 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 bg-[#0A1F16] border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={selectedLang.placeholder}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#94C973]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-[#94C973] text-[#0A1F16] disabled:opacity-50 hover:bg-[#a8db87] rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-[#94C973] text-[#0A1F16] rounded-full shadow-lg flex items-center justify-center cursor-pointer transition relative group"
        id="chatbot-floating-trigger"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0A1F16] animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0A1F16] flex items-center justify-center text-[8px] text-white font-extrabold">
          AI
        </span>
        
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <Sparkles className="w-3.5 h-3.5 text-[#0A1F16] absolute -top-1 -right-2 animate-bounce" />
          </div>
        )}

        {/* Floating tooltip */}
        {!isOpen && (
          <span className="absolute right-16 bg-[#0A1F16] text-white text-[10px] font-black tracking-wide px-2.5 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap shadow-md">
            💬 AI Multilingual Assistant
          </span>
        )}
      </motion.button>
    </div>
  );
}
