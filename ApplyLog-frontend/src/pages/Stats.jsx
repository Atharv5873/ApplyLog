import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/applications/stats`).then(res => res.json()),
      fetch(`${API_BASE}/applications/?skip=0&limit=1000`).then(res => res.json()),
    ]).then(([statsData, appsData]) => {
      setStats(statsData.counts);
      setApplications(appsData);
      setLoading(false);
    }).catch(err => {
      setError('Failed to fetch stats');
      setLoading(false);
    });
  }, []);

  const calculateMetrics = () => {
    if (!applications.length) return null;

    const now = new Date();
    let filteredApps = applications;

    // Filter by timeframe
    if (timeframe !== 'all') {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const cutoffDate = new Date(now - days * 24 * 60 * 60 * 1000);
      filteredApps = applications.filter(app => new Date(app.date_applied) >= cutoffDate);
    }

    const statusCounts = {};
    const categoryCounts = {};
    let totalApplications = filteredApps.length;

    filteredApps.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      categoryCounts[app.category] = (categoryCounts[app.category] || 0) + 1;
    });

    const responseRate = totalApplications > 0 ? 
      Math.round(((statusCounts.interview || 0) + (statusCounts.offer || 0)) / totalApplications * 100) : 0;
    
    const successRate = totalApplications > 0 ? 
      Math.round((statusCounts.offer || 0) / totalApplications * 100) : 0;

    const rejectionRate = totalApplications > 0 ? 
      Math.round((statusCounts.rejected || 0) / totalApplications * 100) : 0;

    return {
      totalApplications,
      statusCounts,
      categoryCounts,
      responseRate,
      successRate,
      rejectionRate,
      filteredApps
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'status-applied',
      test: 'status-test',
      interview: 'status-interview',
      offer: 'status-offer',
      rejected: 'status-rejected',
      withdrawn: 'status-withdrawn'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getApplicationTrend = () => {
    if (!applications.length) return [];
    
    const last30Days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // More flexible date matching - handle different date formats
      const count = applications.filter(app => {
        if (!app.date_applied) return false;
        
        // Convert app date to YYYY-MM-DD format for comparison
        let appDateStr;
        try {
          const appDate = new Date(app.date_applied);
          appDateStr = appDate.toISOString().split('T')[0];
        } catch (e) {
          return false;
        }
        
        return appDateStr === dateStr;
      }).length;
      
      last30Days.push({ date: dateStr, count });
    }
    
    return last30Days;
  };

  if (loading) {
    return (
      <div className="min-h-screen ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();
  const trend = getApplicationTrend();

  return (
    <div className="main-content-improved space-y-relaxed">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Insights into your job application journey</p>
        </div>
        
        {/* Timeframe Filter */}
        <div className="flex items-center gap-4">
          <div className="flex bg-white/10 rounded-xl p-1">
            {[
              { value: 'all', label: 'All Time' },
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeframe === option.value 
                    ? 'bg-white text-gray-900' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {metrics ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard 
              title="Total Applications" 
              value={metrics.totalApplications} 
              subtitle={timeframe === 'all' ? 'All time' : `Last ${timeframe}`}
              icon="📊"
              gradient="from-blue-500 to-purple-600"
            />
            <MetricCard 
              title="Response Rate" 
              value={`${metrics.responseRate}%`} 
              subtitle="Interviews + Offers"
              icon="📈"
              gradient="from-green-500 to-emerald-600"
            />
            <MetricCard 
              title="Success Rate" 
              value={`${metrics.successRate}%`} 
              subtitle="Offers received"
              icon="🎉"
              gradient="from-yellow-500 to-orange-600"
            />
            <MetricCard 
              title="Rejection Rate" 
              value={`${metrics.rejectionRate}%`} 
              subtitle="Rejected applications"
              icon="📉"
              gradient="from-red-500 to-pink-600"
            />
          </div>

          {/* Charts and Breakdowns */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            
            {/* Status Breakdown */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-white mb-6">Status Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(metrics.statusCounts).map(([status, count]) => {
                  const percentage = Math.round((count / metrics.totalApplications) * 100) || 0;
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                          <span className="text-gray-300 capitalize">{status.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{count}</span>
                          <span className="text-gray-400 text-sm">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full ${getStatusColor(status)} transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-white mb-6">Category Distribution</h3>
              <div className="space-y-4">
                {Object.entries(metrics.categoryCounts).map(([category, count]) => {
                  const percentage = Math.round((count / metrics.totalApplications) * 100) || 0;
                  const categoryIcons = {
                    campus: '🎓',
                    off_campus: '🌐', 
                    hackathon: '💻'
                  };
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{categoryIcons[category]}</span>
                          <span className="text-gray-300 capitalize">{category.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{count}</span>
                          <span className="text-gray-400 text-sm">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Application Trend */}
          <div className="card p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">Application Activity (Last 30 Days)</h3>
            
            {/* Debug info */}
            <div className="text-xs text-gray-500 mb-4">
              Total apps: {applications.length} | Trend data points: {trend.length} | 
              Max count: {Math.max(...trend.map(d => d.count), 0)}
            </div>
            
            <div className="flex items-end gap-1 h-32 bg-gray-800/30 rounded-lg p-2">
              {trend.length > 0 ? trend.map((day, index) => {
                const maxCount = Math.max(...trend.map(d => d.count)) || 1;
                const height = day.count > 0 ? Math.max((day.count / maxCount) * 90, 8) : 4;
                
                return (
                  <div 
                    key={index}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t opacity-70 hover:opacity-100 transition-all group relative"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {new Date(day.date).toLocaleDateString()}: {day.count} applications
                    </div>
                  </div>
                );
              }) : (
                <div className="flex-1 text-gray-400 text-center py-8">
                  No application data available for the chart
                </div>
              )}
            </div>
            <div className="text-gray-400 text-sm mt-2 text-center">
              Daily application submissions over the past month
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/applications/new')}
                className="btn-primary px-6 py-3 rounded-xl font-medium flex items-center gap-2"
              >
                <span>➕</span> Add New Application
              </button>
              <button 
                onClick={() => navigate('/applications')}
                className="btn-secondary px-6 py-3 rounded-xl font-medium flex items-center gap-2"
              >
                <span>📋</span> View All Applications
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-gray-400 mb-4">No applications found</div>
          <button 
            onClick={() => navigate('/applications/new')}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Add Your First Application
          </button>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, gradient }) {
  return (
    <div className="card p-6 hover-lift">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className="text-gray-400 text-sm">{title}</div>
        </div>
      </div>
      <div className="text-gray-300 text-sm">{subtitle}</div>
    </div>
  );
}
