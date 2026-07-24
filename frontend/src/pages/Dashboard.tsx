import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { FileText, LogOut, UploadCloud, MessageSquare } from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  createdAt: string;
}

export function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${API_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Erro ao buscar documentos', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchDocuments(); // Atualiza a lista após o upload
    } catch (error) {
      console.error('Erro no upload', error);
      alert('Erro ao enviar documento. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">Meus Documentos (RAG)</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 max-w-5xl">
        <div className="mb-8 flex flex-col items-center justify-center rounded-xl border border-dashed bg-background p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <UploadCloud className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Faça upload de um novo PDF</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Envie um documento PDF para que a Inteligência Artificial o processe e você possa fazer perguntas sobre ele.
          </p>
          <div className="relative">
            <Button disabled={uploading}>
              {uploading ? 'Processando (IA extraindo texto e gerando vetores)...' : 'Selecionar Arquivo PDF'}
            </Button>
            <input 
              type="file" 
              accept="application/pdf" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Documentos Processados</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-background p-4 rounded-lg border text-center">
              Nenhum documento encontrado. Faça seu primeiro upload acima!
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex flex-col justify-between rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="rounded-md bg-accent/10 p-2">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium line-clamp-1" title={doc.filename}>{doc.filename}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="w-full mt-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate(`/chat/${doc.id}`)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Conversar com a IA
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
