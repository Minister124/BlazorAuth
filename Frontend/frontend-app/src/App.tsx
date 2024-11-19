import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './components/layout/Navigation';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Welcome from './components/Welcome';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import './styles/animations.css';
import './App.css';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
                <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-indigo-50 to-white opacity-70"></div>
                <Navigation />
                <div className="pt-16 relative z-10"> {/* Add padding top to account for fixed navbar */}
                    <Routes>
                        <Route path="/" element={<Navigate to="/welcome" replace />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/dashboard"
                            element={
                                <RoleBasedRoute allowedRoles={['Admin']}>
                                    <Dashboard />
                                </RoleBasedRoute>
                            }
                        />
                        <Route
                            path="/welcome"
                            element={
                                <RoleBasedRoute allowedRoles={['Admin', 'User']}>
                                    <Welcome />
                                </RoleBasedRoute>
                            }
                        />
                    </Routes>
                </div>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    className="mt-16"
                />
            </div>
        </Router>
    );
}

export default App;
