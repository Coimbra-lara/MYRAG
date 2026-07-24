import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function Chat() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: 'Olá! Eu analisei este documento. O que você gostaria de saber sobre ele?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Faz scroll automático para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(
        `${API_URL}/api/chats/message`,
        {
          documentId,
          chatId, // Pode ser null na primeira mensagem, o backend criará um novo
          message: userMsg.content,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Atualiza o chatId se foi criado agora
      if (!chatId && response.data.chatId) {
        setChatId(response.data.chatId);
      }

      const aiMsg: Message = {
        id: response.data.messageId,
        role: 'assistant',
        content: response.data.answer,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Erro ao enviar mensagem', error);
      setMessages(prev => [
        ...prev, 
        { id: 'error', role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6 shadow-sm z-10 bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Assistente RAG</h1>
          <p className="text-xs text-muted-foreground">Conversando com o seu documento PDF</p>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/10">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-20">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex w-full gap-4 rounded-xl p-4 md:p-6", 
                msg.role === 'user' ? "bg-primary/5 ml-auto md:ml-0" : "bg-card border shadow-sm"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm",
                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
              )}>
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              
              <div className="flex-1 space-y-2 overflow-hidden">
                <p className="font-semibold text-sm">
                  {msg.role === 'user' ? 'Você' : 'Assistente IA'}
                </p>
                <div className="prose prose-sm md:prose-base dark:prose-invert break-words text-foreground/90 whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex w-full gap-4 rounded-xl p-4 md:p-6 bg-card border shadow-sm">
               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow-sm bg-accent text-accent-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1 flex items-center space-x-2">
                 <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                 <span className="text-sm text-muted-foreground">Procurando respostas no PDF...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 z-10 border-t bg-background p-4 sm:p-6">
        <form onSubmit={handleSendMessage} className="mx-auto flex max-w-3xl items-center gap-2">
          <Input 
            className="flex-1 rounded-full px-6 py-6 text-base bg-muted/50 focus-visible:ring-accent"
            placeholder="Faça uma pergunta sobre o documento..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-12 w-12 rounded-full shrink-0 bg-primary hover:bg-primary/90 transition-transform active:scale-95" 
            disabled={!input.trim() || loading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">A IA pode cometer erros. Verifique informações importantes.</p>
        </div>
      </footer>
    </div>
  );
}
