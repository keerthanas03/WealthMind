/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LayoutDashboard, Target, MessageSquare, Briefcase, AlertTriangle, TrendingUp, Home, LogOut, LogIn, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Mock Data
const portfolioData = [
  { name: 'Reliance Industries', type: 'Stock', invested: 50000, current: 61500, return: 23 },
  { name: 'HDFC Mutual Fund', type: 'Mutual Fund', invested: 30000, current: 34200, return: 14 },
  { name: 'SBI Gold ETF', type: 'Gold', invested: 20000, current: 21800, return: 9 },
  { name: 'Infosys', type: 'Stock', invested: 40000, current: 37200, return: -7 },
  { name: 'Government Bond', type: 'Bond', invested: 25000, current: 26250, return: 5 },
];

const growthData = [
  { date: '2026-01-01', month: 'Jan', value: 100000 },
  { date: '2026-02-01', month: 'Feb', value: 110000 },
  { date: '2026-03-01', month: 'Mar', value: 105000 },
  { date: '2026-04-01', month: 'Apr', value: 120000 },
  { date: '2026-05-01', month: 'May', value: 125000 },
  { date: '2026-06-01', month: 'Jun', value: 130000 },
];

const allocationData = [
  { name: 'Stocks', value: 90000 },
  { name: 'Mutual Funds', value: 34200 },
  { name: 'Gold', value: 21800 },
  { name: 'Bonds', value: 26250 },
];

const COLORS = ['#0D9488', '#38B2AC', '#4FD1C5', '#81E6D9'];

const goalsData = [
  { name: 'Buy a House', target: 5000000, year: 2030, progress: 18 },
  { name: 'Child Education', target: 2000000, year: 2035, progress: 8 },
  { name: 'Retirement Fund', target: 10000000, year: 2045, progress: 5 },
];

export default function App() {
  const [activePage, setActivePage] = useState('Landing');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setActivePage('Landing');
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setActivePage('Dashboard');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActivePage('Landing');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Goal Planner', icon: Target },
    { name: 'AI Advisor', icon: MessageSquare },
    { name: 'Portfolio', icon: Briefcase },
    { name: 'Bias Alerts', icon: AlertTriangle },
    { name: 'Market Sentiment', icon: TrendingUp },
    { name: 'Profile', icon: UserIcon },
  ];

  const renderPage = () => {
    if (!user) return <LandingPage onLogin={handleLogin} />;
    switch (activePage) {
      case 'Dashboard': return <DashboardPage />;
      case 'Goal Planner': return <GoalPlannerPage />;
      case 'AI Advisor': return <ChatPage />;
      case 'Portfolio': return <PortfolioPage />;
      case 'Bias Alerts': return <BiasPage />;
      case 'Market Sentiment': return <MarketPage />;
      case 'Profile': return <ProfilePage user={user} />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-red-50 text-gray-900">
      {user && (
        <nav className="w-64 bg-white p-6 flex flex-col gap-4 border-r border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-8">WealthMind</h1>
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`flex items-center gap-3 p-3 rounded-lg ${activePage === item.name ? 'bg-red-500 text-white' : 'hover:bg-red-100'}`}
            >
              <item.icon size={20} />
              {item.name}
            </button>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 mt-auto rounded-lg hover:bg-red-200">
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      )}
      <main className="flex-1 overflow-y-auto p-8">
        {renderPage()}
      </main>
    </div>
  );
}

function ProfilePage({ user }: { user: User }) {
  const [name, setName] = useState(user.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPhoneNumber(data.phoneNumber || '');
        setAddress(data.address || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user.uid]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name,
        email: user.email,
        phoneNumber,
        address
      }, { merge: true });
      alert('Profile updated!');
    } catch (error) {
      console.error(error);
      alert('Failed to update profile.');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="glass-card p-8 rounded-xl max-w-lg">
      <h2 className="text-3xl font-bold mb-6">User Profile</h2>
      <div className="mb-4">
        <label className="block text-gray-600 mb-2">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded-xl bg-red-50 border border-red-200" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-600 mb-2">Phone Number</label>
        <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-3 rounded-xl bg-red-50 border border-red-200" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-600 mb-2">Address</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 rounded-xl bg-red-50 border border-red-200" />
      </div>
      <div className="mb-6">
        <label className="block text-gray-600 mb-2">Email</label>
        <input value={user.email || ''} disabled className="w-full p-3 rounded-xl bg-red-50 border border-red-200 text-gray-500" />
      </div>
      <button onClick={handleUpdate} disabled={saving} className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

// ... (rest of the components)

function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold mb-4 text-red-600">WealthMind</h1>
      <p className="text-xl text-gray-600 mb-8">Your Personal AI Wealth Advisor</p>
      <button onClick={onLogin} className="bg-red-500 text-white px-8 py-3 rounded-full text-lg font-semibold flex items-center gap-2">
        <LogIn size={20} />
        Login with Google
      </button>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 rounded-xl border border-red-200 bg-white">
        <p className="font-bold">{payload[0].payload.date}</p>
        <p className="text-red-600">Value: ₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function DashboardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">Welcome back, User!</h2>
      <p className="text-gray-400 mb-8">Here is your portfolio summary.</p>
      <div className="grid grid-cols-4 gap-6 mb-8">
        {['Total Balance', 'Monthly Investment', 'Goal Progress %', 'Risk Score'].map(stat => (
          <div key={stat} className="glass-card p-6 rounded-xl">
            <h3 className="text-sm text-gray-600">{stat}</h3>
            <p className="text-2xl font-bold text-red-600">₹1,25,000</p>
          </div>
        ))}
      </div>
      <div className="glass-card p-6 rounded-xl h-80">
        <h3 className="text-xl font-bold mb-4">Portfolio Growth</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChatPage() {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, why?: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are WealthMind, a friendly and expert personal financial advisor. Give clear, simple, actionable financial advice. Always explain your reasoning in plain language. Keep responses under 150 words. End every response with one key takeaway.
        
        User question: ${text}
        
        Format your response as:
        Advice: [Your advice]
        Why: [Why you said this]
        Takeaway: [One key takeaway]`,
      });
      
      const responseText = response.text || '';
      const parts = responseText.split('\n');
      const advice = parts.find(p => p.startsWith('Advice: '))?.replace('Advice: ', '') || responseText;
      const why = parts.find(p => p.startsWith('Why: '))?.replace('Why: ', '');
      
      setMessages(prev => [...prev, { role: 'ai', text: advice, why }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-bold mb-6">AI Financial Advisor</h2>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-4 rounded-xl ${msg.role === 'user' ? 'bg-red-500 text-white self-end' : 'glass-card'}`}>
            <p>{msg.text}</p>
            {msg.why && <p className="text-sm text-gray-600 mt-2 italic">Why: {msg.why}</p>}
          </div>
        ))}
        {loading && <div className="p-4 glass-card rounded-xl">Thinking...</div>}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-3 rounded-xl bg-red-50 border border-red-200" placeholder="Ask a financial question..." />
        <button onClick={() => setMessages([])} className="bg-red-200 text-red-800 px-6 py-3 rounded-xl">Clear Chat</button>
        <button onClick={() => sendMessage(input)} className="bg-red-500 text-white px-6 py-3 rounded-xl">Send</button>
      </div>
    </div>
  );
}

function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([
    { name: 'Reliance Industries', tickerSymbol: 'RELIANCE', type: 'Stock', invested: 50000, current: 61500, return: 23, purchaseDate: '2025-01-15' },
    { name: 'HDFC Mutual Fund', tickerSymbol: 'HDFCMF', type: 'Mutual Fund', invested: 30000, current: 34200, return: 14, purchaseDate: '2025-02-10' },
    { name: 'SBI Gold ETF', tickerSymbol: 'SBIGOLD', type: 'Gold', invested: 20000, current: 21800, return: 9, purchaseDate: '2025-03-05' },
    { name: 'Infosys', tickerSymbol: 'INFY', type: 'Stock', invested: 40000, current: 37200, return: -7, purchaseDate: '2025-01-20' },
    { name: 'Government Bond', tickerSymbol: 'GOVBOND', type: 'Bond', invested: 25000, current: 26250, return: 5, purchaseDate: '2025-02-28' },
  ]);
  const [newAsset, setNewAsset] = useState({ name: '', type: '', invested: '', current: '', purchaseDate: '', tickerSymbol: '' });
  const [currency, setCurrency] = useState('INR');
  const [rates, setRates] = useState<any>(null);

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => setRates(data.rates));
  }, []);

  const convert = (value: number) => {
    if (!rates) return value;
    const rate = rates[currency] / rates['INR'];
    return value * rate;
  };

  const formatCurrency = (value: number) => {
    return value.toFixed(2);
  };

  const addInvestment = () => {
    if (!newAsset.name || !newAsset.type || !newAsset.invested || !newAsset.current || !newAsset.purchaseDate || !newAsset.tickerSymbol) return;
    const invested = parseFloat(newAsset.invested);
    const current = parseFloat(newAsset.current);
    const ret = ((current - invested) / invested) * 100;
    
    setPortfolio([...portfolio, { 
      name: newAsset.name, 
      type: newAsset.type, 
      invested, 
      current, 
      return: parseFloat(ret.toFixed(2)),
      purchaseDate: newAsset.purchaseDate,
      tickerSymbol: newAsset.tickerSymbol
    }]);
    setNewAsset({ name: '', type: '', invested: '', current: '', purchaseDate: '', tickerSymbol: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Portfolio Tracker</h2>
        <select value={currency} onChange={e => setCurrency(e.target.value)} className="p-2 rounded-xl bg-white border border-red-200">
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      
      <div className="glass-card p-6 rounded-xl mb-8">
        <h3 className="text-xl font-bold mb-4">Add New Investment</h3>
        <div className="grid grid-cols-3 gap-4">
          <input placeholder="Asset Name" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="p-3 rounded-xl bg-red-50 border border-red-200" />
          <input placeholder="Ticker Symbol" value={newAsset.tickerSymbol} onChange={e => setNewAsset({...newAsset, tickerSymbol: e.target.value})} className="p-3 rounded-xl bg-red-50 border border-red-200" />
          <input placeholder="Type" value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} className="p-3 rounded-xl bg-red-50 border border-red-200" />
          <input type="number" placeholder="Invested Amount" value={newAsset.invested} onChange={e => setNewAsset({...newAsset, invested: e.target.value})} className="p-3 rounded-xl bg-red-50 border border-red-200" />
          <input type="number" placeholder="Current Value" value={newAsset.current} onChange={e => setNewAsset({...newAsset, current: e.target.value})} className="p-3 rounded-xl bg-red-50 border border-red-200" />
          <input type="date" value={newAsset.purchaseDate} onChange={e => setNewAsset({...newAsset, purchaseDate: e.target.value})} className="p-3 rounded-xl bg-red-50 border border-red-200" />
          <button onClick={addInvestment} className="col-span-3 bg-red-500 text-white p-3 rounded-xl font-bold">Add Investment</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <table className="w-full text-left glass-card rounded-xl overflow-hidden">
          <thead className="bg-red-100/50">
            <tr>
              <th className="p-4">Asset</th>
              <th className="p-4">Ticker</th>
              <th className="p-4">Type</th>
              <th className="p-4">Invested ({currency})</th>
              <th className="p-4">Current ({currency})</th>
              <th className="p-4">Return</th>
              <th className="p-4">Purchase Date</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map(item => (
              <tr key={item.name} className="border-b border-red-200">
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.tickerSymbol}</td>
                <td className="p-4">{item.type}</td>
                <td className="p-4">{currency} {formatCurrency(convert(item.invested))}</td>
                <td className="p-4">{currency} {formatCurrency(convert(item.current))}</td>
                <td className={`p-4 ${item.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>{item.return}%</td>
                <td className="p-4">{item.purchaseDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="glass-card p-6 rounded-xl h-80">
          <h3 className="text-xl font-bold mb-4">Portfolio Allocation</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={portfolio.map(p => ({ name: p.name, value: convert(p.current) }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {portfolio.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function GoalPlannerPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Goal Planner</h2>
      <div className="grid grid-cols-3 gap-6">
        {goalsData.map(goal => (
          <div key={goal.name} className="glass-card p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">{goal.name}</h3>
            <p className="text-gray-600">Target: ₹{goal.target.toLocaleString()}</p>
            <p className="text-gray-600 mb-4">Year: {goal.year}</p>
            <div className="w-full bg-red-100 rounded-full h-2.5">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${goal.progress}%` }}></div>
            </div>
            <p className="text-sm mt-2">{goal.progress}% achieved</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BiasPage() {
  const alerts = [
    { title: 'Panic Selling Alert', color: 'bg-red-500', text: 'You tend to sell during market dips' },
    { title: 'Overtrading Alert', color: 'bg-yellow-500', text: 'You made 8 trades this week' },
    { title: 'Loss Aversion Alert', color: 'bg-orange-500', text: 'You are holding 3 losing stocks too long' },
  ];
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Behaviour & Bias Alerts</h2>
      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.title} className="glass-card p-6 rounded-xl flex justify-between items-center">
            <div>
              <span className={`inline-block w-3 h-3 rounded-full ${alert.color} mr-2`}></span>
              <span className="font-bold">{alert.title}</span>
              <p className="text-gray-600">{alert.text}</p>
            </div>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg">What should I do?</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Market Sentiment</h2>
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4">Today's Market Mood</h3>
        <div className="w-full bg-red-100 rounded-full h-4">
          <div className="bg-red-500 h-4 rounded-full" style={{ width: '60%' }}></div>
        </div>
        <p className="text-center mt-2">Neutral</p>
      </div>
    </div>
  );
}
