import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ApplicationForm({ isEdit = false, initialData = {} }) {
  const categoryOptions = [
    { value: 'campus', label: 'Campus Placement', icon: '🎓' },
    { value: 'off_campus', label: 'Off Campus', icon: '🌐' },
    { value: 'hackathon', label: 'Hackathon', icon: '💻' },
  ];
  
  const statusOptions = [
    { value: 'applied', label: 'Applied', icon: '📤', color: 'status-applied' },
    { value: 'test', label: 'Test Phase', icon: '📝', color: 'status-test' },
    { value: 'interview', label: 'Interview', icon: '🎯', color: 'status-interview' },
    { value: 'offer', label: 'Offer Received', icon: '🎉', color: 'status-offer' },
    { value: 'rejected', label: 'Rejected', icon: '❌', color: 'status-rejected' },
    { value: 'withdrawn', label: 'Withdrawn', icon: '🚫', color: 'status-withdrawn' },
  ];

  const [form, setForm] = useState({
    company_name: initialData.company_name || '',
    role: initialData.role || '',
    category: initialData.category || categoryOptions[0].value,
    status: initialData.status || statusOptions[0].value,
    date_applied: initialData.date_applied || (isEdit ? '' : new Date().toISOString().split('T')[0]),
    notes: initialData.notes || '',
  });
  const [importantDates, setImportantDates] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Load existing data for edit mode
  useEffect(() => {
    if (isEdit && id) {
      fetch(`http://127.0.0.1:8000/applications/${id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            company_name: data.company_name || '',
            role: data.role || '',
            category: data.category || categoryOptions[0].value,
            status: data.status || statusOptions[0].value,
            date_applied: data.date_applied || '',
            notes: data.notes || '',
          });
          
          // Convert objects to arrays for easier editing
          if (data.important_dates) {
            const datesArray = Object.entries(data.important_dates).map(([name, date]) => ({
              id: Math.random().toString(36).substr(2, 9),
              name,
              date
            }));
            setImportantDates(datesArray);
          }
          
          if (data.links) {
            const linksArray = Object.entries(data.links).map(([name, url]) => ({
              id: Math.random().toString(36).substr(2, 9),
              name,
              url
            }));
            setLinks(linksArray);
          }
          
          setLastUpdated(data.last_updated);
        })
        .catch(err => {
          setError('Failed to load application data');
          console.error(err);
        });
    }
  }, [isEdit, id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  }

  function updateImportantDate(id, field, value) {
    setImportantDates(importantDates.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  function updateLink(id, field, value) {
    setLinks(links.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  function addImportantDate() {
    setImportantDates([...importantDates, {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      date: ''
    }]);
  }

  function addLink() {
    setLinks([...links, {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      url: ''
    }]);
  }

  function removeImportantDate(id) {
    setImportantDates(importantDates.filter(item => item.id !== id));
  }

  function removeLink(id) {
    setLinks(links.filter(item => item.id !== id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare form data
      const formData = { ...form };
      
      // Convert arrays back to objects for API
      const important_dates = {};
      importantDates.forEach(item => {
        if (item.name.trim() && item.date) {
          important_dates[item.name.trim()] = item.date;
        }
      });
      
      const linksObj = {};
      links.forEach(item => {
        if (item.name.trim() && item.url.trim()) {
          linksObj[item.name.trim()] = item.url.trim();
        }
      });
      
      // Add to form data
      if (Object.keys(important_dates).length > 0) {
        formData.important_dates = important_dates;
      }
      if (Object.keys(linksObj).length > 0) {
        formData.links = linksObj;
      }
      
      // For new applications, ensure date_applied is set
      if (!isEdit && !formData.date_applied) {
        formData.date_applied = new Date().toISOString().split('T')[0];
      }
      
      // For updates, only send changed fields and don't require date_applied
      let payload = formData;
      if (isEdit) {
        // Only send non-empty fields for updates
        payload = Object.fromEntries(
          Object.entries(formData).filter(([key, value]) => 
            value !== '' && value !== null && value !== undefined
          )
        );
      }
      
      const url = isEdit
        ? `http://127.0.0.1:8000/applications/${id}`
        : 'http://127.0.0.1:8000/applications/';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        let msg = 'Failed to save application';
        try {
          const data = await res.json();
          msg = data.detail || msg;
        } catch (e) {
          // Not JSON, keep default
        }
        setError(msg);
        console.error('Save error:', res.status, msg);
        return;
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/applications');
      }, 1500);
      
    } catch (err) {
      setError(err.message);
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  }

  const currentStatus = statusOptions.find(s => s.value === form.status);
  const currentCategory = categoryOptions.find(c => c.value === form.category);

  return (
    <div className="min-h-screen ml-64 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/applications')}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <span className="text-white">←</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{isEdit ? 'Edit' : 'Add New'} Application</h1>
              <p className="text-gray-400">
                {isEdit ? 'Update your application details' : 'Track a new job application'}
              </p>
              {isEdit && lastUpdated && (
                <p className="text-gray-500 text-sm mt-1">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 animate-slideInUp">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Application {isEdit ? 'updated' : 'added'} successfully! Redirecting...</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-8">
            {/* Company & Role */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter company name"
                  className="w-full p-4 input-glass rounded-xl transition-all focus:scale-105"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Role/Position *
                </label>
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  placeholder="Enter job role"
                  className="w-full p-4 input-glass rounded-xl transition-all focus:scale-105"
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Category *
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full p-4 input-glass rounded-xl appearance-none transition-all focus:scale-105"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="text-gray-400">▼</span>
                  </div>
                </div>
                {/* Category Preview */}
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                  <span>{currentCategory?.icon}</span>
                  <span>{currentCategory?.label}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Status *
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                    className="w-full p-4 input-glass rounded-xl appearance-none transition-all focus:scale-105"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="text-gray-400">▼</span>
                  </div>
                </div>
                {/* Status Preview */}
                <div className="mt-2 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentStatus?.color}`}></div>
                  <span className="text-sm text-gray-400">{currentStatus?.label}</span>
                </div>
              </div>
            </div>

            {/* Date Applied */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Date Applied {isEdit ? '' : '*'}
              </label>
              <input
                type="date"
                name="date_applied"
                value={form.date_applied}
                onChange={handleChange}
                required={!isEdit}
                className="w-full p-4 input-glass rounded-xl transition-all focus:scale-105"
              />
              {isEdit && (
                <p className="text-gray-500 text-xs mt-1">
                  Leave empty to keep original date
                </p>
              )}
            </div>

            {/* Important Dates */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-4">
                Important Dates 📅
              </label>
              <div className="space-y-3">
                {importantDates.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Event name (e.g., Interview, Test)"
                      value={item.name}
                      onChange={(e) => updateImportantDate(item.id, 'name', e.target.value)}
                      className="flex-1 p-3 input-glass rounded-xl text-sm"
                    />
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => updateImportantDate(item.id, 'date', e.target.value)}
                      className="p-3 input-glass rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImportantDate(item.id)}
                      className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 rounded-xl flex items-center justify-center transition-all"
                    >
                      <span className="text-red-400">✕</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImportantDate}
                  className="w-full p-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all"
                >
                  + Add Important Date
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-4">
                Important Links 🔗
              </label>
              <div className="space-y-3">
                {links.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Link name (e.g., Job Posting, Company Site)"
                      value={item.name}
                      onChange={(e) => updateLink(item.id, 'name', e.target.value)}
                      className="flex-1 p-3 input-glass rounded-xl text-sm"
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={item.url}
                      onChange={(e) => updateLink(item.id, 'url', e.target.value)}
                      className="flex-1 p-3 input-glass rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(item.id)}
                      className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 rounded-xl flex items-center justify-center transition-all"
                    >
                      <span className="text-red-400">✕</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLink}
                  className="w-full p-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all"
                >
                  + Add Link
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Notes & Additional Information
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Add any notes, interview details, or additional information..."
                rows={4}
                className="w-full p-4 input-glass rounded-xl transition-all focus:scale-105 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => navigate('/applications')}
                className="btn-secondary px-6 py-3 rounded-xl font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : success ? (
                  <>
                    <span>✅</span>
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <span>{isEdit ? '💾' : '➕'}</span>
                    <span>{isEdit ? 'Update' : 'Add'} Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
