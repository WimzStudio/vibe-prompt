"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Copy, Check, TerminalSquare, Loader2, } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
    setPrompt(""); 

    try {
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
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-purple-500/30 p-6 flex flex-col items-center">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 mt-10">
        <h1 className="text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2 flex items-center justify-center gap-3">
          <TerminalSquare className="w-10 h-10 text-purple-500" /> VibePrompt
        </h1>
        <p className="text-slate-400">Le générateur de prompts ultra-optimisés pour les devs.</p>
      </motion.div>

      {/* Main Card */}
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
              className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
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

        {/* Display Prompt with Markdown */}
        <AnimatePresence>
          {prompt && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="relative bg-black/60 border border-purple-500/30 rounded-xl p-6 mt-6 group"
            >
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300">
                <ReactMarkdown
                  components={{
                    strong: ({ ...props }) => <span className="font-bold text-purple-400" {...props} />,
                    ul: ({ ...props }) => <ul className="my-4 ml-6 list-disc space-y-2" {...props} />,
                    li: ({ ...props }) => <li className="text-slate-300" {...props} />,
                    h3: ({ ...props }) => <h3 className="mb-2 mt-6 text-lg font-bold text-white border-b border-white/10 pb-1" {...props} />,
                    p: ({ ...props }) => <p className="mb-4" {...props} />,
                    code: ({ ...props }) => <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-blue-400 border border-white/5" {...props} />
                  }}
                >
                  {prompt}
                </ReactMarkdown>
              </div>

              <button
                onClick={() => copyToClipboard(prompt)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-md backdrop-blur-sm transition-all text-slate-300 hover:text-white border border-white/10 shadow-lg"
                title="Copier le prompt"
              >
                {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recent History */}
      {recents.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl mt-12 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></span>
              Recent Vibes
            </h3>
            <button 
              onClick={() => {setRecents([]); localStorage.removeItem("vibe_recents");}}
              className="text-[10px] text-slate-600 hover:text-red-400 transition-colors uppercase tracking-widest"
            >
              Clear History
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {recents.slice(0, 3).map((r, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-purple-500/20 hover:bg-white/10 transition-all cursor-pointer group" 
                onClick={() => copyToClipboard(r)}
              >
                <p className="text-xs text-slate-400 truncate max-w-[85%] font-mono">
                  {r.replace(/[#*`]/g, '').slice(0, 100)}...
                </p>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-slate-600 group-hover:opacity-0 transition-opacity uppercase font-bold">Copy</span>
                   <Copy className="w-3 h-3 text-slate-600 group-hover:text-purple-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}