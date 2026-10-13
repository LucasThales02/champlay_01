import { CheckCircle, Tv, Cpu, Monitor, Globe } from 'lucide-react';

const devices = [
  {
    icon: Tv,
    name: 'Android TV',
    description:
      'Aproveite a ChamPlay diretamente em televisores e aparelhos equipados com Android TV, com navegação simples, rápida e preparada para sua experiência de entretenimento.',
  },
  {
    icon: Cpu,
    name: 'Android TV Stick',
    description:
      'Transforme uma televisão compatível em uma central de entretenimento utilizando dispositivos TV Stick com sistema Android e acesso rápido à plataforma ChamPlay.',
  },
  {
    icon: Monitor,
    name: 'Smart TVs Samsung',
    description:
      'Assista aos seus conteúdos favoritos em modelos compatíveis de Smart TVs Samsung, com uma experiência moderna, prática e adaptada para telas maiores.',
  },
  {
    icon: Monitor,
    name: 'Smart TVs LG',
    description:
      'Tenha acesso à ChamPlay em modelos compatíveis de Smart TVs LG e desfrute de uma navegação intuitiva, estável e confortável diretamente pela sua televisão.',
  },
  {
    icon: Tv,
    name: 'Roku TV e Roku Express',
    description:
      'Utilize a ChamPlay em dispositivos Roku compatíveis e acesse seu entretenimento com facilidade, organização e uma experiência desenvolvida especialmente para sua televisão.',
  },
  {
    icon: Globe,
    name: 'Navegador Web',
    description:
      'Acesse a ChamPlay em diferentes dispositivos compatíveis e tenha mais liberdade para aproveitar seus conteúdos favoritos no ambiente que preferir, com praticidade e estabilidade.',
  },
];

export function Compatibility() {
  return (
    <section id="compatibilidade" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Compatibilidade
          </h2>
          <p className="text-xl font-medium text-muted-foreground mb-4">
            Assista onde quiser, no seu dispositivo favorito
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            A ChamPlay oferece uma experiência de streaming prática, segura e estável em diferentes
            dispositivos. Escolha sua plataforma compatível, conecte sua conta e aproveite seus
            conteúdos favoritos com qualidade e tranquilidade.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {devices.map(({ icon: Icon, name, description }) => (
            <div
              key={name}
              className="group p-6 bg-card border border-border rounded-2xl card-glow hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 border border-success/20 rounded-full">
                  <CheckCircle size={12} className="text-success" />
                  <span className="text-[11px] font-semibold text-success">Compatível</span>
                </div>
              </div>
              <h3 className="text-base font-display font-semibold text-foreground mb-2">{name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-muted-foreground leading-relaxed border border-border rounded-xl px-5 py-4 bg-card">
            ⚠️ A disponibilidade pode variar conforme o modelo, sistema operacional, região e versão
            do aplicativo. Consulte o suporte antes de contratar caso tenha dúvidas sobre seu
            dispositivo.
          </p>
        </div>
      </div>
    </section>
  );
}
