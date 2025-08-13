import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ApplicationDetails() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/applications/${id}`)
      .then(res => res.json())
      .then(data => {
        setApp(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch application');
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete application for ${app.company_name}?`)) {
      return;
    }
    
    setDeleting(true);
    try {
      await fetch(`http://127.0.0.1:8000/applications/${id}`, { method: 'DELETE' });
      navigate('/applications');
    } catch (err) {
      console.error('Failed to delete application:', err);
      setDeleting(false);
    }
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

  const getCategoryIcon = (category) => {
    const icons = {
      campus: '🎓',
      off_campus: '🌐',
      hackathon: '💻'
    };
    return icons[category] || '📁';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading application details...</div>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error || 'Application not found'}</div>
          <button 
            onClick={() => navigate('/applications')}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ml-64 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/applications')}
            className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <span className="text-white text-xl">←</span>
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Application Details</h1>
            <p className="text-gray-400">View and manage your application information</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Company Info Card */}
          <div className="lg:col-span-2 card p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className={`w-20 h-20 rounded-2xl ${getStatusColor(app.status)} flex items-center justify-center`}>
                <span className="text-white font-bold text-3xl">
                  {app.company_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{app.company_name}</h2>
                <p className="text-xl text-gray-300 mb-1">{app.role}</p>
                <div className="flex items-center gap-2 text-gray-400">
                  <span>{getCategoryIcon(app.category)}</span>
                  <span className="capitalize">{app.category.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Current Status</h3>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl ${getStatusColor(app.status)}`}>
                  <span className="text-2xl">{getStatusIcon(app.status)}</span>
                  <span className="text-white font-semibold text-lg capitalize">
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">
                  Applied {getDaysAgo(app.date_applied)}
                </div>
              </div>
            </div>

            {/* Application Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Application Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm">📅</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Application Submitted</div>
                    <div className="text-gray-400 text-sm">{formatDate(app.date_applied)}</div>
                  </div>
                </div>
                
                {app.status !== 'applied' && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className={`w-10 h-10 rounded-full ${getStatusColor(app.status)} flex items-center justify-center`}>
                      <span className="text-white text-sm">{getStatusIcon(app.status)}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Status Updated</div>
                      <div className="text-gray-400 text-sm capitalize">{app.status.replace('_', ' ')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Important Dates Section */}
            {app.important_dates && Object.keys(app.important_dates).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Important Dates 📅</h3>
                <div className="space-y-3">
                  {Object.entries(app.important_dates).map(([event, date]) => (
                    <div key={event} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                          <span className="text-white font-medium">{event}</span>
                        </div>
                        <span className="text-gray-400">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links Section */}
            {app.links && Object.keys(app.links).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Important Links 🔗</h3>
                <div className="space-y-3">
                  {Object.entries(app.links).map(([name, url]) => (
                    <div key={name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                          <span className="text-white font-medium">{name}</span>
                        </div>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                        >
                          <span>Open</span>
                          <span>↗</span>
                        </a>
                      </div>
                      <div className="mt-2 pl-6">
                        <span className="text-gray-400 text-sm break-all">{url}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {app.notes && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Notes & Information</h3>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-300 whitespace-pre-wrap">{app.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate(`/applications/${id}/edit`)}
                  className="w-full btn-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <span>✏️</span> Edit Application
                </button>
                
                <button 
                  onClick={() => navigate('/applications/new')}
                  className="w-full btn-secondary py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <span>➕</span> Add New Application
                </button>
                
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span> Delete Application
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Application Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Application Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date Applied</span>
                  <span className="text-white font-medium">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(app.date_applied))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white font-medium capitalize">{app.category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Days Since Applied</span>
                  <span className="text-white font-medium">{getDaysAgo(app.date_applied).split(' ')[0]}</span>
                </div>
                {app.last_updated && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white font-medium">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(app.last_updated))}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
