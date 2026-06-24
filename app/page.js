'use client';
import { LangProvider } from '@/components/portfolio/LangContext';
import SmoothScroll from '@/components/portfolio/SmoothScroll';
import HeroTransition from '@/components/portfolio/HeroTransition';
import TopBar from '@/components/portfolio/TopBar';
import Hero from '@/components/portfolio/Hero';
import About from '@/components/portfolio/About';
import Skills from '@/components/portfolio/Skills';
import CaseStudies from '@/components/portfolio/CaseStudies';
import Workflow from '@/components/portfolio/Workflow';
import AIMaria from '@/components/portfolio/AIMaria';
import Contact from '@/components/portfolio/Contact';

function App() {
  return (
    <LangProvider>
      <SmoothScroll />
      <HeroTransition />
      <TopBar />
      <main className="relative grain">
        <Hero />
        <About />
        <Skills />
        <CaseStudies />
        <Workflow />
        <AIMaria />
        <Contact />
      </main>
    </LangProvider>
  );
}

export default App;
