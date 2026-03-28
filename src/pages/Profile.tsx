import React from 'react';
import { UserIcon, Save, Shield, CheckCircle, Mail, Phone, MapPin, BadgeCheck, Zap } from 'lucide-react';

interface ProfileProps {
  user: any;
  name: string;
  setName: (v: string) => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  saving: boolean;
  handleUpdate: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user, name, setName, phoneNumber, setPhoneNumber, address, setAddress, saving, handleUpdate
}) => {
  const isGuest = user?.id === 'guest';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Royal Profile</h2>
          <p className="text-xs text-slate-400 font-medium">Manage your elite credentials and secure account settings.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-2">
             <BadgeCheck size={14} className="text-amber-500" />
             <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Identity Verified</span>
           </div>
           {!isGuest && (
             <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-2">
               <Zap size={14} className="text-indigo-500" />
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Pro Tier</span>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Card & Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="relative mb-6 mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-full h-full rounded-3xl bg-white border-2 border-amber-100 flex items-center justify-center shadow-inner overflow-hidden">
                 <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                    <UserIcon size={40} className="text-amber-400" />
                 </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                <CheckCircle size={14} />
              </div>
            </div>
            
            <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{name || 'WealthMind User'}</h3>
            <p className="text-[11px] font-bold text-slate-400 truncate mb-4">{user?.email}</p>
            
            <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${isGuest ? 'bg-slate-100 text-slate-500' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'}`}>
               {isGuest ? 'Guest Access' : 'Elite Member'}
            </div>
          </div>

          <div className="glass-card p-6 border-l-4 border-l-amber-400">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Security Level</h4>
            <div className="space-y-4">
              {[
                { label: '2FA Auth', status: 'Enabled', color: 'text-emerald-500' },
                { label: 'Device', status: 'Secure', color: 'text-emerald-500' },
                { label: 'Cloud Sync', status: 'Active', color: 'text-amber-500' }
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-600">{s.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Editable Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <h4 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
              <Shield size={16} className="text-amber-500" />
              Personal Credentials
            </h4>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-amber-500 transition-colors" />
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 border border-slate-200 font-bold text-[13px] text-slate-700 outline-none focus:border-amber-400 focus:bg-white transition-all shadow-sm"
                      placeholder="Enter legal name..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                  <div className="relative opacity-60">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      readOnly
                      value={user?.email || ''}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-[13px] text-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  <input
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 border border-slate-200 font-bold text-[13px] text-slate-700 outline-none focus:border-amber-400 focus:bg-white transition-all shadow-sm"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
                <div className="relative group">
                  <MapPin size={16} className="absolute left-4 top-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={3}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-slate-200 font-bold text-[13px] text-slate-700 outline-none focus:border-amber-400 focus:bg-white transition-all shadow-sm resize-none"
                    placeholder="Enter permanent address..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
             <button
              onClick={handleUpdate}
              disabled={saving || isGuest}
              className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-200/50 hover:shadow-amber-300/60 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-40 disabled:hover:translate-y-0 group"
            >
              <Save size={18} className="group-hover:rotate-12 transition-transform" />
              {saving ? 'Synchronizing...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

