import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PolicyList from './pages/PolicyList';
import PolicyForm from './pages/PolicyForm';
import ProfitDashboard from './pages/ProfitDashboard';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
    const { user, loading } = React.useContext(AuthContext);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/policies" element={<PrivateRoute><PolicyList /></PrivateRoute>} />
                <Route path="/policies/new" element={<PrivateRoute><PolicyForm /></PrivateRoute>} />
                <Route path="/policies/view/:id" element={<PrivateRoute><PolicyForm isViewMode={true} /></PrivateRoute>} />
                <Route path="/policies/edit/:id" element={<PrivateRoute><PolicyForm /></PrivateRoute>} />
                <Route path="/profit" element={<PrivateRoute><ProfitDashboard /></PrivateRoute>} />
                <Route path="/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
