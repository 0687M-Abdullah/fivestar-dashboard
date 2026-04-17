import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
// import DemandDetails from '../../demandcontract/DemandDetails';
import Ledger from '../../ledger/Ledger';
import AgingReceivable from '../../aging/AgingReceivable';
import AgingPayable from '../../aging/AgingPayable';
import AgingPayableSummary from '../../aging/AgingPayableSummay';
import AgingReceivableSummary from '../../aging/AgingReceivableSummary';
import SalesReport from '../../sales/SalesReport';
// Dashboard links
import Graphs from '../Graphs';

const Dashboard = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedContractId, setSelectedContractId] = useState(null);
    const [activePage, setActivePage] = useState('');
    const sidebarRef = useRef();

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    useEffect(() => {
        const handleGlobalToggle = () => {
            toggleSidebar();
        };

        window.addEventListener('toggleSidebar', handleGlobalToggle);
        return () => window.removeEventListener('toggleSidebar', handleGlobalToggle);
    }, []);

    const handleSelectContract = (id) => {
        setSelectedContractId(id);
        setActivePage('demand');
    };

    const handleNavigate = (page) => {
        setSelectedContractId(null);
        setActivePage(page);
    };

    const getPageTitle = () => {
        switch (activePage) {
            case 'ledger':
                return 'Ledger Report';
            // case 'demand':
            //     return 'Demand';
            case 'agingreceivable':
                return 'Receivable Aging Report';
            case 'agingpayable':
                return 'Payable Aging Report';
            case 'payablesummary':
                return 'Payable Aging Summary';
            case 'receivablesummary':
                return 'Receivable Aging Summary';
            case 'salesreport':
                return 'Sales Report';
            default:
                return 'Dashboard';
        }
    };



    return (
        <div className="flex">
            <Sidebar
                ref={sidebarRef}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
                onSelectContract={handleSelectContract}
                onNavigate={handleNavigate}
            />

            <div className={`flex flex-col flex-1 transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-56'}`}>
                <Navbar isCollapsed={isCollapsed} pageTitle={getPageTitle()} />
                <main className="mt-16 p-6">
                    {activePage === 'ledger' ? (
                        <Ledger />
                    ) : activePage === 'agingreceivable' ? (
                        <AgingReceivable />
                    ) : activePage === 'agingpayable' ? (
                        <AgingPayable />
                    ) : activePage === 'payablesummary' ? (
                        <AgingPayableSummary />
                    ) : activePage === 'receivablesummary' ? (
                        <AgingReceivableSummary />
                    ) : activePage === 'salesreport' ? (
                        <SalesReport />
                    )
                    //  : activePage === 'demand' ? (
                    //     <DemandDetails
                    //         contractId={selectedContractId}
                    //         onSubmitted={() => {
                    //             sidebarRef.current?.refresh();
                    //             setSelectedContractId(null);
                    //             setActivePage('');
                    //         }}
                    //     />
                    // )
                     : (
                        <Graphs />
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
