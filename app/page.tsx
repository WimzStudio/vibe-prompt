"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wand2, Copy, Check, TerminalSquare, Loader2 } from "lucide-react";

const CATEGORIES = ["Refactoring", "Debugging", "New Feature", "Architecture"];

export default function VibePrompt() {
  const [task, setTask] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [prompt, setPrompt] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("vibe_recents");
    if (saved) setRecents(JSON.parse(saved));
  }, []);

  const generateVibe = async () => {
    if (!task) return;
    setIsLoading(true);
    setPrompt(""); // On vide l'ancien prompt

    try {
      // On appelle notre route Backend sécurisée
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, category }),
      });
      
      const data = await res.json();

      if (data.prompt) {
        setPrompt(data.prompt);
        const newRecents = [data.prompt, ...recents.filter(r => r !== data.prompt)].slice(0, 5);
        setRecents(newRecents);
        localStorage.setItem("vibe_recents", JSON.stringify(newRecents));
      } else {
        setPrompt("Erreur lors de la génération du prompt.");
      }
    } catch (error) {
      setPrompt("Impossible de se connecter à l'IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-purple-500/30 p-6 flex flex-col items-center justify-center">
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2 flex items-center justify-center gap-3">
          <TerminalSquare className="w-10 h-10 text-purple-500" /> VibePrompt
        </h1>
        <p className="text-slate-400">Le générateur de prompts ultra-optimisés pour les devs.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-purple-900/10">
        
        <div className="space-y-4 mb-6">
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Décrivez votre tâche de code (ex: Créer un hook useDebounce en TypeScript)..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none h-32"
          />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-blue-500/50 appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>
              ))}
            </select>

            <button
              onClick={generateVibe}
              disabled={isLoading || !task}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium px-6 py-2.5 rounded-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isLoading ? "Génération..." : "Generate Vibe Prompt"}
            </button>
          </div>
        </div>

        {prompt && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="relative bg-black/60 border border-purple-500/30 rounded-xl p-5 mt-6 group">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{prompt}</pre>
            <button
              onClick={() => copyToClipboard(prompt)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-md backdrop-blur-sm transition-all text-slate-300 hover:text-white"
            >
              {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </motion.div>
        )}
      </motion.div>

      {recents.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl mt-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Vibes</h3>
          <div className="flex flex-col gap-2">
            {recents.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-white/10 transition-colors cursor-pointer group" onClick={() => copyToClipboard(r)}>
                <p className="text-xs text-slate-400 truncate max-w-[85%] font-mono">{r}</p>
                <Copy className="w-3 h-3 text-slate-600 group-hover:text-purple-400 transition-colors" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}