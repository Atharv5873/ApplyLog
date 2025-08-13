import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'bg-gray-500' },
    { value: 'applied', label: 'Applied', color: 'status-applied' },
    { value: 'test', label: 'Test', color: 'status-test' },
    { value: 'interview', label: 'Interview', color: 'status-interview' },
    { value: 'offer', label: 'Offer', color: 'status-offer' },
    { value: 'rejected', label: 'Rejected', color: 'status-rejected' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'status-withdrawn' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'campus', label: '🎓 Campus' },
    { value: 'off_campus', label: '🌐 Off Campus' },
    { value: 'hackathon', label: '💻 Hackathon' },
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, searchTerm, statusFilter, categoryFilter, sortBy]);

  const fetchApplications = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/applications/?skip=0&limit=1000');
      const data = await res.json();
      setApplications(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch applications');
      setLoading(false);
    }
  };

  const filterAndSortApplications = () => {
    let filtered = applications.filter(app => {
      const matchesSearch = app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.date_applied) - new Date(b.date_applied);
        case 'date_desc':
          return new Date(b.date_applied) - new Date(a.date_applied);
        case 'company':
          return a.company_name.localeCompare(b.company_name);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredApps(filtered);
  };

  const handleDelete = async (id, companyName) => {
    if (window.confirm(`Delete application for ${companyName}?`)) {
      try {
        await fetch(`http://127.0.0.1:8000/applications/${id}`, { method: 'DELETE' });
        setApplications(applications.filter(app => app._id !== id));
      } catch (err) {
        console.error('Failed to delete application:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading applications...</div>
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
            onClick={fetchApplications}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-improved space-y-relaxed">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Applications</h1>
          <p className="text-gray-400">
            Manage and track all your job applications ({filteredApps.length} of {applications.length})
          </p>
        </div>
        <button 
          onClick={() => navigate('/applications/new')}
          className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover-lift"
        >
          <span>➕</span> Add Application
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card card-spaced">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-comfortable">{/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 input-glass rounded-xl text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 input-glass rounded-xl text-sm appearance-none"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-3 input-glass rounded-xl text-sm appearance-none"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 input-glass rounded-xl text-sm appearance-none"
            >
              <option value="date_desc" className="bg-gray-800">Latest First</option>
              <option value="date_asc" className="bg-gray-800">Oldest First</option>
              <option value="company" className="bg-gray-800">Company A-Z</option>
              <option value="status" className="bg-gray-800">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      {filteredApps.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <div className="text-gray-400 mb-4">
            {applications.length === 0 ? 'No applications found' : 'No applications match your filters'}
          </div>
          <button 
            onClick={() => navigate('/applications/new')}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Add Your First Application
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredApps.map((app, index) => (
            <div 
              key={app._id} 
              className="card p-6 hover-lift animate-slideInUp cursor-pointer"
              onClick={() => navigate(`/applications/${app._id}`)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Company Avatar */}
                  <div className={`w-16 h-16 rounded-xl ${getStatusColor(app.status)} flex items-center justify-center`}>
                    <span className="text-white font-bold text-xl">
                      {app.company_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Application Info */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{app.company_name}</h3>
                    <p className="text-gray-300 mb-2">{app.role}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="capitalize">{app.category.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{formatDate(app.date_applied)}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(app.status)}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end mt-1">
                      {app.notes && (
                        <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">📝 Notes</span>
                      )}
                      {app.important_dates && Object.keys(app.important_dates).length > 0 && (
                        <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">📅 Dates</span>
                      )}
                      {app.links && Object.keys(app.links).length > 0 && (
                        <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">🔗 Links</span>
                      )}
                    </div>
                    {app.last_updated && (
                      <div className="text-xs text-gray-500 mt-1">
                        Updated: {new Date(app.last_updated).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/applications/${app._id}/edit`);
                      }}
                      className="w-10 h-10 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-all"
                      title="Edit"
                    >
                      <span className="text-blue-400">✏️</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(app._id, app.company_name);
                      }}
                      className="w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all"
                      title="Delete"
                    >
                      <span className="text-red-400">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
