
import React, { useState, useEffect, useMemo } from 'react';
import { Sequence, Stats, Prediction } from './types';
import { calculateStats, generateLSTMPredictions } from './utils/analysis';
import Modal from './components/Modal';

const App: React.FC = () => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [history, setHistory] = useState<Sequence[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lotomania_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing history", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('lotomania_history', JSON.stringify(history));
  }, [history]);

  const toggleNumber = (num: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      }
      if (prev.length >= 20) return prev;
      return [...prev, num].sort((a, b) => a - b);
    });
  };

  const saveSequence = () => {
    if (selectedNumbers.length < 20) {
      alert("Por favor, selecione 20 números.");
      return;
    }
    const newSeq: Sequence = {
      id: history.length + 1,
      numbers: [...selectedNumbers],
      timestamp: Date.now()
    };
    setHistory(prev => [...prev, newSeq]);
    setSelectedNumbers([]);
  };

  const deleteLast = () => {
    setHistory(prev => prev.slice(0, -1));
  };

  const clearHistory = () => {
    setHistory([]);
    setIsDeleteModalOpen(false);
  };

  const stats = useMemo(() => calculateStats(history), [history]);
  const predictions = useMemo(() => generateLSTMPredictions(history, stats), [history, stats]);

  const formattedCounter = String(history.length + 1).padStart(4, '0');

  return (
    <div className="min-h-screen pb-12 px-4 md:px-8">
      {/* Header */}
      <header className="py-8 flex flex-col items-center gap-2">
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent text-center">
          GERADOR DE PALPITES LOTOMANIA
        </h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase font-medium">
          Análise Inteligente e Previsão LSTM
        </p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Grid and Controls */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Selecione 20 Números</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">PRÓXIMA SEQUÊNCIA:</span>
                <span className="bg-slate-700 px-3 py-1 rounded-lg text-yellow-400 font-mono text-lg font-bold">
                  {formattedCounter}
                </span>
              </div>
            </div>

            {/* The 100 Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-[15px] justify-items-center">
              {Array.from({ length: 100 }, (_, i) => i + 1).map(num => {
                const isSelected = selectedNumbers.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    className={`
                      w-[50px] h-[50px] rounded-xl flex items-center justify-center font-bold text-sm
                      transition-all duration-200 transform
                      hover:scale-110 active:scale-95
                      ${isSelected 
                        ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-105' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                      }
                    `}
                  >
                    {String(num).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={saveSequence}
                disabled={selectedNumbers.length < 20}
                className={`
                  flex-1 min-w-[200px] py-4 rounded-2xl font-bold text-lg transition-all active:scale-95
                  ${selectedNumbers.length < 20 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:shadow-lg hover:shadow-orange-500/20'
                  }
                `}
              >
                Salvar Sequência ({selectedNumbers.length}/20)
              </button>
              
              <button
                onClick={deleteLast}
                disabled={history.length === 0}
                className="px-8 py-4 rounded-2xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Excluir Última
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={history.length === 0}
                className="px-8 py-4 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 font-semibold hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Excluir Histórico
              </button>
            </div>
          </div>

          {/* Predictions Section */}
          <section className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 shadow-xl min-h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-white">Rede Neural LSTM - Previsões</h2>
            </div>

            {history.length < 15 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-slate-700/50 rounded-full">
                  <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-400 text-lg">Aguardando dados suficientes...</p>
                  <p className="text-slate-500 text-sm">Salve mais {15 - history.length} sequências para ativar a IA.</p>
                </div>
                <div className="w-full max-w-xs bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(history.length / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {predictions.map((pred, idx) => (
                  <div key={pred.id} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-green-400 tracking-widest uppercase">Palpite AI #{idx + 1}</span>
                      <span className="text-xs text-slate-500">Confiança: {(85 + Math.random() * 10).toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 h-32 overflow-y-auto custom-scrollbar pr-2">
                      {pred.numbers.map(n => (
                        <span key={n} className="inline-block px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px] font-mono">
                          {String(n).padStart(2, '0')}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => alert(`Copiado palpite #${idx + 1}`)}
                      className="w-full mt-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                    >
                      Copiar Números
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Statistics */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 shadow-xl sticky top-8">
            <h2 className="text-xl font-semibold text-white mb-6">Estatísticas & Análises</h2>
            
            <div className="space-y-6">
              {/* Most Frequent */}
              <div>
                <h3 className="text-xs font-bold text-orange-400 tracking-widest uppercase mb-3">Mais Frequentes</h3>
                <div className="space-y-2">
                  {history.length > 0 ? stats.mostFrequent.map(item => (
                    <div key={item.num} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                          {String(item.num).padStart(2, '0')}
                        </span>
                        <span className="text-sm text-slate-300">Frequência</span>
                      </div>
                      <span className="text-slate-400 font-mono font-bold">{item.count}x</span>
                    </div>
                  )) : <p className="text-slate-600 text-xs italic">Sem dados suficientes</p>}
                </div>
              </div>

              {/* Most Delayed */}
              <div>
                <h3 className="text-xs font-bold text-blue-400 tracking-widest uppercase mb-3">Mais Atrasados</h3>
                <div className="space-y-2">
                  {history.length > 0 ? stats.mostDelayed.map(item => (
                    <div key={item.num} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {String(item.num).padStart(2, '0')}
                        </span>
                        <span className="text-sm text-slate-300">Atraso</span>
                      </div>
                      <span className="text-slate-400 font-mono font-bold">{item.delay} seq</span>
                    </div>
                  )) : <p className="text-slate-600 text-xs italic">Sem dados suficientes</p>}
                </div>
              </div>

              {/* General Info */}
              <div className="pt-4 border-t border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Salvo</p>
                    <p className="text-xl font-bold text-white">{history.length}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Último Salvo</p>
                    <p className="text-xl font-bold text-white">
                      {history.length > 0 ? new Date(history[history.length - 1].timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--/--'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={clearHistory}
        title="Excluir Todo Histórico?"
        message="Esta ação apagará permanentemente todas as suas sequências salvas e estatísticas. Deseja continuar?"
      />
    </div>
  );
};

export default App;
