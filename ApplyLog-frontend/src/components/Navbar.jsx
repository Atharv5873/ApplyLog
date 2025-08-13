import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    const menuItems = [
        { path: '/', icon: '🏠', label: 'Dashboard', gradient: 'from-blue-500 to-purple-600' },
        { path: '/applications', icon: '📋', label: 'Applications', gradient: 'from-purple-500 to-pink-600' },
        { path: '/applications/new', icon: '➕', label: 'Add New', gradient: 'from-green-500 to-blue-600' },
        { path: '/stats', icon: '📊', label: 'Analytics', gradient: 'from-orange-500 to-red-600' },
        { path: '/timeline', icon: '📈', label: 'Timeline', gradient: 'from-cyan-500 to-blue-600' },
    ];
    
    const isActive = (path) => location.pathname === path;
    
    return (
        <>
            {/* Mobile overlay */}
            {!isCollapsed && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsCollapsed(true)}
                />
            )}
            
            {/* Sidebar */}
            <nav className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-16' : 'w-64'
            } glass-dark border-r border-white/10`}>
                
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="flex items-center gap-3">
                                <img 
                                    src="/applylog-high-resolution-logo-transparent.png" 
                                    alt="ApplyLog" 
                                    className="w-10 h-10 rounded-xl object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div 
                                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-blue-600 flex items-center justify-center animate-glow"
                                    style={{ display: 'none' }}
                                >
                                    <span className="text-white font-bold">AL</span>
                                </div>
                                <div>
                                    <h1 className="text-white font-bold text-lg">ApplyLog</h1>
                                    <p className="text-gray-400 text-xs">Atharv Sharma</p>
                                </div>
                            </div>
                        )}
                        {isCollapsed && (
                            <div className="flex flex-col items-center">
                                <img 
                                    src="/applylog-high-resolution-logo-transparent.png" 
                                    alt="ApplyLog" 
                                    className="w-8 h-8 rounded-lg mx-auto object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div 
                                    className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-blue-600 flex items-center justify-center animate-glow mx-auto"
                                    style={{ display: 'none' }}
                                >
                                    <span className="text-white font-bold text-sm">AL</span>
                                </div>
                            </div>
                        )}
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all ${isCollapsed ? 'absolute top-4 right-2' : ''}`}
                        >
                            <span className="text-white text-sm">{isCollapsed ? '→' : '←'}</span>
                        </button>
                    </div>
                </div>
                
                {/* Quick Stats - Only when expanded */}
                {!isCollapsed && (
                    <div className="p-4 border-b border-white/10">
                        <QuickStats />
                    </div>
                )}
                
                {/* Navigation Items */}
                <div className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative ${
                                isActive(item.path) 
                                    ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
                                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                            }`}
                        >
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            {!isCollapsed && (
                                <span className="font-medium">{item.label}</span>
                            )}
                            
                            {/* Active indicator */}
                            {isActive(item.path) && (
                                <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                            )}
                            
                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                
                {/* User Profile - Bottom */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 ${
                        isCollapsed ? 'justify-center' : ''
                    }`}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">👤</span>
                        </div>
                        {!isCollapsed && (
                            <div>
                                <div className="text-white text-sm font-medium">Atharv Sharma</div>
                                <div className="text-gray-400 text-xs">Job Seeker</div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}

function QuickStats() {
    const [stats, setStats] = useState({ total: 0, applied: 0, interview: 0, offer: 0 });
    
    useEffect(() => {
        // Fetch quick stats
        fetch('http://127.0.0.1:8000/applications/stats')
            .then(res => res.json())
            .then(data => {
                const counts = data.counts || [];
                const totals = {
                    total: counts.reduce((sum, item) => sum + item.count, 0),
                    applied: counts.filter(item => item._id.status === 'applied').reduce((sum, item) => sum + item.count, 0),
                    interview: counts.filter(item => item._id.status === 'interview').reduce((sum, item) => sum + item.count, 0),
                    offer: counts.filter(item => item._id.status === 'offer').reduce((sum, item) => sum + item.count, 0)
                };
                setStats(totals);
            })
            .catch(err => console.error('Failed to fetch stats:', err));
    }, []);
    
    return (
        <div className="space-y-3">
            <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">Quick Overview</div>
            <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.applied}</div>
                    <div className="text-xs text-gray-400">Applied</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{stats.interview}</div>
                    <div className="text-xs text-gray-400">Interview</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.offer}</div>
                    <div className="text-xs text-gray-400">Offers</div>
                </div>
            </div>
        </div>
    );
}
