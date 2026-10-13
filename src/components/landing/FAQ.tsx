import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Como funciona o teste grátis?',
    a: 'O teste gratuito oferece 4 horas de acesso à plataforma. Para solicitá-lo, basta criar uma conta e preencher o formulário de solicitação. O teste é concedido mediante aprovação e está disponível apenas uma vez por cliente. O início é agendado pela equipe de suporte.',
  },
  {
    q: 'Quais dispositivos são compatíveis?',
    a: 'A ChamPlay é compatível com Android TV, Android TV Stick, Smart TVs Samsung e LG (modelos selecionados), dispositivos Roku e navegadores web. A disponibilidade pode variar conforme o modelo e versão do sistema operacional.',
  },
  {
    q: 'Como faço a instalação?',
    a: 'Após a confirmação do seu plano, nossa equipe de suporte fornecerá um guia de instalação personalizado para o seu dispositivo. Você também pode abrir um atendimento pelo chat de suporte dentro da área do cliente.',
  },
  {
    q: 'Posso trocar de plano?',
    a: 'Sim, é possível solicitar a troca de plano a qualquer momento pela área do cliente. As condições de troca podem variar de acordo com o plano atual e o tempo restante de assinatura. Entre em contato com o suporte para mais informações.',
  },
  {
    q: 'Como funciona a renovação?',
    a: 'A renovação não é automática. Quando sua assinatura estiver próxima do vencimento, você receberá uma notificação para renovar. Basta acessar a área de planos e escolher o período desejado.',
  },
  {
    q: 'Como entro em contato com o suporte?',
    a: 'Você pode entrar em contato com o suporte pelo chat dentro da área do cliente. O atendimento é realizado por nossa equipe especializada. Você também pode registrar atendimentos por categoria: instalação, acesso, financeiro, plano ou outros.',
  },
  {
    q: 'Posso usar em mais de um dispositivo?',
    a: 'O número de dispositivos simultâneos pode variar conforme o plano contratado. Consulte os detalhes do seu plano ou entre em contato com o suporte para obter informações específicas sobre o seu acesso.',
  },
  {
    q: 'Quais formas de pagamento serão aceitas?',
    a: 'A integração com meios de pagamento está em desenvolvimento. Em breve serão aceitas as principais formas de pagamento. Por enquanto, entre em contato com nosso suporte para informações sobre como efetuar o pagamento.',
  },
  {
    q: 'Como cancelar uma assinatura?',
    a: 'Para solicitar o cancelamento da sua assinatura, entre em contato com o suporte pelo chat na área do cliente. Nossa equipe irá orientar você sobre o processo e as condições aplicáveis conforme o plano contratado.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="duvidas" className="py-24 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-muted-foreground">
            Encontre respostas para as dúvidas mais comuns sobre a ChamPlay.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl overflow-hidden card-glow"
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-medium text-foreground text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-muted-foreground shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
