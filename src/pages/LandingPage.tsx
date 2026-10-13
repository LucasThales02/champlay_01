import { Header } from '../components/landing/Header';
import { Hero } from '../components/landing/Hero';
import { Benefits } from '../components/landing/Benefits';
import { Compatibility } from '../components/landing/Compatibility';
import { PricingPlans } from '../components/landing/PricingPlans';
import { FAQ } from '../components/landing/FAQ';
import { Footer } from '../components/landing/Footer';
import { LoginModal } from '../components/auth/LoginModal';
import { RegisterModal } from '../components/auth/RegisterModal';
import { ToastContainer } from '../components/Toast';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Compatibility />
        <PricingPlans />
        <FAQ />
      </main>
      <Footer />
      <LoginModal />
      <RegisterModal />
      <ToastContainer />
    </div>
  );
}
