import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../data/URL';

const CompanyList = ({ city, selectedCompany, onSelectCompany }) => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!city) return;
    axios
      .get(`${BASE_URL}aging-all-companies`)
      // .get(`https://fivestar-cgyj.onrender.com/api/aging-all-companies`)
      .then((res) => {
        const uniqueCompanies = [...new Set(res.data)];
        setCompanies(uniqueCompanies);
      })
      .catch((err) => toast.error('Error fetching companies:', err));
  }, [city]);

  const filteredCompanies = companies.filter((company) =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full sm:w-1/2 max-w-xs space-y-2">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search company..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
      />

      {/* Company list */}
      <ul className="border rounded text-sm space-y-1 max-h-40 overflow-y-auto bg-white">
        {filteredCompanies.map((company) => (
          <li
            key={company}
            className={`cursor-pointer p-2 rounded ${selectedCompany === company
                ? 'bg-green-100 font-bold'
                : 'hover:bg-gray-100'
              }`}
            onClick={() => onSelectCompany(company)}
          >
            {company}
          </li>
        ))}
        {filteredCompanies.length === 0 && (
          <li className="p-2 text-gray-500 italic">No companies found.</li>
        )}
      </ul>
    </div>
  );
};

export default CompanyList;
