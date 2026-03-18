"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Copy, Check, TerminalSquare, Loader2, Trash2, LogOut } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Refactoring", "Debugging", "New Feature", "Architecture"];

export default function VibePrompt() {
  const [task, setTask] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [prompt, setPrompt] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recents, setRecents] = useState<any[]>([]); // Changé pour stocker des objets de la DB
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // 1. Vérifier la session et charger les prompts au démarrage
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchPrompts(user.id);
      } else {
        router.push("/auth"); // Rediriger si non connecté
      }
    };
    checkUser();
  }, [router]);

  // 2. Récupérer les prompts depuis Supabase
  const fetchPrompts = async (userId: string) => {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) setRecents(data);
  };

  const generateVibe = async () => {
    if (!task || !user) return;
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
        // SAUVEGARDE DANS SUPABASE
        const { error } = await supabase.from("prompts").insert([
          { 
            user_id: user.id, 
            task, 
            category, 
            generated_prompt: data.prompt 
          }
        ]);
        
        if (!error) fetchPrompts(user.id); // Rafraîchir l'historique
      }
    } catch (error) {
      setPrompt("Erreur réseau...");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Supprimer un prompt
  const deletePrompt = async (id: string) => {
    const { error } = await supabase.from("prompts").delete().eq("id", id);
    if (!error) {
      setRecents(recents.filter(r => r.id !== id));
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-6 flex flex-col items-center">
      
      {/* Navbar / User Info */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-10">
        <div className="flex items-center gap-2">
          <TerminalSquare className="w-6 h-6 text-purple-500" />
          <span className="font-bold tracking-tight">VibePrompt <span className="text-purple-500">Pro</span></span>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">{user.email}</span>
            <button onClick={logout} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-red-400 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="space-y-4 mb-6">
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Décrivez votre tâche..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-slate-100 resize-none h-32 focus:outline-none focus:border-purple-500/50"
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-slate-300"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>
              ))}
            </select>
            <button
              onClick={generateVibe}
              disabled={isLoading || !task}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Générer
            </button>
          </div>
        </div>

        <AnimatePresence>
          {prompt && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative bg-black/60 border border-purple-500/30 rounded-xl p-6 mt-6">
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300">
                <ReactMarkdown components={{
                  strong: ({ ...props }) => <span className="font-bold text-purple-400" {...props} />,
                  code: ({ ...props }) => <code className="rounded bg-slate-800 px-1.5 py-0.5 text-blue-400" {...props} />
                }}>
                  {prompt}
                </ReactMarkdown>
              </div>
              <button onClick={() => copyToClipboard(prompt)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-md">
                {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Historique Privé */}
      {recents.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mt-12 pb-10">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Ton Historique Privé</h3>
          <div className="flex flex-col gap-3">
            {recents.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl group hover:border-purple-500/30 transition-all">
                <div className="cursor-pointer flex-1" onClick={() => {setPrompt(r.generated_prompt); setTask(r.task);}}>
                  <p className="text-xs text-purple-400 font-bold mb-1">{r.category}</p>
                  <p className="text-xs text-slate-400 truncate max-w-md font-mono">{r.task}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyToClipboard(r.generated_prompt)} className="p-2 hover:text-purple-400 text-slate-600"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => deletePrompt(r.id)} className="p-2 hover:text-red-400 text-slate-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}