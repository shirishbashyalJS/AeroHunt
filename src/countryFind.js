// Game Database
const countriesDatabase = [
    {
        id: 1,
        name: 'United States',
        latitude: 37.090240,
        longitude: -95.712891,
        area_km2: 9833520,
        famous_for: "World's largest economy, Hollywood, Silicon Valley"
    },
    {
        id: 2,
        name: 'China',
        latitude: 35.861660,
        longitude: 104.195397,
        area_km2: 9596961,
        famous_for: 'Great Wall, largest population, manufacturing powerhouse'
    },
    {
        id: 3,
        name: 'India',
        latitude: 20.593684,
        longitude: 78.962880,
        area_km2: 3287263,
        famous_for: 'Taj Mahal, yoga, Bollywood'
    },
    {
        id: 4,
        name: 'Japan',
        latitude: 36.204824,
        longitude: 138.252924,
        area_km2: 377975,
        famous_for: 'Technology innovation, anime, Mount Fuji'
    },
    {
        id: 5,
        name: 'Germany',
        latitude: 51.165691,
        longitude: 10.451526,
        area_km2: 357022,
        famous_for: 'Engineering excellence, BMW, Oktoberfest'
    },
    {
        id: 6,
        name: 'France',
        latitude: 46.227638,
        longitude: 2.213749,
        area_km2: 551695,
        famous_for: 'Eiffel Tower, fashion, wine and cuisine'
    },
    {
        id: 7,
        name: 'United Kingdom',
        latitude: 55.378051,
        longitude: -3.435973,
        area_km2: 243610,
        famous_for: 'Industrial Revolution, London, monarchy'
    },
    {
        id: 8,
        name: 'Brazil',
        latitude: -14.235004,
        longitude: -51.925280,
        area_km2: 8515767,
        famous_for: 'Amazon Rainforest, football, Carnival'
    },
    {
        id: 9,
        name: 'Italy',
        latitude: 41.871940,
        longitude: 12.567380,
        area_km2: 301340,
        famous_for: 'Roman Empire history, Vatican City, pizza and pasta'
    }
];

// Game State
let gameState = {
    currentCountry: null,
    targetCountry: null,
    moneyLeft: 1000,
    selectedCountry: null,
    map: null,
    marker: null,
    hints: []
};

// Initialize game - called as callback from Google Maps API
window.initGame = function () {
    initializeGame();
    setupMapClickListener();
    setupSubmitButton();
};

// Fallback initialization if callback doesn't fire
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(() => {
            if (!gameState.map) {
                window.initGame();
            }
        }, 500);
    });
} else {
    setTimeout(() => {
        if (!gameState.map) {
            window.initGame();
        }
    }, 500);
}

// Initialize the game
function initializeGame() {
    // Select a random country as the target
    gameState.targetCountry = countriesDatabase[Math.floor(Math.random() * countriesDatabase.length)];
    gameState.currentCountry = null;
    gameState.selectedCountry = null;
    gameState.moneyLeft = 1000;
    gameState.hints = generateHints(gameState.targetCountry);

    // Initialize Google Map
    initializeMap();

    // Display hints
    displayHints();

    // Update UI
    updateUI();
}

// Generate hints for the target country
function generateHints(country) {
    return [
        `📍 Area: ${country.area_km2.toLocaleString()} km²`,
        `🌍 Coordinates: ${country.latitude.toFixed(2)}°, ${country.longitude.toFixed(2)}°`,
        `⭐ Famous for: ${country.famous_for}`,
        `🎯 This country has a unique location on the map`
    ];
}

// Initialize Google Map
function initializeMap() {
    const mapElement = document.getElementById('map');

    // Center map on world view
    const worldCenter = { lat: 20, lng: 0 };

    gameState.map = new google.maps.Map(mapElement, {
        zoom: 3,
        center: worldCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        mapId: 'DEMO_MAP_ID'  // Required for Advanced Markers
    });

    // Add click listener to map
    gameState.map.addListener('click', function (event) {
        onMapClick(event.latLng);
    });

    // Add country markers (optional: to help visualization)
    addCountryMarkers();
}

// Add markers for all countries in database
function addCountryMarkers() {
    countriesDatabase.forEach(country => {
        const markerElement = document.createElement('div');
        markerElement.style.width = '20px';
        markerElement.style.height = '20px';
        markerElement.style.background = 'url("https://maps.gstatic.com/mapfiles/ms2/micons/gray.png") no-repeat center';
        markerElement.style.backgroundSize = 'contain';
        markerElement.style.cursor = 'pointer';

        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: country.latitude, lng: country.longitude },
            map: gameState.map,
            title: country.name,
            content: markerElement
        });

        // Add click listener to markers using 'gmp-click' for AdvancedMarkerElement
        marker.addListener('gmp-click', function () {
            selectCountry(country);
        });
    });
}

// Handle map clicks
function onMapClick(latLng) {
    // Find the closest country to the clicked location
    let closestCountry = countriesDatabase[0];
    let minDistance = getDistance(latLng.lat(), latLng.lng(), closestCountry.latitude, closestCountry.longitude);

    for (let i = 1; i < countriesDatabase.length; i++) {
        const country = countriesDatabase[i];
        const distance = getDistance(latLng.lat(), latLng.lng(), country.latitude, country.longitude);
        if (distance < minDistance) {
            minDistance = distance;
            closestCountry = country;
        }
    }

    selectCountry(closestCountry);
}

// Select a country
function selectCountry(country) {
    gameState.selectedCountry = country;
    gameState.currentCountry = country.name;

    // Remove previous marker
    if (gameState.marker) {
        gameState.marker.map = null;
    }

    // Add new marker with AdvancedMarkerElement
    const markerElement = document.createElement('div');
    markerElement.style.width = '25px';
    markerElement.style.height = '25px';
    markerElement.style.background = 'url("https://maps.gstatic.com/mapfiles/ms2/micons/red.png") no-repeat center';
    markerElement.style.backgroundSize = 'contain';
    markerElement.style.cursor = 'pointer';

    gameState.marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: country.latitude, lng: country.longitude },
        map: gameState.map,
        title: country.name,
        content: markerElement
    });

    // Center map on selected country
    gameState.map.setCenter({ lat: country.latitude, lng: country.longitude });
    gameState.map.setZoom(5);

    // Update UI
    updateUI();
}

// Calculate distance between two coordinates (simplified)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Display hints
function displayHints() {
    const hintsContent = document.getElementById('hints-content');
    hintsContent.innerHTML = '';

    gameState.hints.forEach(hint => {
        const hintElement = document.createElement('div');
        hintElement.className = 'hint-item';
        hintElement.textContent = hint;
        hintsContent.appendChild(hintElement);
    });
}

// Update UI elements
function updateUI() {
    const currentLocationElement = document.getElementById('current-location');
    const moneyLeftElement = document.getElementById('money-left');

    currentLocationElement.textContent = gameState.currentCountry || 'Unknown';
    moneyLeftElement.textContent = `$${gameState.moneyLeft.toLocaleString()}`;
}

// Setup submit button listener
function setupSubmitButton() {
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.addEventListener('click', function () {
        submitAnswer();
    });
}

// Setup map click listener
function setupMapClickListener() {
    // This is handled in initializeMap
}

// Submit the answer
function submitAnswer() {
    if (!gameState.selectedCountry) {
        alert('Please select a country on the map first!');
        return;
    }

    if (gameState.selectedCountry.id === gameState.targetCountry.id) {
        alert(`🎉 Correct! The treasure was in ${gameState.targetCountry.name}!\n\nYou won $${gameState.moneyLeft}!`);
        // Redirect to win page or reset game
        setTimeout(() => {
            window.location.href = '../pages/won.html';
        }, 1500);
    } else {
        // Deduct money for wrong answer
        gameState.moneyLeft -= 100;
        updateUI();

        if (gameState.moneyLeft <= 0) {
            alert('💔 Game Over! You ran out of money!');
            // Redirect to lose page or reset game
            initializeGame();
        } else {
            alert(`❌ Wrong! That's ${gameState.selectedCountry.name}.\n\nYou have $${gameState.moneyLeft} left. Try again!`);
            gameState.selectedCountry = null;
            gameState.currentCountry = null;
            if (gameState.marker) {
                gameState.marker.setMap(null);
            }
            updateUI();
        }
    }
}
