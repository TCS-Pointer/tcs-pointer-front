import React, { useState } from "react";

function renderStars(value) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= value ? "text-blue-500 fill-blue-500" : "text-gray-300"}`}
          fill={i <= value ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 20 20"
        >
          <polygon
            strokeWidth="1"
            points="10,2 12.59,7.36 18.51,7.97 14,12.14 15.18,18.02 10,15.1 4.82,18.02 6,12.14 1.49,7.97 7.41,7.36"
          />
        </svg>
      ))}
    </span>
  );
}

function getInitials(nome) {
  if (!nome) return "?";
  return nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default function FeedbackCard({
  feedback,
  showDestinatario = true,
}) {
  const [expanded, setExpanded] = useState(false);

  // Remetente (autor)
  const autor = feedback.remetenteDTO
    ? {
        nome: feedback.remetenteDTO.nome,
        cargo: feedback.remetenteDTO.cargo,
        iniciais: getInitials(feedback.remetenteDTO.nome),
      }
    : null;

  // Destinatário
  const destinatario = feedback.destinatarioDTO
    ? {
        nome: feedback.destinatarioDTO.nome,
        cargo: feedback.destinatarioDTO.cargo,
        iniciais: getInitials(feedback.destinatarioDTO.nome),
      }
    : null;

  // Função para truncar texto manualmente
  function truncate(text, max = 50) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "..." : text;
  }

  // Verifica se algum campo está grande para mostrar o botão
  const isTruncating =
    (feedback.assunto && feedback.assunto.length > 90) ||
    (autor?.nome && autor.nome.length > 300) ||
    (destinatario?.nome && destinatario.nome.length > 300) ||
    (feedback.pontosFortes && feedback.pontosFortes.length > 80) ||
    (feedback.pontosMelhoria && feedback.pontosMelhoria.length > 80) ||
    (feedback.acoesRecomendadas && feedback.acoesRecomendadas.length > 80);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col shadow-sm w-full h-full relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            feedback.tipoFeedback === "POSITIVO"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {feedback.tipoFeedback === "POSITIVO" ? "Feedback Positivo" : "Feedback Construtivo"}
        </span>
        <span className="text-xs text-gray-400">{feedback.dtEnvio}</span>
      </div>
      {/* Assunto */}
      <h3
        className="text-lg font-bold text-gray-900 mb-2"
        title={feedback.assunto}
      >
        {expanded ? feedback.assunto : truncate(feedback.assunto, 40)}
      </h3>
      {/* Autor e Destinatário */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
            {autor?.iniciais || (feedback.anonimo ? "?" : "?")}
          </div>
          <span className="text-sm font-medium">
            De: {autor?.nome || (feedback.anonimo ? "Anônimo" : "Desconhecido")}
            {autor?.cargo && <> • {autor.cargo}</>}
          </span>
        </div>
        {showDestinatario && destinatario && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
              {destinatario.iniciais}
            </div>
            <span className="text-sm font-medium">
              Para: {destinatario.nome}
              {destinatario.cargo && <> • {destinatario.cargo}</>}
            </span>
          </div>
        )}
      </div>
      {/* Pontos Fortes */}
      {feedback.pontosFortes && (
        <div className="mb-2">
          <h4 className="text-sm font-bold mb-1">Pontos Fortes</h4>
          <p
            className={`text-sm text-gray-700 break-words whitespace-pre-line ${!expanded ? "line-clamp-2" : ""}`}
            title={feedback.pontosFortes}
          >
            {expanded ? feedback.pontosFortes : truncate(feedback.pontosFortes, 80)}
          </p>
        </div>
      )}
      {/* Pontos de Melhoria */}
      {feedback.pontosMelhoria && (
        <div className="mb-2">
          <h4 className="text-sm font-bold mb-1">Pontos de Melhoria</h4>
          <p
            className={`text-sm text-gray-700 break-words whitespace-pre-line ${!expanded ? "line-clamp-2" : ""}`}
            title={feedback.pontosMelhoria}
          >
            {expanded ? feedback.pontosMelhoria : truncate(feedback.pontosMelhoria, 80)}
          </p>
        </div>
      )}
      {/* Ações Recomendadas */}
      {feedback.acoesRecomendadas && (
        <div className="mb-2">
          <h4 className="text-sm font-bold mb-1">Ações Recomendadas</h4>
          <p
            className={`text-sm text-gray-700 break-words whitespace-pre-line ${!expanded ? "line-clamp-2" : ""}`}
            title={feedback.acoesRecomendadas}
          >
            {expanded ? feedback.acoesRecomendadas : truncate(feedback.acoesRecomendadas, 80)}
          </p>
        </div>
      )}
      {/* Avaliação por Competências */}
      <div className="border-t pt-4 mt-2">
        <h4 className="text-sm font-bold mb-2">Avaliação por Competências</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Comunicação</span>
            {renderStars(feedback.avComunicacao || 0)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Produtividade</span>
            {renderStars(feedback.avProdutividade || 0)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Trabalho em Equipe</span>
            {renderStars(feedback.trabalhoEmEquipe || 0)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Resolução de Problemas</span>
            {renderStars(feedback.resolucaoDeProblemas || 0)}
          </div>
        </div>
      </div>
      {/* Botão Ver mais/Ver menos */}
      {isTruncating && (
        <div className="flex justify-center w-full mt-6">
          <button
            className="text-base text-blue-600 font-bold bg-white border border-blue-200 px-8 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition"
            style={{ minWidth: 160 }}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Ver menos" : "Ver mais"}
          </button>
        </div>
      )}
    </div>
  );
} 