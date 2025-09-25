import React, { useState, useEffect } from 'react';
import { kpis, revenueData, passengerVolumeData } from '../../data';

const KpiCard: React.FC<{ title: string; value: string; change: string; changeType: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => {
  const isIncrease = changeType === 'increase';
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border dark:bg-slate-800 dark:border-slate-700">
      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h4>
      <p className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{value}</p>
      <div className="flex items-center mt-2">
        <span className={`text-sm font-semibold ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>{change}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">vs last period</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [recharts, setRecharts] = useState<any>(null);

  useEffect(() => {
    // Check if Recharts is already loaded
    if ((window as any).Recharts) {
      setRecharts((window as any).Recharts);
      return;
    }

    // If not, poll for it, as it's loaded from a CDN script
    const interval = setInterval(() => {
      if ((window as any).Recharts) {
        setRecharts((window as any).Recharts);
        clearInterval(interval);
      }
    }, 100);

    // Cleanup on component unmount
    return () => clearInterval(interval);
  }, []);
  
  // Conditionally render a loading state for charts
  const renderCharts = () => {
    if (!recharts) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 h-96 flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">Loading chart...</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 h-96 flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">Loading chart...</p>
            </div>
        </div>
      );
    }
    
    // Once loaded, destructure and render the charts
    const { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-96 dark:bg-slate-800 dark:border-slate-700">
            <h4 className="font-bold text-lg text-slate-700 mb-4 dark:text-slate-200">Monthly Revenue (in ₹1000s)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#4F46E5" name="Revenue (₹)" />
                </BarChart>
            </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-96 dark:bg-slate-800 dark:border-slate-700">
            <h4 className="font-bold text-lg text-slate-700 mb-4 dark:text-slate-200">Daily Passenger Volume</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={passengerVolumeData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="passengers" stroke="#10b981" strokeWidth={2} name="Passengers" />
                </LineChart>
            </ResponsiveContainer>
            </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
      </div>

      {/* Charts */}
      {renderCharts()}
    </div>
  );
};

export default Dashboard;