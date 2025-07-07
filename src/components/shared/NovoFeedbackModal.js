import React, { useState, useRef, useEffect } from "react";
import useUsuariosFeedback from "../../hooks/useUsuariosFeedback";
import { useAuth } from "../../contexts/AuthContext";
import FeedbackService from "../../services/FeedbackService";
import { userService } from "../../services/userService";
import { toast } from "react-toastify";

const competencias = [
  {
    key: "avComunicacao",
    label: "Comunicação",
    descricao: "Capacidade de se expressar de forma clara e eficaz, tanto verbalmente quanto por escrito."
  },
  {
    key: "avProdutividade",
    label: "Produtividade",
    descricao: "Eficiência na execução de tarefas, cumprimento de prazos e qualidade das entregas."
  },
  {
    key: "trabalhoEmEquipe",
    label: "Trabalho em Equipe",
    descricao: "Capacidade de colaborar, compartilhar conhecimento e contribuir para o sucesso da equipe."
  },
  {
    key: "resolucaoDeProblemas",
    label: "Resolução de Problemas",
    descricao: "Habilidade para identificar, analisar e resolver problemas de forma eficaz."
  }
];

function StarRating({ value, onChange }) {
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          onClick={() => onChange(i)}
          className={`w-6 h-6 cursor-pointer ${i <= value ? "text-blue-500 fill-blue-500" : "text-gray-300"}`}
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

// Função utilitária para truncar nome
function truncateNome(nome, max = 24) {
  if (!nome) return '';
  return nome.length > max ? nome.slice(0, max - 1) + '…' : nome;
}

// Função utilitária para truncar e-mail
function truncateEmail(email, max = 28) {
  if (!email) return '';
  return email.length > max ? email.slice(0, max - 1) + '…' : email;
}

export default function NovoFeedbackModal({ open, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    tipoFeedback: "POSITIVO",
    assunto: "",
    pontosFortes: "",
    pontosMelhoria: "",
    acoesRecomendadas: "",
    anonimo: false,
    avComunicacao: 0,
    avProdutividade: 0,
    trabalhoEmEquipe: 0,
    resolucaoDeProblemas: 0
  });
  const [touched, setTouched] = useState({});
  const [selectedDestinatario, setSelectedDestinatario] = useState("");

  // Hook de usuários paginados
  const { usuarios, loading: loadingUsuarios, error: errorUsuarios, fetchMore, hasMore } = useUsuariosFeedback();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const listRef = useRef();

  const { user } = useAuth();
  const [idUsuarioRemetente, setIdUsuarioRemetente] = useState(null);
  const [sending, setSending] = useState(false);

  // Buscar id interno do usuário logado ao abrir modal
  useEffect(() => {
    async function fetchId() {
      if (user?.sub) {
        try {
          const res = await userService.getUserByKeycloakId(user.sub);
          setIdUsuarioRemetente(res.id);
        } catch (e) {
          setIdUsuarioRemetente(null);
        }
      }
    }
    if (open) fetchId();
  }, [open, user?.sub]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Scroll infinito no dropdown
  const handleListScroll = (e) => {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && hasMore && !loadingUsuarios) {
      fetchMore();
    }
  };

  // Selecionar usuário
  const handleSelectUser = (id) => {
    setSelectedDestinatario(id);
    setTouched((prev) => ({ ...prev, destinatario: true }));
    setDropdownOpen(false);
  };

  // Usuário selecionado
  const selectedUser = usuarios.find((u) => String(u.id) === String(selectedDestinatario));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleStarChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isStep1Valid =
    selectedDestinatario &&
    form.tipoFeedback &&
    form.assunto.trim() &&
    form.pontosFortes.trim() &&
    form.pontosMelhoria.trim() &&
    form.acoesRecomendadas.trim();

  const isStep2Valid =
    form.avComunicacao > 0 &&
    form.avProdutividade > 0 &&
    form.trabalhoEmEquipe > 0 &&
    form.resolucaoDeProblemas > 0;

  const handleClose = () => {
    setStep(1);
    setForm({
      tipoFeedback: "POSITIVO",
      assunto: "",
      pontosFortes: "",
      pontosMelhoria: "",
      acoesRecomendadas: "",
      anonimo: false,
      avComunicacao: 0,
      avProdutividade: 0,
      trabalhoEmEquipe: 0,
      resolucaoDeProblemas: 0
    });
    setTouched({});
    setDropdownOpen(false);
    setSelectedDestinatario("");
    if (onClose) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStep2Valid || !selectedDestinatario) return;
    setSending(true);
    
    try {
      const payload = {
        ...form,
        idUsuarioDestinatario: Number(selectedDestinatario),
        keycloakIdRemetente: user?.sub,
      };
      try {
        await FeedbackService.createFeedback(payload);
        toast.success("Feedback enviado com sucesso!");
        if (onSubmit) onSubmit(form);
        handleClose();
      } catch (err) {
        toast.error("Erro ao enviar feedback. Tente novamente.");
      }
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto p-0">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
          <h2 className="text-2xl font-bold">Novo Feedback</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 text-2xl">×</button>
        </div>
        <div className="px-6 pt-4">
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`flex-1 py-2 text-center font-medium text-base rounded-t transition border-b-2 ${step === 1 ? "border-blue-600 text-blue-700 bg-blue-50" : "border-transparent text-gray-400 bg-transparent"}`}
              onClick={() => setStep(1)}
              disabled
            >
              Informações
            </button>
            <button
              className={`flex-1 py-2 text-center font-medium text-base rounded-t transition border-b-2 ${step === 2 ? "border-blue-600 text-blue-700 bg-blue-50" : "border-transparent text-gray-400 bg-transparent"}`}
              onClick={() => isStep1Valid && setStep(2)}
              disabled={!isStep1Valid}
            >
              Avaliações
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="px-6 pb-2 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Destinatário <span className="text-red-500">*</span></label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      className={`w-full border rounded px-4 py-2 h-12 flex items-center justify-between bg-white ${!selectedUser ? "text-gray-400" : "text-gray-900"}`}
                      onClick={() => setDropdownOpen((v) => !v)}
                      tabIndex={0}
                      style={{ minHeight: 48 }}
                      title={selectedUser ? `${selectedUser.nome} - ${selectedUser.email}` : ''}
                    >
                      {selectedUser ? (
                        <span className="flex items-center gap-1 w-full">
                          <span className="max-w-[100px]">{truncateNome(selectedUser.nome)}</span>
                          <span className="text-gray-500 text-xs max-w-[130px] truncate overflow-ellipsis whitespace-nowrap block">- {truncateEmail(selectedUser.email)}</span>
                        </span>
                      ) : (
                        <span>Escolha um usuário...</span>
                      )}
                      <svg className="w-5 h-5 ml-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {dropdownOpen && (
                      <div
                        className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto animate-fade-in"
                        style={{ minWidth: 380, maxWidth: 520 }}
                        ref={listRef}
                        onScroll={handleListScroll}
                      >
                        {usuarios.length === 0 && !loadingUsuarios && (
                          <div className="p-4 text-gray-400 text-center">Nenhum usuário encontrado</div>
                        )}
                        {usuarios.map((u) => (
                          <button
                            type="button"
                            key={u.id}
                            className={`w-full text-left px-4 py-2 flex flex-col items-start justify-center gap-0.5 hover:bg-blue-50 focus:bg-blue-100 transition min-h-[48px] ${selectedDestinatario === u.id ? "bg-blue-100" : ""}`}
                            onClick={() => handleSelectUser(u.id)}
                            style={{height:48}}
                          >
                            <div
                              className="font-medium text-gray-900 flex flex-row items-center gap-2 w-full"
                              title={`${u.nome} - ${u.email}`}
                            >
                              <span className="max-w-[160px] truncate overflow-ellipsis whitespace-nowrap block">{truncateNome(u.nome)}</span>
                              <span className="text-gray-500 text-xs max-w-[160px] truncate overflow-ellipsis whitespace-nowrap block">- {truncateEmail(u.email)}</span>
                            </div>
                            <div
                              className="text-xs text-gray-500 w-full"
                              title={`${u.cargo || ''}${u.cargo && u.setor ? ' - ' : ''}${u.setor || ''}`}
                            >
                              <span className="max-w-[220px]">{u.cargo}</span>
                              {u.cargo && u.setor ? " - " : ""}
                              <span className="max-w-[180px]">{u.setor}</span>
                            </div>
                          </button>
                        ))}
                        {loadingUsuarios && (
                          <div className="flex items-center justify-center py-2">
                            <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin inline-block"></span>
                          </div>
                        )}
                        {!hasMore && usuarios.length > 0 && (
                          <div className="flex items-center justify-center py-2 text-xs text-gray-400">Fim da lista</div>
                        )}
                      </div>
                    )}
                  </div>
                  {errorUsuarios && (
                    <div className="text-xs text-red-500 mt-1">{errorUsuarios}</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <label className="block text-sm font-medium mb-1">Tipo de Feedback <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      name="tipoFeedback"
                      value={form.tipoFeedback}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2 h-12 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      required
                      style={{ minHeight: 48 }}
                    >
                      <option value="POSITIVO">Feedback Positivo</option>
                      <option value="CONSTRUTIVO">Feedback Construtivo</option>
                    </select>
                    <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assunto <span className="text-red-500">*</span></label>
                <input
                  name="assunto"
                  value={form.assunto}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ex: Desempenho no projeto X"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pontos Fortes <span className="text-red-500">*</span></label>
                <textarea
                  name="pontosFortes"
                  value={form.pontosFortes}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 min-h-[48px]"
                  placeholder="Descreva os pontos fortes observados..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pontos de Melhoria <span className="text-red-500">*</span></label>
                <textarea
                  name="pontosMelhoria"
                  value={form.pontosMelhoria}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 min-h-[48px]"
                  placeholder="Descreva os pontos que podem ser melhorados..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ações Recomendadas <span className="text-red-500">*</span></label>
                <textarea
                  name="acoesRecomendadas"
                  value={form.acoesRecomendadas}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 min-h-[48px]"
                  placeholder="Sugira ações para desenvolvimento..."
                  required
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="anonimo"
                  checked={form.anonimo}
                  onChange={handleChange}
                  id="anonimo"
                />
                <label htmlFor="anonimo" className="text-sm">Enviar feedback anonimamente</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  onClick={handleClose}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${!isStep1Valid ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => isStep1Valid && setStep(2)}
                  disabled={!isStep1Valid}
                >
                  Próximo: Avaliações
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="px-6 pb-2">
              <h3 className="text-lg font-bold mb-2">Avaliação por Competências</h3>
              <p className="text-sm text-gray-600 mb-6">Avalie o colaborador nas seguintes competências em uma escala de 1 a 5 estrelas.</p>
              <div className="space-y-5 mb-6">
                {competencias.map((comp) => (
                  <div key={comp.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1 min-w-[180px]">
                      <div className="font-semibold text-gray-900 text-sm">{comp.label}</div>
                      <div className="text-xs text-gray-500 mb-1">{comp.descricao}</div>
                    </div>
                    <StarRating
                      value={form[comp.key]}
                      onChange={(val) => handleStarChange(comp.key, val)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 ${!isStep2Valid ? "opacity-50 cursor-not-allowed" : ""} ${sending ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!isStep2Valid || sending}
                >
                  {sending && (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
                  )}
                  Enviar Feedback
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 