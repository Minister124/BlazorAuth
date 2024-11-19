import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function Welcome() {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        Welcome, {user?.name}!
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Thank you for logging in. You are currently logged in as a {user?.role}.
                    </p>
                </div>
                
                <div className="mt-10">
                    <div className="rounded-lg bg-white shadow-lg px-5 py-6 sm:px-6">
                        <div className="h-96 rounded-lg border-4 border-dashed border-gray-200 flex items-center justify-center">
                            <div className="text-center">
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    User Dashboard
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    This is a protected area for authenticated users.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
