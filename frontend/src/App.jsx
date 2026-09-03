import { useEffect, useState } from 'react';
import { checkBackendHealth } from './services/api.js';
import './index.css';

function App() {
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    checkBackendHealth()
      .then(() => setIsBackendConnected(true))
      .catch(() => setIsBackendConnected(false));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <section className="w-full max-w-2xl border border-slate-800 bg-slate-900 p-10 shadow-2xl shadow-slate-950/50 sm:p-16">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
          Module 0
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Payment Guardian</h1>
        <p className="mt-6 max-w-lg text-xl leading-relaxed text-slate-300">
          Safe and Inclusive Digital Payments
        </p>
        <div className="mt-12 border-t border-slate-800 pt-5 text-sm text-slate-400">
          Backend: {isBackendConnected ? 'Connected' : 'Disconnected'}
        </div>
      </section>
    </main>
  );
}

export default App;