import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Profissional */}
        <div className="bg-zinc-900 px-8 py-10 text-center">
          <div className="flex items-center justify-center gap-3 font-bold text-2xl text-white mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🧠</span>
            </div>
            DocuMind AI
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Faça upload dos seus documentos, contratos ou relatórios e extraia insights instantâneos através da nossa Inteligência Artificial avançada.
          </p>
        </div>

        {/* Formulário */}
        <div className="p-8">
          <div className="space-y-2 text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Acesse sua conta</h1>
            <p className="text-sm text-zinc-500">Insira suas credenciais para continuar</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1">
              <Input 
                type="password" 
                placeholder="Senha" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded-lg transition-colors" disabled={loading}>
              {loading ? 'Autenticando...' : 'Entrar na Plataforma'}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-zinc-500">
            Ainda não possui acesso?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              Crie sua conta agora
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
