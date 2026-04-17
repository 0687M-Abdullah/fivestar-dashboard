import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaAngleDoubleRight } from 'react-icons/fa';

const Navbar = ({ isCollapsed, pageTitle = "Dashboard" }) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSidebarToggle = () => {
        window.dispatchEvent(new CustomEvent('toggleSidebar'));
    };

    return (
        <div
            className={`fixed top-0 right-0 h-16 bg-white flex items-center justify-between px-6 z-10 transition-all duration-300 ${
                isCollapsed ? 'left-0' : 'left-64'
            }`}
        >
            {/* Expand icon shown when sidebar is collapsed */}
            {isCollapsed && (
                <button
                    onClick={handleSidebarToggle}
                    className="text-gray-600 hover:text-black text-xl absolute left-4"
                >
                    <FaAngleDoubleRight />
                </button>
            )}

            <h1 className="text-xl font-semibold ml-8">{pageTitle}</h1>

            <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
                <button
                    onClick={toggleFullscreen}
                    className="text-gray-600 hover:text-black text-lg"
                    title="Toggle Fullscreen"
                >
                    ⛶
                </button>

                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        title="Profile"
                    >
                        <FaUserCircle className="text-gray-700 text-2xl" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow-lg border z-20">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
