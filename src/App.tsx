import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Target, 
  AlertTriangle, 
  Globe, 
  User as UserIcon,
  Briefcase,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Dashboard } from './pages/Dashboard';
import { Portfolio } from './pages/Portfolio';
import { GoalPlanner } from './pages/GoalPlanner';
import { SIPCalculator } from './pages/SIPCalculator';
import { Advisor } from './pages/Advisor';
import { Profile } from './pages/Profile';
import { BiasAlerts, MarketSentiment } from './pages/BehavioralInsights';
import { LandingPage } from './pages/LandingPage';
import { Sidebar } from './components/Sidebar';
import { Asset, Goal, Message } from './types';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activePage, setActivePage] = useState('Dashboard');
  const [loading, setLoading] = useState(true);

  const [portfolio, setPortfolio] = useState<Asset[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<any[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currency, setCurrency] = useState('INR');
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '', tickerSymbol: '', type: '', invested: '', current: '', quantity: '', pricePerUnit: '', purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [biases, setBiases] = useState<any[]>([]);
  const [sentiment, setSentiment] = useState<any>(null);
  const [biasLoading, setBiasLoading] = useState(false);
  const [biasError, setBiasError] = useState<string | undefined>();
  const [sentimentError, setSentimentError] = useState<string | undefined>();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    fetchSentiment();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || user?.id === 'guest') return;
    fetchPortfolio();
    fetchPortfolioHistory();
    fetchGoals();
    fetchProfile();
  }, [user]);

  // --- Data fetchers ---
  const fetchPortfolio = async () => {
    const { data } = await supabase.from('portfolios').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    if (data) setPortfolio(data.map(d => ({
      id: d.id, name: d.name, tickerSymbol: d.ticker_symbol, type: d.type,
      invested: Number(d.invested), current: Number(d.current),
      return: Number(d.return || 0), purchaseDate: d.purchase_date
    })));
  };

  const fetchPortfolioHistory = async () => {
    const { data } = await supabase.from('portfolio_history').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    if (data) setPortfolioHistory(data.map(d => ({
      id: d.id, total_value: Number(d.total_value), created_at: d.created_at
    })));
  };

  const recordPortfolioHistory = async (newTotal: number) => {
    if (user?.id === 'guest') return;
    await supabase.from('portfolio_history').insert({ user_id: user.id, total_value: newTotal });
    fetchPortfolioHistory();
  };

  const fetchGoals = async () => {
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    if (data) setGoals(data.map(d => ({
      id: d.id, name: d.name, target: Number(d.target), progress: Number(d.progress || 0),
      year: d.year || new Date().getFullYear() + 5, color: d.color || 'from-violet-500 to-fuchsia-500', icon: Target
    })));
  };

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) { setName(data.name || ''); setPhoneNumber(data.phone_number || ''); setAddress(data.address || ''); }
  };

  const fetchSentiment = async () => {
    setSentimentError(undefined);
    try {
      const res = await fetch(`${API_URL}/behavioral/sentiment`);
      const data = await res.json();
      setSentiment(data);
    } catch (e: any) { setSentimentError(e.message); }
  };

  // --- AI Actions ---
  const analyzeBiases = async () => {
    if (portfolio.length === 0) return;
    setBiasLoading(true); setBiasError(undefined);
    try {
      const res = await fetch(`${API_URL}/behavioral/biases`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio }),
      });
      const data = await res.json();
      setBiases(data);
    } catch (e: any) { setBiasError(e.message); }
    setBiasLoading(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setAiLoading(true);
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    try {
      const res = await fetch(`${API_URL}/advisor/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.advice, why: data.why, takeaway: data.takeaway }]);
    } catch (e: any) {
      console.error('Frontend AI Error:', e);
      setMessages(prev => [...prev, { role: 'ai', text: 'WealthMind is currently optimizing your request. Please try again in 10 seconds.' }]);
    }
    setAiLoading(false);
  };

  // --- CRUD: Portfolio ---
  const addInvestment = async () => {
    if (!newAsset.name) return;
    const invAmt = newAsset.invested ? Number(newAsset.invested) : (Number(newAsset.quantity) * Number(newAsset.pricePerUnit));
    const invData: Partial<Asset> = {
      name: newAsset.name, tickerSymbol: newAsset.tickerSymbol, type: newAsset.type,
      invested: invAmt, current: invAmt,
      quantity: Number(newAsset.quantity) || 0,
      pricePerUnit: Number(newAsset.pricePerUnit) || 0,
      purchaseDate: newAsset.purchaseDate || new Date().toISOString()
    };
    if (user.id === 'guest') {
      setPortfolio(prev => [...prev, { ...invData, id: `guest-${Date.now()}` } as Asset]);
    } else {
      await supabase.from('portfolios').insert({
        user_id: user.id, name: invData.name, ticker_symbol: invData.tickerSymbol,
        type: invData.type, invested: invData.invested, current: invData.current,
        return: 0, purchase_date: invData.purchaseDate,
        quantity: invData.quantity, price_per_unit: invData.pricePerUnit
      });
      fetchPortfolio();
      const newTotal = portfolio.reduce((sum, p) => sum + p.current, 0) + (invData.current || 0);
      recordPortfolioHistory(newTotal);
    }
    setNewAsset({ name: '', tickerSymbol: '', type: '', invested: '', current: '', quantity: '', pricePerUnit: '', purchaseDate: new Date().toISOString().split('T')[0] });
  };

  const deleteAsset = async (id: string) => {
    if (user.id === 'guest') {
      setPortfolio(prev => prev.filter(p => p.id !== id));
      return;
    }
    
    const assetToRemove = portfolio.find(p => p.id === id);
    if (!assetToRemove) return;
    
    await supabase.from('portfolios').delete().eq('id', id);
    setPortfolio(prev => prev.filter(p => p.id !== id));
    
    const newTotal = portfolio.reduce((sum, p) => sum + p.current, 0) - (assetToRemove.current || 0);
    recordPortfolioHistory(newTotal);
  };

  const updateCurrentValue = async (id: string, current: number) => {
    const asset = portfolio.find(p => p.id === id);
    if (!asset) return;
    const ret = asset.invested > 0 ? ((current - asset.invested) / asset.invested) * 100 : 0;
    
    if (user.id !== 'guest') {
      await supabase.from('portfolios').update({ current, return: ret }).eq('id', id);
      const newTotal = portfolio.reduce((sum, p) => sum + (p.id === id ? current : p.current), 0);
      recordPortfolioHistory(newTotal);
    }
    setPortfolio(prev => prev.map(p => p.id === id ? { ...p, current, return: ret } : p));
  };

  // --- CRUD: Goals ---
  const addGoal = async (goal: Partial<Goal>) => {
    if (!goal.name) return;
    if (user.id === 'guest') {
      setGoals(prev => [...prev, { ...goal, id: `guest-${Date.now()}`, icon: Target } as Goal]);
      return;
    }
    const { error } = await supabase.from('goals').insert({
      user_id: user.id, name: goal.name, target: Number(goal.target),
      progress: Number(goal.progress || 0), year: goal.year,
      color: goal.color || 'from-emerald-500 to-teal-400'
    });
    
    if (error) {
      console.error('Goal Insert Error:', error);
      alert(`Failed to save goal: ${error.message}\n(Make sure to run the latest supabase_schema.sql)`);
      return;
    }
    
    fetchGoals();
  };

  const deleteGoal = async (id: string) => {
    if (user.id !== 'guest') await supabase.from('goals').delete().eq('id', id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateGoalProgress = async (id: string, progress: number) => {
    if (user.id !== 'guest') await supabase.from('goals').update({ progress }).eq('id', id);
    setGoals(prev => prev.map(g => g.id === id ? { ...g, progress } : g));
  };

  // --- Profile ---
  const handleProfileUpdate = async () => {
    if (!user || user.id === 'guest') return;
    setSaving(true);
    await supabase.from('profiles').upsert({ id: user.id, name, phone_number: phoneNumber, address, updated_at: new Date().toISOString() });
    setSaving(false);
  };

  const handleGuestLogin = () => setUser({ id: 'guest', email: 'guest@wealthmind.ai' });
  const handleAuthSuccess = (u: any) => setUser(u);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setPortfolio([]); setGoals([]);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard': return <Dashboard portfolio={portfolio} portfolioHistory={portfolioHistory} goals={goals} userName={name || user?.email?.split('@')[0] || 'Investor'} />;
      case 'Goal Planner': return <GoalPlanner goals={goals} onAddGoal={addGoal} onDeleteGoal={deleteGoal} onUpdateProgress={updateGoalProgress} />;
      case 'SIP Calculator': return <SIPCalculator />;
      case 'AI Advisor': return <Advisor messages={messages} input={input} setInput={setInput} sendMessage={sendMessage} loading={aiLoading} />;
      case 'Portfolio': return <Portfolio portfolio={portfolio} currency={currency} setCurrency={setCurrency} formatCurrency={v => v.toLocaleString('en-IN')} convert={v => v} addInvestment={addInvestment} newAsset={newAsset} setNewAsset={setNewAsset} deleteAsset={deleteAsset} updateCurrentValue={updateCurrentValue} />;
      case 'Bias Alerts': return <BiasAlerts biases={biases} onAnalyze={analyzeBiases} loading={biasLoading} error={biasError} />;
      case 'Market Sentiment': return <MarketSentiment sentiment={sentiment} error={sentimentError} onRefresh={fetchSentiment} />;
      case 'Profile': return <Profile user={user} name={name} setName={setName} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} address={address} setAddress={setAddress} saving={saving} handleUpdate={handleProfileUpdate} />;
      default: return <Dashboard portfolio={portfolio} portfolioHistory={portfolioHistory} goals={goals} userName={name || user?.email?.split('@')[0] || 'Investor'} />;
    }
  };

  if (loading) return (
    <div className="h-screen bg-glass-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-violet-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Goal Planner', icon: Target },
    { name: 'SIP Calculator', icon: Calculator },
    { name: 'AI Advisor', icon: MessageSquare },
    { name: 'Portfolio', icon: Briefcase },
    { name: 'Bias Alerts', icon: AlertTriangle },
    { name: 'Market Sentiment', icon: Globe },
    { name: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="flex relative min-h-screen bg-glass-gradient text-slate-900 font-sans">
      {!user ? (
        <LandingPage onGuestLogin={handleGuestLogin} onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          <Sidebar navItems={navItems} activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout} />
          <main className="flex-1 p-8 w-full max-w-7xl relative z-10">
            <AnimatePresence mode="wait">
              <motion.div key={activePage} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }} className="max-w-7xl mx-auto">
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>
        </>
      )}
    </div>
  );
}
