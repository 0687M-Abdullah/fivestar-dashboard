import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../data/URL';

const LoginForm = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // start loading

        try {
            // const response = await fetch('https://fivestar-cgyj.onrender.com/api/auth/login', 
            const response = await fetch(`${BASE_URL}auth/login`, 
                {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Login Successful");
                localStorage.setItem('token', data.token);

                navigate('/dashboard');
            } else {
                toast.error("Invalid Credientials");
            }
        } catch (error) {
            toast.warn('Something went wrong. Please try again.');
        } finally {
            setLoading(false); // stop loading in all cases
        }
    };


    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background:
                    'linear-gradient(90deg, rgb(34, 105, 132) 0%, rgb(64, 158, 103) 50%, rgb(50, 95, 153) 100%)',
            }}
        >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex w-full max-w-4xl">
                <div className="hidden md:block md:w-1/2">
                    <img
                        src="/fivestar-dashboard/authentication.jpg"
                        alt="Authentication"
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="w-full md:w-1/2 p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-2 text-white rounded-lg transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                            style={{
                                background: loading
                                    ? 'gray'
                                    : 'linear-gradient(90deg, rgb(34, 105, 132) 0%, rgb(64, 158, 103) 50%, rgb(50, 95, 153) 100%)',
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>

    );
};

export default LoginForm;
