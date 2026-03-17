import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// On initialise Gemini avec la clé secrète
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { task, category } = await req.json();

    // On utilise le modèle rapide et puissant de Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    // Le "System Prompt" qui donne les instructions à l'IA
    const systemPrompt = `Tu es un Expert Développeur Senior. Transforme cette idée brute en un prompt parfait et ultra-structuré pour un développeur.
    
    Catégorie demandée : ${category}
    Tâche brute : ${task}
    
    Format de sortie strict (Ne dis pas bonjour, renvoie uniquement ceci) :
    **Role :** [Définis un rôle d'expert pointu]
    **Context :** [Reformule le contexte professionnel]
    **Task :** [Détaille la tâche de façon technique et précise]
    **Constraints :** [Ajoute 3 ou 4 contraintes de pro : clean code, sécurité, optimisation, etc.]
    **Output Format :** [Format de réponse attendu par l'IA cible]`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    return NextResponse.json({ prompt: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}