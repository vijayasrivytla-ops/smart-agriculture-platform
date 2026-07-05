import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

function Navigation() {
  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Leaf size={32} />
            Smart Agriculture
          </Link>
          <ul className="flex gap-6">
            <li><Link to="/" className="hover:text-green-200">Dashboard</Link></li>
            <li><Link to="/disease-detection" className="hover:text-green-200">Disease Detection</Link></li>
            <li><Link to="/yield-prediction" className="hover:text-green-200">Yield Prediction</Link></li>
            <li><Link to="/soil-analysis" className="hover:text-green-200">Soil Analysis</Link></li>
            <li><Link to="/farmer-chat" className="hover:text-green-200">Farmer Chat</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;