import { Wifi, MousePointer, Monitor, Headphones, RefreshCcw, Shield } from 'lucide-react';

const benefits = [
  {
    icon: Wifi,
    title: 'Streaming estável',
    description:
      'Experiência desenvolvida para oferecer qualidade, praticidade e estabilidade durante a utilização.',
  },
  {
    icon: MousePointer,
    title: 'Fácil de usar',
    description:
      'Interface simples e intuitiva para acessar seus conteúdos com poucos passos.',
  },
  {
    icon: Monitor,
    title: 'Vários dispositivos',
    description:
      'Utilize a plataforma em diferentes dispositivos compatíveis, de acordo com o seu plano.',
  },
  {
    icon: Headphones,
    title: 'Suporte especializado',
    description:
      'Conte com atendimento para auxiliar na instalação, configuração e utilização da plataforma.',
  },
  {
    icon: RefreshCcw,
    title: 'Atualizações frequentes',
    description:
      'Receba melhorias contínuas de desempenho, compatibilidade e experiência.',
  },
  {
    icon: Shield,
    title: 'Navegação segura',
    description:
      'Acesso protegido, gerenciamento de conta e boas práticas de segurança.',
  },
];

export function Benefits() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Uma experiência feita{' '}
            <span className="gradient-text">para você</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Recursos pensados para tornar cada momento de entretenimento mais simples e agradável.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className="group p-6 bg-card border border-border rounded-2xl card-glow hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
