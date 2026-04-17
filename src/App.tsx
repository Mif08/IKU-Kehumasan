/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  LayoutDashboard, 
  FileText, 
  History as HistoryIcon, 
  TrendingUp, 
  Users, 
  Target, 
  MessageSquare,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { SocialMediaReport, CalculationResult } from './types';

// Constants for calculations based on screenshot
const CALC_RULES = {
  UNSUR_1_WEIGHT: 0.6,
  UNSUR_2_WEIGHT: 0.2,
  UNSUR_3_WEIGHT: 0.2,
};

const calculateMetrics = (data: Partial<SocialMediaReport>): CalculationResult => {
  const { followersCurrent = 0, followersPrevious = 0, totalReach = 0, totalInteractions = 0 } = data;

  // Unsur 1: Reach Rate
  const reachRate = followersCurrent > 0 ? (totalReach / followersCurrent) * 100 : 0;
  let reachIndex = 1;
  if (reachRate > 100) reachIndex = 4;
  else if (reachRate >= 70) reachIndex = 3;
  else if (reachRate >= 40) reachIndex = 2;

  // Unsur 2: Engagement Rate
  const engagementRate = followersCurrent > 0 ? (totalInteractions / followersCurrent) * 100 : 0;
  let engagementIndex = 1;
  if (engagementRate > 10) engagementIndex = 4;
  else if (engagementRate >= 7) engagementIndex = 3;
  else if (engagementRate >= 4) engagementIndex = 2;

  // Unsur 3: Growth Rate
  const growthRate = followersPrevious > 0 ? ((followersCurrent - followersPrevious) / followersPrevious) * 100 : 0;
  let growthIndex = 1;
  if (growthRate > 5) growthIndex = 4;
  else if (growthRate >= 3) growthIndex = 3;
  else if (growthRate >= 1) growthIndex = 2;

  const finalScore = (reachIndex * CALC_RULES.UNSUR_1_WEIGHT) + 
                     (engagementIndex * CALC_RULES.UNSUR_2_WEIGHT) + 
                     (growthIndex * CALC_RULES.UNSUR_3_WEIGHT);

  return {
    reachRate, reachIndex,
    engagementRate, engagementIndex,
    growthRate, growthIndex,
    finalScore
  };
};

export default function App() {
  const [reports, setReports] = useState<SocialMediaReport[]>(() => {
    const saved = localStorage.getItem('djpb-sm-reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');
  const [formData, setFormData] = useState<Omit<SocialMediaReport, 'id' | 'createdAt'>>({
    quarter: 'Q1',
    year: new Date().getFullYear(),
    followersCurrent: 0,
    followersPrevious: 0,
    totalReach: 0,
    totalInteractions: 0
  });

  const [signer1, setSigner1] = useState(() => localStorage.getItem('signer1') || '');
  const [signer2, setSigner2] = useState(() => localStorage.getItem('signer2') || '');
  const [signer1Title, setSigner1Title] = useState(() => localStorage.getItem('signer1Title') || 'Mengetahui,');
  const [signer1Role, setSigner1Role] = useState(() => localStorage.getItem('signer1Role') || 'Kepala Bagian Umum');
  const [signer2Title, setSigner2Title] = useState(() => localStorage.getItem('signer2Title') || 'Menyetujui,');
  const [signer2Role, setSigner2Role] = useState(() => localStorage.getItem('signer2Role') || 'Atasan Langsung');

  useEffect(() => {
    localStorage.setItem('djpb-sm-reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('signer1', signer1);
    localStorage.setItem('signer2', signer2);
    localStorage.setItem('signer1Title', signer1Title);
    localStorage.setItem('signer1Role', signer1Role);
    localStorage.setItem('signer2Title', signer2Title);
    localStorage.setItem('signer2Role', signer2Role);
  }, [signer1, signer2, signer1Title, signer1Role, signer2Title, signer2Role]);

  const results = useMemo(() => calculateMetrics(formData), [formData]);

  const handleSave = () => {
    if (formData.followersCurrent === 0) return;
    
    const newReport: SocialMediaReport = {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setReports([newReport, ...reports]);
    setActiveTab('history');
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  const recentHistory = reports.slice(0, 5).map(r => ({
    name: `${r.quarter} ${r.year}`,
    score: calculateMetrics(r).finalScore
  })).reverse();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      {/* Sidebar - Desktop Only */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E5E7EB] hidden lg:flex flex-col z-20">
        <div className="p-6 border-bottom border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-blue-900 leading-none">
              DJPb <span className="block text-sm font-normal text-blue-600 mt-1">Social Media Index</span>
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab('calculator')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
              activeTab === 'calculator' ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <LayoutDashboard size={20} />
            Kalkulator IKU
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
              activeTab === 'history' ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <HistoryIcon size={20} />
            Riwayat Laporan
          </button>
        </nav>

        <div className="p-6">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Bantuan Formula</p>
            <div className="text-[11px] space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Reach</span>
                <span className="font-mono">60%</span>
              </div>
              <div className="flex justify-between">
                <span>Engagement</span>
                <span className="font-mono">20%</span>
              </div>
              <div className="flex justify-between">
                <span>Growth</span>
                <span className="font-mono">20%</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {activeTab === 'calculator' ? 'Pembuat Laporan IKU' : 'Daftar Laporan Terbit'}
              </h2>
              <p className="text-gray-500 mt-1">
                {activeTab === 'calculator' 
                  ? 'Input data Meta Business Suite Anda untuk menghitung indeks pengembangan.' 
                  : 'Kumpulan riwayat perhitungan yang telah disimpan sebelumnya.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                onClick={() => window.print()}
              >
                <Download size={16} />
                Cetak PDF
              </button>
              {activeTab === 'history' && (
                <button 
                  className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
                  onClick={() => setActiveTab('calculator')}
                >
                  <Plus size={16} />
                  Laporan Baru
                </button>
              )}
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'calculator' ? (
              <motion.div 
                key="calc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-8"
              >
                {/* Input Form */}
                <div className="xl:col-span-4 space-y-6">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                       <FileText size={20} className="text-blue-500" />
                       Data Input
                    </h3>
                    
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Triwulan</label>
                          <select 
                            value={formData.quarter}
                            onChange={(e) => setFormData({...formData, quarter: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          >
                            <option value="Q1">Q1 (Mar)</option>
                            <option value="Q2">Q2 (Jun)</option>
                            <option value="Q3">Q3 (Sep)</option>
                            <option value="Q4">Q4 (Des)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tahun</label>
                          <input 
                            type="number" 
                            value={formData.year}
                            onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                          <span>Followers (Triwulan Ini)</span>
                          <Users size={14} className="text-gray-400" />
                        </label>
                        <input 
                          type="number" 
                          placeholder="e.g. 1500"
                          value={formData.followersCurrent || ''}
                          onChange={(e) => setFormData({...formData, followersCurrent: parseInt(e.target.value) || 0})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                          <span>Followers (Triwulan Lalu)</span>
                          <HistoryIcon size={14} className="text-gray-400" />
                        </label>
                        <input 
                          type="number" 
                          placeholder="e.g. 1200"
                          value={formData.followersPrevious || ''}
                          onChange={(e) => setFormData({...formData, followersPrevious: parseInt(e.target.value) || 0})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                          <span>Total Reach (Jangkauan)</span>
                          <Target size={14} className="text-gray-400" />
                        </label>
                        <input 
                          type="number" 
                          placeholder="e.g. 5000"
                          value={formData.totalReach || ''}
                          onChange={(e) => setFormData({...formData, totalReach: parseInt(e.target.value) || 0})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                          <span>Total Interaksi</span>
                          <MessageSquare size={14} className="text-gray-400" />
                        </label>
                        <input 
                          type="number" 
                          placeholder="e.g. 200"
                          value={formData.totalInteractions || ''}
                          onChange={(e) => setFormData({...formData, totalInteractions: parseInt(e.target.value) || 0})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>

                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Custom Tanda Tangan</h4>
                        
                        <div className="space-y-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pihak 1 (Kiri)</p>
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              placeholder="Keterangan (e.g. Mengetahui,)"
                              value={signer1Title}
                              onChange={(e) => setSigner1Title(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input 
                              type="text" 
                              placeholder="Jabatan (e.g. Kepala Bagian)"
                              value={signer1Role}
                              onChange={(e) => setSigner1Role(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input 
                              type="text" 
                              placeholder="Nama Lengkap"
                              value={signer1}
                              onChange={(e) => setSigner1(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pihak 2 (Kanan)</p>
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              placeholder="Keterangan (e.g. Menyetujui,)"
                              value={signer2Title}
                              onChange={(e) => setSigner2Title(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input 
                              type="text" 
                              placeholder="Jabatan (e.g. Atasan Langsung)"
                              value={signer2Role}
                              onChange={(e) => setSigner2Role(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input 
                              type="text" 
                              placeholder="Nama Lengkap"
                              value={signer2}
                              onChange={(e) => setSigner2(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={handleSave}
                        disabled={formData.followersCurrent === 0}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-lg shadow-blue-100 mt-4 active:scale-95"
                      >
                        Simpan Laporan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Results Display */}
                <div className="xl:col-span-8 space-y-8">
                  {/* Gauge Score */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Social Media Index Score</p>
                      <div className="relative h-48 w-full max-w-sm flex items-center justify-center">
                        <div className="text-6xl font-black text-gray-900 tracking-tighter">
                          {results.finalScore.toFixed(2)}
                        </div>
                        {/* Semi-circular visual */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                          <ResponsiveContainer width="100%" height="100%">
                             <RadialBarChart innerRadius="80%" outerRadius="100%" data={[{ value: results.finalScore }]} startAngle={180} endAngle={0}>
                               <RadialBar dataKey="value" fill="#2563eb" cornerRadius={10} />
                             </RadialBarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="w-full max-w-md bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-4 mt-2">
                         <div className={cn(
                           "p-2 rounded-full",
                           results.finalScore >= 3.5 ? "bg-green-100 text-green-600" :
                           results.finalScore >= 2.5 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                         )}>
                           {results.finalScore >= 3 ? <CheckCircle2 /> : <AlertCircle />}
                         </div>
                         <div className="text-left">
                           <p className="font-bold text-gray-800">
                             Status: {results.finalScore >= 3.5 ? 'Amat Baik' : 
                                     results.finalScore >= 3 ? 'Baik' : 
                                     results.finalScore >= 2 ? 'Cukup' : 'Perlu Perbaikan'}
                           </p>
                           <p className="text-xs text-gray-500">Performa akun media sosial berdasarkan indikator tertimbang.</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Indicators Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Unsur 1 */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
                          <Target size={20} />
                        </div>
                        <span className="text-xs font-mono font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">Weight: 60%</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wide">Jangkauan (Reach)</h4>
                        <p className="text-2xl font-black text-gray-800 mt-1">{results.reachRate.toFixed(1)}%</p>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Index Capaian</span>
                          <span className="font-bold text-purple-600">Indeks {results.reachIndex}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(results.reachIndex / 4) * 100}%` }}
                              className="h-full bg-purple-500 transition-all"
                           />
                        </div>
                      </div>
                    </div>

                    {/* Unsur 2 */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                          <MessageSquare size={20} />
                        </div>
                        <span className="text-xs font-mono font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">Weight: 20%</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wide">Interaksi (Eng.)</h4>
                        <p className="text-2xl font-black text-gray-800 mt-1">{results.engagementRate.toFixed(1)}%</p>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Index Capaian</span>
                          <span className="font-bold text-blue-600">Indeks {results.engagementIndex}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(results.engagementIndex / 4) * 100}%` }}
                              className="h-full bg-blue-500 transition-all"
                           />
                        </div>
                      </div>
                    </div>

                    {/* Unsur 3 */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="bg-green-100 p-2 rounded-xl text-green-600">
                          <TrendingUp size={20} />
                        </div>
                        <span className="text-xs font-mono font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">Weight: 20%</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wide">Pertumbuhan</h4>
                        <p className="text-2xl font-black text-gray-800 mt-1">{results.growthRate.toFixed(1)}%</p>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Index Capaian</span>
                          <span className="font-bold text-green-600">Indeks {results.growthIndex}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(results.growthIndex / 4) * 100}%` }}
                              className="h-full bg-green-500 transition-all"
                           />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary chart for recent reports if available */}
                  {reports.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" />
                        Tren Indeks {formData.year}
                      </h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={recentHistory}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 12, fill: '#9CA3AF' }}
                              domain={[0, 4]}
                            />
                            <Tooltip 
                              cursor={{ fill: 'transparent' }}
                              contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                fontSize: '12px'
                              }}
                            />
                            <Bar 
                              dataKey="score" 
                              fill="#3B82F6" 
                              radius={[6, 6, 0, 0]} 
                              maxBarSize={40}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Periode</th>
                        <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Followers</th>
                        <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Reach / Eng</th>
                        <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Dibuat Pada</th>
                        <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reports.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-2 opacity-40">
                              <HistoryIcon size={48} />
                              <p className="font-medium">Belum ada laporan tersimpan</p>
                              <p className="text-sm">Gunakan kalkulator untuk membuat laporan pertamamu.</p>
                            </div>
                          </td>
                        </tr>
                      ) : reports.map((report) => {
                        const m = calculateMetrics(report);
                        return (
                          <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-900">{report.quarter}</span>
                                <span className="text-gray-400">{report.year}</span>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="text-sm">
                                <p className="font-bold text-gray-700">{report.followersCurrent.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">Prev: {report.followersPrevious.toLocaleString()}</p>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="text-xs space-y-1">
                                <p><span className="text-gray-400">R:</span> <span className="font-mono text-gray-700">{m.reachRate.toFixed(1)}%</span></p>
                                <p><span className="text-gray-400">E:</span> <span className="font-mono text-gray-700">{m.engagementRate.toFixed(1)}%</span></p>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className={cn(
                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-black",
                                m.finalScore >= 3 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                              )}>
                                {m.finalScore.toFixed(2)}
                              </div>
                            </td>
                            <td className="p-6 text-sm text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-6">
                              <button 
                                onClick={() => deleteReport(report.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Hapus Laporan"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-8 pt-12 pb-12 px-8 bg-white rounded-3xl border border-gray-100 shadow-sm print:shadow-none print:border-none">
            <div className="text-center space-y-20">
              <div className="space-y-1">
                <p className="text-sm font-medium">{signer1Title}</p>
                <p className="font-bold text-gray-800">{signer1Role}</p>
              </div>
              <div className="relative">
                <div className="h-[1px] w-48 bg-gray-300 mx-auto mb-1" />
                <p className="font-bold text-gray-900">{signer1 || '(....................................)'}</p>
              </div>
            </div>
            
            <div className="text-center space-y-20">
              <div className="space-y-1">
                <p className="text-sm font-medium">{signer2Title}</p>
                <p className="font-bold text-gray-800">{signer2Role}</p>
              </div>
              <div className="relative">
                <div className="h-[1px] w-48 bg-gray-300 mx-auto mb-1" />
                <p className="font-bold text-gray-900">{signer2 || '(....................................)'}</p>
              </div>
            </div>
          </div>

          <footer className="pt-12 pb-8 border-t border-gray-100">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                <p>© {new Date().getFullYear()} Direktorat Jenderal Perbendaharaan. Hak Cipta Dilindungi.</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-blue-600 transition-colors uppercase font-bold tracking-widest">Panduan IKU</a>
                  <a href="#" className="hover:text-blue-600 transition-colors uppercase font-bold tracking-widest">Meta Suite</a>
                  <a href="#" className="hover:text-blue-600 transition-colors uppercase font-bold tracking-widest">Kontak Helpdesk</a>
                </div>
             </div>
          </footer>
        </div>
      </main>
      
      {/* Floating Info Button */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50">
        <button className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 text-gray-400 hover:text-blue-600 hover:scale-110 transition-all flex items-center gap-3">
          <HelpCircle size={24} />
          <span className="font-bold text-sm text-gray-700 pr-2">Panduan Pengisian</span>
        </button>
      </div>
    </div>
  );
}
