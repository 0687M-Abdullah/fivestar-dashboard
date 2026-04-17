import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../data/URL';

const CityList = ({ selectedCity, onSelectCity }) => {
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios
      .get(`${BASE_URL}aging-cities`)
      // .get('https://fivestar-cgyj.onrender.com/api/aging-cities')
      .then((res) => setCities(res.data))
      .catch((err) => toast.error('Error fetching cities:', err));
  }, []);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full sm:w-1/2 max-w-xs space-y-2 sm:mr-2">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search city..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
      />

      {/* City list */}
      <ul className="border rounded text-sm space-y-1 max-h-40 overflow-y-auto bg-white">
        {filteredCities.map((city, idx) => (
          <li
            key={idx}
            className={`cursor-pointer p-2 rounded ${
              selectedCity === city
                ? 'bg-blue-100 font-bold'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => onSelectCity(city)}
          >
            {city}
          </li>
        ))}
        {filteredCities.length === 0 && (
          <li className="p-2 text-gray-500 italic">No cities found.</li>
        )}
      </ul>
    </div>
  );
};

export default CityList;
