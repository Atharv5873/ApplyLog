import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Timeline() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://127.0.0.1:8000/applications/?skip=0&limit=1000')
      .then(res => res.json())
      .then(data => {
        setApplications(data || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch applications');
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

  const getStatusIcon = (status) => {
    const icons = {
      applied: '📤',
      test: '📝',
      interview: '🎯',
      offer: '🎉',
      rejected: '❌',
      withdrawn: '🚫'
    };
    return icons[status] || '📋';
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(app => app.status === filter);
    }

    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const cutoffDate = new Date(now - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(app => new Date(app.date_applied) >= cutoffDate);
    }

    return filtered;
  };

  const groupApplicationsByDate = (apps) => {
    const grouped = {};
    
    apps.forEach(app => {
      const date = app.date_applied;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(app);
    });

    // Sort dates in descending order (newest first)
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({
        date,
        applications: grouped[date].sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated))
      }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="main-content-improved space-y-relaxed">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white text-lg">Loading timeline...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content-improved space-y-relaxed">
        <div className="flex items-center justify-center min-h-96">
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
      </div>
    );
  }

  const filteredApps = filterApplications();
  const groupedApps = groupApplicationsByDate(filteredApps);

  return (
    <div className="main-content-improved space-y-relaxed">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Application Timeline</h1>
          <p className="text-gray-400">Chronological view of your job search journey</p>
        </div>
        <button 
          onClick={() => navigate('/applications/new')}
          className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover-lift"
        >
          <span>➕</span> Add Application
        </button>
      </div>

      {/* Filters */}
      <div className="card card-spaced">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-3 input-glass rounded-xl"
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="test">Test Phase</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-3 input-glass rounded-xl"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {groupedApps.length > 0 ? (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="space-y-8">
            {groupedApps.map(({ date, applications }) => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                  <div className="card card-spaced flex-1">
                    <h3 className="text-xl font-bold text-white">{formatDate(date)}</h3>
                    <p className="text-gray-400">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Applications for this date */}
                <div className="ml-16 space-y-4">
                  {applications.map(app => (
                    <div 
                      key={app._id}
                      onClick={() => navigate(`/applications/${app._id}`)}
                      className="card card-spaced hover-lift cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getStatusIcon(app.status)}</span>
                            <div>
                              <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                {app.role}
                              </h4>
                              <p className="text-gray-400">{app.company_name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="capitalize">{app.category.replace('_', ' ')}</span>
                            {app.last_updated && (
                              <span>Updated {getTimeAgo(app.last_updated)}</span>
                            )}
                          </div>

                          {/* Additional info badges */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {app.notes && (
                              <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">📝 Has notes</span>
                            )}
                            {app.important_dates && Object.keys(app.important_dates).length > 0 && (
                              <span className="text-xs bg-blue-500/20 px-2 py-1 rounded text-blue-400">
                                📅 {Object.keys(app.important_dates).length} important date{Object.keys(app.important_dates).length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {app.links && Object.keys(app.links).length > 0 && (
                              <span className="text-xs bg-green-500/20 px-2 py-1 rounded text-green-400">
                                🔗 {Object.keys(app.links).length} link{Object.keys(app.links).length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card card-spaced text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <div className="text-xl text-white mb-2">No applications found</div>
          <div className="text-gray-400 mb-6">
            {filter !== 'all' || timeRange !== 'all' 
              ? 'Try adjusting your filters to see more results.'
              : 'Start tracking your job applications to see your timeline here.'
            }
          </div>
          <button 
            onClick={() => navigate('/applications/new')}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Add Your First Application
          </button>
        </div>
      )}

      {/* Summary Stats */}
      {filteredApps.length > 0 && (
        <div className="card card-spaced">
          <h3 className="text-lg font-semibold text-white mb-4">Timeline Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{filteredApps.length}</div>
              <div className="text-gray-400 text-sm">Total Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {filteredApps.filter(app => app.status === 'offer').length}
              </div>
              <div className="text-gray-400 text-sm">Offers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {filteredApps.filter(app => app.status === 'interview').length}
              </div>
              <div className="text-gray-400 text-sm">Interviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {groupedApps.length}
              </div>
              <div className="text-gray-400 text-sm">Active Days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
