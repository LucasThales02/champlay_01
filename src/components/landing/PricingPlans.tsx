import { Check, Clock, Loader2, RefreshCw, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  PLAN_BENEFITS,
  formatMonthlyPrice,
  formatPrice,
} from '../../data/plans';

export function PricingPlans() {
  const {
    currentUser,
    plans,
    plansLoading,
    plansError,
    reloadPlans,
    setShowRegister,
  } = useApp();

  const navigate = useNavigate();

  const handlePlanClick = (planId: string, isTrial: boolean): void => {
    if (!currentUser) {
      setShowRegister(true);
      return;
    }

    if (currentUser.role === 'admin') {
      navigate('/admin');
      return;
    }

    if (isTrial) {
      navigate('/cliente/teste');
      return;
    }

    navigate(`/cliente/planos?plan=${encodeURIComponent(planId)}`);
  };

  return (
    <section
      id="planos"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Planos e preços
          </h2>

          <p className="text-xl font-medium text-muted-foreground mb-4">
            Escolha o período e economize mais
          </p>

          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Todos os planos oferecem os mesmos recursos e benefícios. A
            diferença está no período contratado: quanto maior o tempo da sua
            assinatura, maior será a sua economia.
          </p>
        </div>

        {plansLoading && (
          <div
            className="min-h-48 flex items-center justify-center gap-2 text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 size={20} className="animate-spin" />
            Carregando planos...
          </div>
        )}

        {!plansLoading && plansError && (
          <div
            className="max-w-lg mx-auto text-center bg-card border border-destructive/30 rounded-2xl p-8"
            role="alert"
          >
            <p className="text-sm text-destructive mb-4">{plansError}</p>

            <button
              type="button"
              onClick={() => void reloadPlans()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={15} />
              Tentar novamente
            </button>
          </div>
        )}

        {!plansLoading && !plansError && plans.length === 0 && (
          <div className="max-w-lg mx-auto text-center bg-card border border-border rounded-2xl p-8">
            <p className="text-sm text-muted-foreground">
              Nenhum plano disponível no momento.
            </p>
          </div>
        )}

        {!plansLoading && !plansError && plans.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                  plan.featured
                    ? 'card-glow-featured bg-card border-primary scale-[1.02]'
                    : 'card-glow bg-card border-border hover:border-primary/30'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-3 py-1 gradient-bg rounded-full text-white text-[11px] font-bold shadow-lg whitespace-nowrap">
                      <Star size={10} fill="currentColor" />
                      Mais escolhido
                    </div>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-lg font-display font-bold text-foreground mb-1">
                      {plan.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={11} />
                      <span>{plan.period}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    {plan.discount > 0 && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(plan.originalPrice)}
                        </span>

                        <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                          -{plan.discount}%
                        </span>
                      </div>
                    )}

                    <div className="text-2xl font-display font-black text-foreground">
                      {formatPrice(plan.currentPrice)}
                    </div>

                    {plan.currentPrice > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatMonthlyPrice(plan.monthlyEquivalent)}
                      </div>
                    )}

                    {plan.savings > 0 && (
                      <div className="text-xs text-success mt-1">
                        Economia de {formatPrice(plan.savings)}
                      </div>
                    )}
                  </div>

                  {plan.isTrial && (
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed border border-warning/20 bg-warning/5 rounded-lg px-3 py-2">
                      Sujeito à aprovação. Disponível apenas uma vez por
                      cliente.
                    </p>
                  )}

                  <div className="flex-1 mb-5">
                    <ul className="space-y-2">
                      {PLAN_BENEFITS.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <Check
                            size={13}
                            className="text-primary shrink-0 mt-0.5"
                          />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlanClick(plan.id, plan.isTrial)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      plan.featured
                        ? 'gradient-bg text-white hover:opacity-90 shadow-lg'
                        : 'bg-secondary text-foreground hover:bg-primary hover:text-white border border-border'
                    }`}
                  >
                    {plan.buttonLabel}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
