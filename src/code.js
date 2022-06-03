import countryCodes from './assets/country-codes.csv';
import wmoCodes from './assets/wmo-codes.csv';

// Prevent page from refreshing
document.querySelector('form').addEventListener('submit', e => {
   e.preventDefault();
   generate();
});

// Select HTML elements
const cityInput = document.querySelector('input[type="search"]');
const limitInput = document.querySelector('input[type="number"]');
const zoneInput = document.querySelector('select');
generateZonesHTML();
const main = document.querySelector('main');

// API functions
function locationGen(city, limit) {
   const apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=';
   const toAPI_key = '&appid=ffdfa253912369611ba178473532dc00';
   return apiUrl + city + '&limit=' + limit + toAPI_key;
}
function weatherAPI(latitude, longitude, timeZone) {
   //https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41
   //&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FBerlin
   const apiUrl = 'http://api.open-meteo.com/v1/forecast?';
   const toParameters = '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=';
   return apiUrl + 'latitude=' + latitude + '&longitude=' + longitude + toParameters + timeZone;
}

function weatherHourly(latitude, longitude) {
   //https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41
   //&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FBerlin
   const toParameters = '&hourly=temperature_2m,relativehumidity_2m';
   const apiUrl = 'http://api.open-meteo.com/v1/forecast?';
   return apiUrl + 'latitude=' + latitude + '&longitude=' + longitude + toParameters;
   // returning JSON.hourly.{relativehumidity_2m : [hours], temperature_2m: [hours] }
}

// main function
async function generate() {
   const weatherData = [];
   main.textContent = '';
   const loadingDisplay = document.querySelector('.loading').querySelector('h1');
   loadingDisplay.textContent = 'Loading..';

   const searchedCity = cityInput.value;
   const numberOfCities = limitInput.value;
   const gmtInput = zoneInput.value;

   // getting long & lat from location url
   try {
      let coordinates = [];
      coordinates = await fetching(locationGen(searchedCity, numberOfCities));

      for (let location of coordinates) {
         const weatherJSON = await fetching(weatherAPI(location.lat, location.lon, gmtInput));
         weatherData.push({
            city: location.name,
            country: location.country,
            tempMax: weatherJSON.daily.temperature_2m_max[0],
            tempMin: weatherJSON.daily.temperature_2m_min[0],
            precipitation: weatherJSON.daily.precipitation_sum[0],
            weatherCode: weatherJSON.daily.weathercode[0]
         });
      }

   }
   // HTML manipulations
   finally {
      populate(weatherData);
      loadingDisplay.textContent = '';
   }


}

async function fetching(url) {
   const response = await fetch(url, { mode: 'cors' });
   const res = await response.json()
   return res;
}

// HTML manipulation function
function populate(list) {
   list.forEach(element => {
      const wrapper = document.createElement('div');
      const title = document.createElement('h1');
      const weatherCode = document.createElement('h2');
      const params = document.createElement('ul');
      const tempMax = document.createElement('li');
      const tempMin = document.createElement('li');
      const precipitation = document.createElement('li');

      title.textContent = `${element.city} - ${getCountry(element.country)}`;
      weatherCode.textContent = camelCasing(wmo(element.weatherCode));
      tempMax.textContent = `Temperature Max: ${element.tempMax} °C`;
      tempMin.textContent = `Temperature Min: ${element.tempMin} °C`;
      precipitation.textContent = `Precipitation : ${element.precipitation} mm`;

      if (element.tempMax <= 10) {
         wrapper.className = "cold";
      }
      else if (element.tempMax <= 25) {
         wrapper.className = "warm";
      } else {
         wrapper.className = "hot";
      }

      params.appendChild(tempMax);
      params.appendChild(tempMin);
      params.appendChild(precipitation);
      wrapper.appendChild(title);
      wrapper.appendChild(weatherCode);
      wrapper.appendChild(params);

      main.appendChild(wrapper);
   })
}

function camelCasing(txt) {
   return txt.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
}

// Codes

function getCountry(countryCode) {
   return countryCodes.find(line => line[0] === countryCode)[1]
}

function wmo(code) {
   console.log(code)
   console.log(wmoCodes)
   return wmoCodes.find(line => line[0] === code.toString())[1]
}

// Time zones HTML content
function generateZonesHTML() {
   zoneInput.innerHTML = `<option value="America%2FAnchorage">America/Anchorage</option>
   <option value="America%2FLos_Angeles">America/Los_Angeles</option>
   <option value="America%2FDenver">America/Denver</option>
   <option value="America%2FChicago">America/Chicago</option>
   <option value="America%2FNew_York">America/New_York</option>
   <option value="America%2FSao_Paulo">America/Sao_Paulo</option>
   <option selected value="Europe%2FLondon">Europe/London</option>
   <option value="Europe%2FBerlin">Europe/Berlin</option>
   <option value="Europe%2FMoscow">Europe/Moscow</option>
   <option value="Africa%2FCairo">Africa/Cairo</option>
   <option value="Asia%2FBangkok">Asia/Bangkok</option>
   <option value="Asia%2FSingapore">Asia/Singapore</option>
   <option value="Asia%2FTokyo">Asia/Tokyo</option>
   <option value="Australia%2FSydney">Australia/Sydney</option>
   <option value="Pacific%2FAuckland">Pacific/Auckland</option>`;
}