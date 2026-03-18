"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TerminalSquare, Loader2 } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleAuth = async (type: "login" | "signup") => {
    setLoading(true);
    setMessage("");
    
    const { error } = type === "login" 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      if (type === "signup") {
        setMessage("Vérifie tes emails pour confirmer ton inscription !");
      } else {
        router.push("/"); // On redirige vers l'accueil
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <TerminalSquare className="w-8 h-8 text-purple-500" />
          <h1 className="text-2xl font-bold tracking-tighter">VibePrompt Auth</h1>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500/50"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500/50"
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => handleAuth("login")}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-500 p-3 rounded-xl font-medium transition-all flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connexion"}
            </button>
            <button
              onClick={() => handleAuth("signup")}
              disabled={loading}
              className="flex-1 border border-white/10 hover:bg-white/5 p-3 rounded-xl font-medium transition-all"
            >
              S'inscrire
            </button>
          </div>
        </div>

        {message && <p className="mt-4 text-center text-sm text-purple-400">{message}</p>}
      </motion.div>
    </div>
  );
}