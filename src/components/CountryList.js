import React, {Fragment, useEffect, useState} from 'react';
import {useQuery, gql} from '@apollo/client';
import '../assets/css/CountryList.css'

const GET_COUNTRIES = gql`
  query {
    countries {
      name
      native
      capital
      emoji
      currency
      languages {
        code
        name
      }
    }
  }
`;

const CountryList = () => {
  const {error, loading, data} = useQuery (GET_COUNTRIES);
  const [filter, setFilter] = useState ('');
  const [selectedCountry, setSelectedCountry] = useState (null);
  const [groupBy, setGroupBy] = useState ('');
  const predefinedColors = ['blue', 'red', 'green', 'purple', 'orange'];
  const [currentColor, setCurrentColor] = useState (predefinedColors[0]);

  useEffect (
  () => {
    if (!loading && data && data.countries.length > 0) {
      const initialSelectedCountry = data.countries.length > 10
        ? data.countries[9].name 
        : data.countries[data.countries.length - 1].name;
      setSelectedCountry (initialSelectedCountry);
    }
  },
  [loading, data]
);


  const parseInput = input => {
    const keywords = input.split (' ');
    
    const searchKeyword = keywords.find (keyword =>
      keyword.startsWith ('search:')
    );

    const groupKeyword = keywords.find (keyword =>
      keyword.startsWith ('group:')
    );

    const searchTerm = searchKeyword ? searchKeyword.slice (7) : '';
    const newGroupBy = groupKeyword ? groupKeyword.slice (6) : groupBy;

    setGroupBy (newGroupBy);

    return searchTerm;
  };

  const setCountryBackgroundColor = color => {
    document.documentElement.style.setProperty ('--active-color', color);
  };

  const getNextColor = () => {
    const currentIndex = predefinedColors.indexOf (currentColor);
    const nextIndex = (currentIndex + 1) % predefinedColors.length;

    setCurrentColor (predefinedColors[nextIndex]);

    return predefinedColors[nextIndex];
  };

  const handleChange = e => {
    const searchTerm = parseInput (e.target.value);

    setFilter (searchTerm);
  };

  const handleCountryClick = countryName => {
    selectedCountry === countryName
      ? setSelectedCountry ('')
      : setSelectedCountry (countryName);

    setCountryBackgroundColor (getNextColor ());
  };

  if (error) return <div>Error</div>;
  if (loading) return <div>Loading</div>;

  const filterAndGroupCountries = () => {
    let filteredCountries = data.countries;

    if (filter) {
      filteredCountries = filteredCountries.filter (country =>
        country.name.toLowerCase ().includes (filter)
      );
    }

    if (groupBy) {
      const groupedCountries = {};

      filteredCountries.forEach (country => {
        const currency = country[groupBy] || 'Other';

        if (!groupedCountries[currency]) {
          groupedCountries[currency] = [];
        }
        
        groupedCountries[currency].push (country);
      });

      return groupedCountries;
    }

    return {All: filteredCountries};
  };

  const filteredAndGroupedCountries = filterAndGroupCountries ();

  return (
    <div className="countryList">
      <input
        id="search"
        type="text"
        onChange={handleChange}
        placeholder="search:xxx group:xxx"
      />

      {Object.entries (
        filteredAndGroupedCountries
      ).map (([group, countries]) => (
        <Fragment key={group}>
          <h3>{group}</h3>
          <table>
            <thead>
              <tr>
                <th>Country Name</th>
                <th>Country Language</th>
                <th>Country Currency</th>
              </tr>
            </thead>

            <tbody>
              {countries.map (country => (
                <tr
                  className={selectedCountry === country.name ? 'active' : ''}
                  onClick={() => handleCountryClick (country.name)}
                  key={country.name}
                >
                  <td>{country.name}</td>
                  <td>
                    {country.languages[0]?.name}
                  </td>
                  <td>{country.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Fragment>
      ))}

    </div>
  );
};

export default CountryList;
