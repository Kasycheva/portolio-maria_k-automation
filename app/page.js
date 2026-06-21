'use client';
import { useState } from 'react';
import { LangProvider } from '@/components/portfolio/LangContext';
import SmoothScroll from '@/components/portfolio/SmoothScroll';
import TopBar from '@/components/portfolio/TopBar';
import Hero from '@/components/portfolio/Hero';
import About from '@/components/portfolio/About';
import Skills from '@/components/portfolio/Skills';
import CaseStudies from '@/components/portfolio/CaseStudies';
import Workflow from '@/components/portfolio/Workflow';
import AIMaria from '@/components/portfolio/AIMaria';
import Contact from '@/components/portfolio/Contact';

function App() {
  const [heroDone, setHeroDone] = useState(false);
  return (
    <LangProvider>
      <SmoothScroll enabled={heroDone} />
      <TopBar showSectionNav={heroDone} />
      <main className="relative grain">
        <Hero onContinue={() => setHeroDone(true)} />
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
