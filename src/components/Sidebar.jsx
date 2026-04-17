import React, {
    useState,
    // useEffect,
    forwardRef,
    // useImperativeHandle
} from 'react';
import {
    FaAngleDoubleLeft,
    // FaFileContract,
    FaChartBar,
    FaUser,
} from 'react-icons/fa';
// import { toast } from 'react-toastify';

const Sidebar = forwardRef(({ isCollapsed, toggleSidebar, onNavigate }, ref) => { // onSelectContract,
    // const [isExpanded, setIsExpanded] = useState(false);
    const [isCustomerExpanded, setIsCustomerExpanded] = useState(false);
    const [isAgingExpanded, setIsAgingExpanded] = useState(false);
    // const [contracts, setContracts] = useState([]);

    // const fetchContracts = async () => {
    //     try {
    //         const response = await fetch('http://localhost:5000/api/demand-contracts');
    //         const data = await response.json();
    //         setContracts(data);
    //     } catch (err) {
    //         toast.error('Error fetching contracts');
    //     }
    // };

    // useImperativeHandle(ref, () => ({
    //     refresh: fetchContracts
    // }));

    // useEffect(() => {
    //     fetchContracts();
    // }, []);

    return (
        <>
            {!isCollapsed && (
                <div className="h-screen bg-gradient-to-r from-[#292E49] to-[#536976] text-white p-4 fixed top-0 left-0 transition-all duration-300 w-56">
                    {/* Top Brand */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => onNavigate('')}
                            className="text-sm font-bold font-serif flex items-center hover:text-gray-300 focus:outline-none"
                        >
                            <img src="/logo.png" alt="Logo" className="h-10 mr-2" />
                            FiveStar Plastic
                        </button>
                        <button onClick={toggleSidebar} className="text-white text-xl">
                            <FaAngleDoubleLeft />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        {/* Customer Dropdown */}
                        <button
                            onClick={() => setIsCustomerExpanded(!isCustomerExpanded)}
                            className="flex items-center w-full text-left text-white hover:text-gray-300"
                        >
                            <FaUser className="text-lg mr-2" />
                            <span>Customer</span>
                        </button>

                        <div
                            className={`ml-6 mt-1 space-y-1 text-sm overflow-hidden transition-all duration-300 ease-in-out ${isCustomerExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <span
                                onClick={() => onNavigate('ledger')}
                                className="block cursor-pointer hover:text-gray-300 p-1 ml-4"
                            >
                                Ledger
                            </span>

                            {/* Aging Nested Dropdown */}
                            <div>
                                <button
                                    onClick={() => setIsAgingExpanded(!isAgingExpanded)}
                                    className="flex items-center text-white w-full text-left hover:text-gray-300 p-1 ml-4"
                                >
                                    <span>Aging</span>
                                </button>

                                <div
                                    className={`ml-3 mt-1 space-y-1 text-sm overflow-hidden transition-all duration-300 ease-in-out ${isAgingExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <span
                                        onClick={() => onNavigate('agingreceivable')}
                                        className="block cursor-pointer hover:text-gray-300 p-1 ml-4"
                                    >
                                        Receivable
                                    </span>
                                    <span
                                        onClick={() => onNavigate('agingpayable')}
                                        className="block cursor-pointer hover:text-gray-300 p-1 ml-4"
                                    >
                                        Payable
                                    </span>
                                    <span
                                        onClick={() => onNavigate('receivablesummary')}
                                        className="block cursor-pointer hover:text-gray-300 p-1 ml-4"
                                    >
                                        Receivable Summary
                                    </span>
                                    <span
                                        onClick={() => onNavigate('payablesummary')}
                                        className="block cursor-pointer hover:text-gray-300 p-1 ml-4"
                                    >
                                        Payable Summary
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sales Report */}
                        <button
                            onClick={() => onNavigate('salesreport')}
                            className="flex items-center w-full text-left text-white hover:text-gray-300"
                        >
                            <FaChartBar className="text-lg mr-2" />
                            <span>Sales Report</span>
                        </button>

                        {/* Demand Contracts */}
                        {/* <button
                            onClick={() => {
                                setIsExpanded(prev => !prev);
                                onNavigate('demand');
                            }}
                            className="flex items-center w-full text-left text-white hover:text-gray-300"
                        >
                            <FaFileContract className="text-lg mr-2" />
                            <span>Demand Contract</span>
                        </button>

                        {isExpanded && (
                            <div className="ml-6 mt-1 space-y-1 text-sm">
                                {contracts.length > 0 ? (
                                    contracts.map((contract) => (
                                        <span
                                            key={contract.id}
                                            onClick={() => onSelectContract(contract.id)}
                                            className="block cursor-pointer hover:text-gray-300"
                                        >
                                            {contract.id}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-300 italic">No contracts found</span>
                                )}
                            </div>
                        )} */}



                    </nav>
                </div>
            )}
        </>
    );
});

export default Sidebar;
