import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";

const SESSION_KEY = "usuariosFeedbackCache";

export default function useUsuariosFeedback() {
  const { user } = useAuth();
  const keycloakId = user?.sub;

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carrega do sessionStorage se existir
  useEffect(() => {
    const cache = sessionStorage.getItem(SESSION_KEY);
    if (cache) {
      const { usuarios } = JSON.parse(cache);
      setUsuarios(usuarios);
    }
  }, []);

  // Salva no sessionStorage sempre que muda
  useEffect(() => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ usuarios })
    );
  }, [usuarios]);

  const fetchUsuarios = async () => {
    if (loading || !keycloakId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userService.listarUsuariosFeedback(keycloakId);
      const lista = data.content || data || [];
      setUsuarios(lista);
    } catch (err) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Primeira busca automática
  useEffect(() => {
    if (usuarios.length === 0 && keycloakId) fetchUsuarios();
    // eslint-disable-next-line
  }, [keycloakId]);

  // Função para resetar cache (opcional)
  const resetUsuarios = () => {
    setUsuarios([]);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return { usuarios, loading, error, resetUsuarios };
} 