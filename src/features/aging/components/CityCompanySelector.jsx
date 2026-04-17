import CityList from "./CityList";
import CompanyList from "./CompanyList";

const CityCompanySelector = ({ selectedCity, setSelectedCity, selectedCompany, setSelectedCompany }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <CityList
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
        }}
      />
      {selectedCity && (
        <CompanyList
          city={selectedCity}
          selectedCompany={selectedCompany}
          onSelectCompany={setSelectedCompany}
        />
      )}
    </div>
  );
};

export default CityCompanySelector;
