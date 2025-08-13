import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [stats, setStats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({});
  const [totalApplications, setTotalApplications] = useState(0);
  const [progressData, setProgressData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/applications/stats').then(res => res.json()),
      fetch('http://127.0.0.1:8000/applications/?skip=0&limit=10').then(res => res.json()),
    ]).then(([statsData, recentData]) => {
      const counts = statsData.counts || [];
      setStats(counts);
      
      // Calculate status totals and progress metrics
      const statusTotals = {};
      let total = 0;
      counts.forEach(item => {
        const status = item._id.status;
        statusTotals[status] = (statusTotals[status] || 0) + item.count;
        total += item.count;
      });
      
      // Calculate progress percentages
      const progress = {
        applied: Math.round(((statusTotals.applied || 0) / total) * 100) || 0,
        interview: Math.round(((statusTotals.interview || 0) / total) * 100) || 0,
        offer: Math.round(((statusTotals.offer || 0) / total) * 100) || 0,
        conversionRate: total > 0 ? Math.round(((statusTotals.offer || 0) / total) * 100) : 0
      };
      
      setStatusCounts(statusTotals);
      setTotalApplications(total);
      setProgressData(progress);
      setRecent(recentData || []);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching data:", err);
      setLoading(false);
    });
  }, []);

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-improved space-y-relaxed">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, Atharv! Track your job search progress</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/applications/new')}
            className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover-lift"
          >
            <span>➕</span> Add Application
          </button>
          <button 
            onClick={() => navigate('/applications')}
            className="btn-secondary px-6 py-3 rounded-xl font-semibold hover-lift"
          >
            View All Applications
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-relaxed">
        <StatCard 
          title="Total Applications" 
          value={totalApplications} 
          subtitle="All time" 
          icon="📊"
          gradient="from-blue-500 to-purple-600"
          progress={100}
        />
        <StatCard 
          title="Applied" 
          value={statusCounts.applied || 0} 
          subtitle={`${progressData.applied}% of total`}
          icon="📤"
          gradient="from-purple-500 to-pink-600"
          progress={progressData.applied}
        />
        <StatCard 
          title="Interviews" 
          value={statusCounts.interview || 0} 
          subtitle={`${progressData.interview}% conversion`}
          icon="🎯"
          gradient="from-cyan-500 to-blue-600"
          progress={progressData.interview}
        />
        <StatCard 
          title="Offers" 
          value={statusCounts.offer || 0} 
          subtitle={`${progressData.conversionRate}% success rate`}
          icon="🎉"
          gradient="from-green-500 to-emerald-600"
          progress={progressData.offer}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 grid-relaxed">
        
        {/* Recent Applications */}
        <div className="lg:col-span-2 card card-spaced">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Applications</h3>
            <button 
              onClick={() => navigate('/applications')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium hover-lift"
            >
              View all →
            </button>
          </div>
          
          {recent.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <div className="text-gray-400 mb-4">No applications yet</div>
              <button 
                onClick={() => navigate('/applications/new')}
                className="btn-primary px-6 py-3 rounded-xl"
              >
                Add Your First Application
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((app, index) => (
                <div 
                  key={app._id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer hover-lift animate-slideInUp border border-white/10"
                  onClick={() => navigate(`/applications/${app._id}`)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getStatusColor(app.status)} flex items-center justify-center`}>
                      <span className="text-white font-bold">
                        {app.company_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{app.company_name}</div>
                      <div className="text-gray-400 text-sm">{app.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">{formatDate(app.date_applied)}</div>
                    </div>
                    <div className="text-gray-400">→</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Status Overview</h3>
          
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">{status}</span>
                  <span className="text-white font-bold">{count}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${getStatusColor(status)} transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${totalApplications > 0 ? (count / totalApplications) * 100 : 0}%`,
                      animationDelay: '0.5s'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 space-y-3">
            <div className="text-gray-400 text-sm font-medium">Quick Actions</div>
            <button 
              onClick={() => navigate('/applications/new')}
              className="w-full btn-primary py-3 rounded-xl text-sm"
            >
              Add New Application
            </button>
            <button 
              onClick={() => navigate('/stats')}
              className="w-full btn-secondary py-3 rounded-xl text-sm"
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, gradient, progress }) {
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
      
      <div className="space-y-2">
        <div className="text-gray-300 text-sm">{subtitle}</div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
