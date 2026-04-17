import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ValueSelector = ({ selectedHeading, onValueSelect }) => {
  const [values, setValues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    if (!selectedHeading) return;

    axios
      // .get(`http://localhost:5000/api/column-values?column=${selectedHeading}`)
      .get(`https://fivestar-cgyj.onrender.com/api/column-values?column=${selectedHeading}`)
      .then((res) => {
        console.log('Fetched values:', res.data);

        let raw = res.data;

        // Case: API returns object array like [{ Yarn_Inv_No: "INV001" }]
        if (Array.isArray(raw) && typeof raw[0] === 'object' && raw[0] !== null) {
          raw = raw.map((item) => item[selectedHeading]);
        }

        // Remove undefined/null & duplicates
        const uniqueValues = [...new Set(raw.filter(Boolean))];
        setValues(uniqueValues);
      })
      .catch((err) => {
        console.error('Error fetching values:', err);
        toast.error('Error fetching values.');
      });
  }, [selectedHeading]);

  const filteredValues = values.filter((val) =>
    val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value) => {
    setSelectedValue(value);
    onValueSelect(value);
  };

  return (
    <div className="w-full sm:w-1/2 max-w-xs space-y-2">
      <input
        type="text"
        placeholder="Search value..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
      />
      <ul className="border rounded text-sm space-y-1 max-h-40 overflow-y-auto bg-white">
        {filteredValues.map((val, idx) => (
          <li
            key={idx}
            className={`cursor-pointer p-2 rounded ${
              selectedValue === val ? 'bg-green-100 font-bold' : 'hover:bg-gray-100'
            }`}
            onClick={() => handleSelect(val)}
          >
            {val}
          </li>
        ))}
        {filteredValues.length === 0 && (
          <li className="p-2 text-gray-500 italic">No values found.</li>
        )}
      </ul>
    </div>
  );
};

export default ValueSelector;
