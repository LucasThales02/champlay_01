import { Link } from 'react-router-dom';
import { Home, PlayCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-8">
        <PlayCircle size={80} className="text-primary opacity-20" />
        <span className="absolute inset-0 flex items-center justify-center text-5xl font-display font-black text-foreground">
          404
        </span>
      </div>
      <h1 className="text-3xl font-display font-bold text-foreground mb-3">
        Página não encontrada
      </h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
      >
        <Home size={18} />
        Voltar ao início
      </Link>
    </div>
  );
}
