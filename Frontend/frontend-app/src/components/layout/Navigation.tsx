import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import type { RootState, AppDispatch } from '../../store';
import '../../styles/animations.css';

export default function Navigation() {
    const dispatch = useDispatch<AppDispatch>();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <nav className="glass-effect fixed w-full z-50 top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold gradient-text hover-scale">
                                BlazorAuth
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-6 animate-fade-in">
                                {user?.role === 'Admin' && (
                                    <Link
                                        to="/dashboard"
                                        className="nav-link relative text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-all hover-scale"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <Link
                                    to="/welcome"
                                    className="nav-link relative text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-all hover-scale"
                                >
                                    Welcome
                                </Link>
                                <div className="relative ml-3 flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700">
                                                {user?.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {user?.role}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="gradient-bg text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover-scale"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4 animate-fade-in">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-all hover-scale"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="gradient-bg text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-all hover-scale"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
