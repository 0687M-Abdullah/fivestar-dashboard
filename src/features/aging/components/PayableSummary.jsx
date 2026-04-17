import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../data/URL';

const PayableSummary = ({ companies = [], customBuckets = [] }) => {
  const [summaries, setSummaries] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState([]);
  const fetchedCompaniesRef = useRef(new Set());

  useEffect(() => {
    if (!companies || companies.length === 0) return;

    let isMounted = true;

    // Only fetch companies that haven't been fetched before
    const newCompanies = companies.filter(c => !fetchedCompaniesRef.current.has(c));
    if (newCompanies.length === 0) return;

    const chunkArray = (arr, size) =>
      arr.reduce((acc, _, i) =>
        i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc, []);

    const fetchCompanySummary = async (company) => {
      try {
        const res = await axios.get(
          `${BASE_URL}aging-report-summary?description=${encodeURIComponent(company)}`
          // `https://fivestar-cgyj.onrender.com/api/aging-report-summary?description=${encodeURIComponent(company)}`
        );
        const data = res.data;

        const today = new Date();
        let drSum = 0;
        let showRemaining = false;
        let cumulativeBalance = 0;

        const buckets = {};
        customBuckets.forEach(bucket => {
          buckets[bucket.label] = 0;
        });

        data.forEach(row => {
          if (row.VDr) drSum += row.VDr;
        });

        data.forEach(row => {
          const bill = row.VCr || 0;
          const payment = row.VDr || 0;

          if (payment) return;

          if (!showRemaining) {
            if (drSum >= bill) {
              drSum -= bill;
              return;
            } else {
              showRemaining = true;
            }
          }

          const balance = bill - drSum;
          drSum = 0;
          cumulativeBalance += balance;

          const days = Math.floor((today - new Date(row.Vdate)) / (1000 * 60 * 60 * 24));

          for (const bucket of customBuckets) {
            if (days >= bucket.from && days <= bucket.to) {
              buckets[bucket.label] += balance;
              break;
            }
          }
        });

        const summary = {
          company,
          code: data[0]?.VCode || 'N/A',
          ...buckets,
          Balance: cumulativeBalance,
        };

        if (cumulativeBalance !== 0 && isMounted) {
          setSummaries(prev => [...prev, summary]);
        }

        fetchedCompaniesRef.current.add(company);
      } catch (err) {
        toast.error(`Error fetching summary for ${company}`);
      }
    };

    const fetchInChunks = async () => {
      const chunks = chunkArray(newCompanies, 3);

      for (const group of chunks) {
        if (!isMounted) break;
        setLoadingCompanies(group);
        await Promise.allSettled(group.map(fetchCompanySummary));
        setLoadingCompanies([]);
      }
    };

    fetchInChunks();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(companies), customBuckets]);

  if (summaries.length === 0 && loadingCompanies.length === 0) {
    return <p className="text-gray-600 mt-6">No summary found.</p>;
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-end no-print">
        <button
          onClick={() => window.print()}
          style={{ backgroundColor: '#292E49' }}
          className="text-white px-4 py-2 rounded w-full sm:w-auto flex items-center justify-center"
        >
          <span className="mr-1">Print</span> 🖨️
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto print-area">
        <table className="min-w-full text-sm text-center border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Code</th>
              <th className="border p-2">Party Name</th>
              <th className="border p-2">Balance</th>
              {customBuckets.map((b, i) => (
                <th key={i} className="border p-2">{b.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary, idx) => {
              const coloredCells = customBuckets
                .map((b, i) => ({ key: b.label, value: summary[b.label] || 0 }))
                .filter(cell => cell.value > 0);

              const bgClasses = [
                'bg-green-100 text-green-800',
                'bg-blue-100 text-blue-800',
                'bg-yellow-100 text-yellow-800',
                'bg-red-100 text-red-800',
                'bg-purple-100 text-purple-800',
                'bg-pink-100 text-pink-800',
              ];

              return (
                <tr key={idx} className="font-medium">
                  <td className="border p-2">{summary.code}</td>
                  <td className="border p-2">{summary.company}</td>
                  <td
                    className={`border p-2 font-semibold bg-gray-100 text-gray-800`}
                  >
                    {summary.Balance.toLocaleString()}
                  </td>

                  {customBuckets.map((b, i) => {
                    const value = summary[b.label] || 0;
                    const colorClass = bgClasses[i % bgClasses.length];

                    return (
                      <td
                        key={i}
                        className={`border p-2 font-semibold ${colorClass}`}
                      >
                        {value.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {loadingCompanies.length > 0 && (
              <tr>
                <td colSpan={customBuckets.length + 3} className="p-2 text-center text-blue-600 font-semibold animate-pulse">
                  Loading {loadingCompanies.join(', ')}...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-4">
        {summaries.map((summary, idx) => (
          <div key={idx} className="border rounded-lg shadow-md p-4 bg-white">
            <p><strong>Code:</strong> {summary.code}</p>
            <p><strong>Party Name:</strong> {summary.company}</p>
            <p className="font-bold"><strong>Balance:</strong> {summary.Balance.toLocaleString()}</p>
            {customBuckets.map((b, i) => (
              <p key={i}><strong>{b.label}:</strong> {summary[b.label]?.toLocaleString()}</p>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-area {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PayableSummary;
