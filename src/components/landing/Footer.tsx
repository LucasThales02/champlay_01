import { PlayCircle } from 'lucide-react';

const sections = [
  {
    title: 'Navegação',
    links: [
      { label: 'Home', href: '#inicio' },
      { label: 'Compatibilidade', href: '#compatibilidade' },
      { label: 'Planos', href: '#planos' },
      { label: 'Suporte', href: '#duvidas' },
    ],
  },
];

export function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
                <PlayCircle size={22} className="text-white" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                Cham<span className="text-primary">Play</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Plataforma de assinatura para serviços de streaming.
              Entretenimento com qualidade, praticidade e estabilidade.
            </p>
          </div>

          {/* Nav sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => scrollTo(link.href)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Contato
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Dúvidas? Cadastre-se e entre em contato através da área do
              cliente.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-8 space-y-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ChamPlay. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Os nomes e marcas de dispositivos mencionados (Samsung, LG, Roku,
            Android etc.) pertencem aos seus respectivos proprietários e são
            citados apenas para fins informativos.
          </p>
        </div>
      </div>
    </footer>
  );
}
