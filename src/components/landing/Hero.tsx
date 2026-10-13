import { Play, ArrowRight, Settings, Monitor, Headphones } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

function StreamingVisual() {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none" aria-hidden="true">
      {/* Glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/20 blur-3xl scale-90 animate-pulse-slow" />

      {/* TV frame */}
      <div className="relative bg-secondary border border-border rounded-2xl p-3 shadow-2xl">
        <div className="bg-muted rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
          {/* Screen gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d0721] via-[#130a30] to-[#071040]" />
          {/* Streaming lines */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent"
                style={{ top: `${15 + i * 14}%`, opacity: 0.4 + i * 0.1 }}
              />
            ))}
          </div>
          {/* Play button */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer">
              <Play size={28} fill="white" className="text-white ml-1" />
            </div>
            <div className="text-center">
              <div className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">Streaming</div>
              <div className="w-24 h-1 rounded-full bg-white/20 mx-auto overflow-hidden">
                <div className="h-full w-2/3 gradient-bg rounded-full" />
              </div>
            </div>
          </div>
          {/* Corner quality badge */}
          <div className="absolute top-3 right-3 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-md">
            HD+
          </div>
        </div>
        {/* TV stand */}
        <div className="flex justify-center mt-2">
          <div className="w-16 h-2 bg-border rounded-t-lg" />
        </div>
        <div className="flex justify-center">
          <div className="w-24 h-1.5 bg-border rounded-full" />
        </div>
      </div>

      {/* Floating device chips */}
      <div className="absolute -top-4 -left-4 bg-card border border-border rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg animate-float" style={{ animationDelay: '0s' }}>
        <Monitor size={14} className="text-primary" />
        <span className="text-xs font-medium text-foreground">Smart TV</span>
      </div>
      <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="w-3.5 h-3.5 relative">
          <div className="absolute inset-0 border border-primary/60 rounded-sm" />
          <div className="absolute inset-[3px] bg-primary rounded-[2px]" />
        </div>
        <span className="text-xs font-medium text-foreground">Android TV</span>
      </div>
      <div className="absolute top-1/3 -right-8 bg-card border border-border rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg animate-float" style={{ animationDelay: '0.8s' }}>
        <div className="w-2.5 h-4 border border-accent/60 rounded-[2px] relative">
          <div className="absolute inset-[2px] bg-accent/30 rounded-[1px]" />
        </div>
        <span className="text-xs font-medium text-foreground">Mobile</span>
      </div>
    </div>
  );
}

export function Hero() {
  const { currentUser, setShowRegister } = useApp();
  const navigate = useNavigate();

  const handleTrialClick = () => {
    if (currentUser) {
      navigate('/cliente/teste');
    } else {
      setShowRegister(true);
    }
  };

  const scrollToPlans = () => {
    document.querySelector('#planos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Streaming 100% seguro e estável
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-foreground leading-tight mb-6">
              Todo o entretenimento{' '}
              <span className="gradient-text">em um só lugar</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              A ChamPlay conecta você aos seus conteúdos favoritos por meio de uma plataforma de
              streaming completa, moderna, segura e estável. Desfrute de uma navegação simples e
              intuitiva, com qualidade, praticidade e toda a tranquilidade necessária para
              transformar cada momento em uma nova experiência.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <button
                onClick={handleTrialClick}
                className="flex items-center justify-center gap-2 px-6 py-3.5 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
              >
                <Play size={18} fill="white" />
                Teste grátis por 4 horas
              </button>
              <button
                onClick={scrollToPlans}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary text-foreground font-semibold rounded-xl hover:bg-muted transition-colors border border-border"
              >
                Conhecer os planos
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Mini benefits */}
            <div className="flex flex-col sm:flex-row gap-4">
              {[
                { icon: Settings, label: 'Configuração simplificada' },
                { icon: Monitor, label: 'Vários dispositivos' },
                { icon: Headphones, label: 'Suporte especializado' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <StreamingVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
