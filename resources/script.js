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
        const wrapper = document.createElement('ul');
        const title = document.createElement('h1');
        const weatherCode = document.createElement('h2');
        const tempMax = document.createElement('li');
        const tempMin = document.createElement('li');
        const precipitation = document.createElement('li');

        title.textContent = `${element.city}, ${element.country}`;
        weatherCode.textContent = wmo(element.weatherCode);
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

        wrapper.appendChild(title);
        wrapper.appendChild(weatherCode);
        wrapper.appendChild(tempMax);
        wrapper.appendChild(tempMin);
        wrapper.appendChild(precipitation);

        main.appendChild(wrapper);
    })
}

// Weather codes
function wmo(code) {
    const codes = {
        0: 'clear sky',
        1: 'mainly clear',
        2: 'Mainly clear',
        3: 'overcast',
        45: 'fog',
        48: 'rime fog',
        51: 'light Drizzle',
        53: 'moderate Drizzle',
        55: 'dense Drizzle',
        56: 'light freezing drizzle',
        57: 'dense freezing drizzl',
        61: 'slight rain',
        63: 'moderate rain',
        65: 'heavy rain',
        66: 'light freezing rain',
        67: 'heavy freezing rain',
        71: 'slight snow fall',
        73: 'moderate snow fall',
        75: 'heavy snow fall',
        77: 'snow grains',
        80: 'slight rain shower',
        81: 'moderate rain shower',
        82: 'violent rain shower',
        85: 'slight snow shower',
        86: 'heavy snow shower',
        95: 'thunderstorm',
        96: 'thunderstorm with slight hail',
        99: 'thunderstorm with heavy hail'
    }
    return codes[code].toLowerCase();
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