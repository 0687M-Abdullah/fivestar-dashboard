import { useState } from 'react';
import CityCompanySelector from './components/CityCompanySelector';
import PayableSummary from './components/PayableSummary';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../data/URL';

const AgingPayableSummary = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [allSelectedCompanies, setAllSelectedCompanies] = useState([]);
  const [bucketCount, setBucketCount] = useState(4);
  const [bucketSize, setBucketSize] = useState(15);
  const [customBuckets, setCustomBuckets] = useState([]);

  const generateBuckets = (count, size) => {
    const buckets = [];
    for (let i = 0; i < count; i++) {
      const from = i * size + 1;
      const to = (i + 1) * size;
      buckets.push({ label: `${from}-${to}`, from, to });
    }
    buckets.push({ label: `${count * size + 1}+`, from: count * size + 1, to: Infinity });
    return buckets;
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedCompany(null);
    setCompanies([]);
  };

  const handleSelectAll = async () => {
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
      const buckets = generateBuckets(bucketCount, bucketSize);
      setCustomBuckets(buckets);
    } catch (err) {
      toast.error('Error fetching companies:', err);
    }
  };

  const handleSelectCompany = (company) => {
    if (!allSelectedCompanies.includes(company)) {
      setAllSelectedCompanies((prev) => [...prev, company]);
    }
    setSelectedCompany(company);

    // Auto-generate buckets
    const buckets = generateBuckets(bucketCount, bucketSize);
    setCustomBuckets(buckets);
  };

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
            value={bucketCount}
            onChange={(e) => setBucketCount(parseInt(e.target.value))}
            className="w-full border px-2 py-1 rounded"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Days per Bucket:</label>
          <input
            type="number"
            value={bucketSize}
            onChange={(e) => setBucketSize(parseInt(e.target.value))}
            className="w-full border px-2 py-1 rounded"
            min={1}
          />
        </div>
      </div>

      {/* Select All Button */}
      {selectedCity && (
        <button
          onClick={handleSelectAll}
          style={{ backgroundColor: '#292E49' }}
          className="mb-4 px-4 py-2 text-white rounded hover:bg-blue-700"
        >
          Select All Companies
        </button>
      )}

      {/* Summary Table */}
      {allSelectedCompanies.length > 0 && customBuckets.length > 0 && (
        <PayableSummary
          companies={allSelectedCompanies}
          city={selectedCity}
          customBuckets={customBuckets}
        />
      )}
    </div>
  );
};

export default AgingPayableSummary;
