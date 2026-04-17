import { useState, useEffect } from 'react';
import CityCompanySelector from './components/CityCompanySelector';
import ReceivableSummary from './components/ReceivableSummary';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../data/URL';

const AgingReceivableSummary = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [allSelectedCompanies, setAllSelectedCompanies] = useState([]);
  const [bucketCount, setBucketCount] = useState(4);
  const [bucketSize, setBucketSize] = useState(15);
  const [customBuckets, setCustomBuckets] = useState([]);
  const [startDay, setStartDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [cancelledCompanies, setCancelledCompanies] = useState([]);
  const [resetKey, setResetKey] = useState(0);

  const generateBuckets = (count, size, startDay) => {
    const buckets = [];
    for (let i = 0; i < count; i++) {
      const from = startDay + i * size;
      const to = startDay + (i + 1) * size - 1;
      buckets.push({ label: `${from}-${to}`, from, to });
    }
    buckets.push({ label: `${startDay + count * size}+`, from: startDay + count * size, to: Infinity });
    return buckets;
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedCompany(null);
    setCompanies([]);
  };

  const handleSelectAll = async () => {
    setLoading(true);

    if (!selectedCity) return;

    try {
      const res = await axios.get(`${BASE_URL}aging-companies?city=${selectedCity}`);
      // const res = await axios.get(`https://fivestar-cgyj.onrender.com/api/aging-companies?city=${selectedCity}`);
      const newCompanies = res.data.filter(
        (c) => !allSelectedCompanies.includes(c)
      );
      setCompanies(res.data);
      setAllSelectedCompanies((prev) => [...prev, ...newCompanies]);

      // Auto-generate buckets
      const buckets = generateBuckets(bucketCount, bucketSize, startDay);
      setCustomBuckets(buckets);
    } catch (err) {
      if (axios.isCancel(err)) {
        toast.error("Request cancelled:", err.message);
      } else {
        toast.error("Error fetching:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(null);
    setTimeout(() => {
      setSelectedCompany(company);
    }, 0);

    if (!allSelectedCompanies.includes(company)) {
      setAllSelectedCompanies((prev) => [...prev, company]);
    }

    // Auto-generate buckets
    const buckets = generateBuckets(bucketCount, bucketSize, startDay);
    setCustomBuckets(buckets);
  };

  useEffect(() => {
    if (allSelectedCompanies.length > 0) {
      const buckets = generateBuckets(bucketCount, bucketSize, startDay);
      setCustomBuckets(buckets);
    }
  }, [bucketCount, bucketSize]);

  return (
    <div className="p-4">
      {/* City + Company Selector */}
      <CityCompanySelector
        selectedCity={selectedCity}
        setSelectedCity={handleCityChange}
        selectedCompany={selectedCompany}
        setSelectedCompany={handleSelectCompany}
      />

      {/* Bucket Input Fields */}
      <div className="mb-4 space-y-2 sm:flex sm:space-x-4 sm:space-y-0">
        <div>
          <label className="block text-sm font-medium">Number of Buckets:</label>
          <input
            type="number"
            value={bucketCount === 0 ? "" : bucketCount}
            onChange={(e) => setBucketCount(e.target.value === "" ? 0 : parseInt(e.target.value))}
            className="w-full border px-2 py-1 rounded"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Days per Bucket:</label>
          <input
            type="number"
            value={bucketSize === 0 ? "" : bucketSize}
            onChange={(e) => setBucketSize(e.target.value === "" ? 0 : parseInt(e.target.value))}
            className="w-full border px-2 py-1 rounded"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Start Day:</label>
          <input
            type="number"
            value={startDay === 0 ? "" : startDay}
            onChange={(e) => setStartDay(e.target.value === "" ? 0 : parseInt(e.target.value))}
            className="w-full border px-2 py-1 rounded"
            min={1}
          />
        </div>
      </div>

      {/* Select All Button */}
      {selectedCity && (
        <>
          <button
            onClick={handleSelectAll}
            style={{ backgroundColor: '#292E49' }}
            className="mb-4 px-4 py-2 text-white rounded hover:bg-blue-700"
          >
            Select All Companies
          </button>
          <button
            onClick={() => {
              if (loading) {
                setLoading(false);

                setSummaries([]);
                setAllSelectedCompanies([]);
                setCancelledCompanies([]);
                setSelectedCompany(null);

                setResetKey(prev => prev + 1);
              } else {
                const lastCompany = allSelectedCompanies[allSelectedCompanies.length - 1];

                setSummaries(prev => prev.slice(0, -1));
                setAllSelectedCompanies(prev => prev.slice(0, -1));

                if (lastCompany) {
                  setCancelledCompanies(prev => [...prev, lastCompany]);
                }

                setSelectedCompany(null);
              }
            }}
            className="mb-4 ml-5 px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-sm shadow-md hover:from-red-600 hover:to-red-800 transition-all duration-200 ease-in-out"
          >
            Cancel
          </button>
        </>
      )}

      {/* Summary Table */}
      {allSelectedCompanies.length > 0 && customBuckets.length > 0 && (
        <ReceivableSummary
          key={resetKey}
          companies={allSelectedCompanies}
          city={selectedCity}
          customBuckets={customBuckets}
          startDay={startDay}
          summaries={summaries}
          setSummaries={setSummaries}
          cancelledCompanies={cancelledCompanies}
        />
      )}
    </div>
  );
};

export default AgingReceivableSummary;
