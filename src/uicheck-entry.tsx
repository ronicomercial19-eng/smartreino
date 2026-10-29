import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { TreinoDoDiaView } from "./components/workout/TreinoDoDiaView";

const unmatched = { sucesso: false, motivo: "unmatched_prescription_requires_review" } as any;
const noPeriod = { sucesso: false, motivo: "sem_periodizacao_ativa" } as any;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-background p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="font-display text-xl font-bold">A) professor · unmatched</h1>
      <TreinoDoDiaView treino={unmatched} />
      <h1 className="font-display text-xl font-bold">B) aluno · unmatched</h1>
      <TreinoDoDiaView viewer="aluno" treino={unmatched} />
      <h1 className="font-display text-xl font-bold">C) professor · sem_periodizacao (regressão)</h1>
      <TreinoDoDiaView treino={noPeriod} />
    </div>
  </React.StrictMode>
);
