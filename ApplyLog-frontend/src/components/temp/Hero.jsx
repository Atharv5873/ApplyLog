import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
    const navigate = useNavigate();
    
    return (
        <section className="pt-16 pb-8 px-4 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">Job Application Tracker</h1>
                
                <div className="flex flex-wrap justify-center gap-4">
                    <button 
                        onClick={() => navigate('/applications/new')} 
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow flex items-center gap-2 hover:bg-blue-700"
                    >
                        <span>➕</span> Add Application
                    </button>
                    <button 
                        onClick={() => navigate('/applications')} 
                        className="px-6 py-3 bg-gray-700 text-white rounded-lg shadow flex items-center gap-2 hover:bg-gray-800"
                    >
                        <span>📋</span> View All
                    </button>
                    <button 
                        onClick={() => navigate('/stats')} 
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow flex items-center gap-2 hover:bg-purple-700"
                    >
                        <span>📊</span> Stats
                    </button>
                </div>
            </div>
        </section>
    );
}
