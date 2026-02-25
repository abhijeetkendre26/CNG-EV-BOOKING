tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'ev-green': '#10b981', // emerald-500
                'cng-orange': '#f59e0b', // amber-500
                'primary-teal': '#0d9488', // teal-600
                'primary-teal-hover': '#0f766e', // teal-700
                'accent-indigo': '#4f46e5', // indigo-600
                'success-toast': '#059669', // emerald-600
                'error-toast': '#e11d48' // rose-600
            }
        }
    }
};

const state = {
    currentUser: null,
    selectedStation: null,
    selectedSlot: null,
    currentFilter: 'all',
    stations: [],
    cities: [],
    map: null,
    markers: [],
    sidebarOpen: false,
    userVehicles: []
};

// API Helper Functions
const api = {
    baseUrl: '', // Relative path - adjust if needed
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}api/${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Auth APIs
    async checkAuth() {
        return this.request('auth.php?action=check');
    },
    
    async login(email, password) {
        return this.request('auth.php?action=login', {
            method: 'POST',
            body: { email, password }
        });
    },
    
    async register(userData) {
        return this.request('auth.php?action=register', {
            method: 'POST',
            body: userData
        });
    },
    
    async logout() {
        return this.request('auth.php?action=logout', {
            method: 'POST'
        });
    },
    
    // Cities & Stations APIs
    async getCities() {
        return this.request('stations.php?action=cities');
    },
    
    async getStationsByCity(cityName) {
        return this.request(`stations.php?action=by-city&city=${encodeURIComponent(cityName)}`);
    },
    
    async getAllStations(type = '') {
        const url = type ? `stations.php?type=${type}` : 'stations.php';
        return this.request(url);
    },
    
    // Vehicles APIs
    async getVehicles() {
        return this.request('vehicles.php');
    },
    
    async addVehicle(vehicleNumber, type) {
        return this.request('vehicles.php', {
            method: 'POST',
            body: { vehicleNumber, type }
        });
    },
    
    async deleteVehicle(vehicleId) {
        return this.request(`vehicles.php?id=${vehicleId}`, {
            method: 'DELETE'
        });
    },
    
    // Bookings APIs
    async getBookings() {
        return this.request('bookings.php');
    },
    
    async createBooking(stationId, vehicleId, timeSlot, bookingDate) {
        return this.request('bookings.php', {
            method: 'POST',
            body: { stationId, vehicleId, timeSlot, bookingDate }
        });
    }
};

const utils = {
    normalizeEmail: (email) => email.toLowerCase().trim(),
    validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    validateVehicleNumber: (number) => /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/.test(number),
    showToast: (message, type = 'success') => {
        const toast = document.getElementById('toast');
        toast.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white ${type === 'success' ? 'bg-success-toast' : 'bg-error-toast'
            }`;
        document.getElementById('toastMessage').textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    },
    showLoading: (btnId) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            const btnText = btn.querySelector('.btn-text');
            const loading = btn.querySelector('.loading');
            if (btnText) btnText.classList.add('hidden');
            if (loading) loading.classList.remove('hidden');
            btn.disabled = true;
        }
    },
    hideLoading: (btnId) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            const btnText = btn.querySelector('.btn-text');
            const loading = btn.querySelector('.loading');
            if (btnText) btnText.classList.remove('hidden');
            if (loading) loading.classList.add('hidden');
            btn.disabled = false;
        }
    },
    clearErrors: () => {
        document.querySelectorAll('[id$="Error"]').forEach(e => {
            e.classList.add('hidden');
            e.textContent = '';
        });
    },
    showError: (id, message) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = message;
            el.classList.remove('hidden');
        }
    },
    toggleSidebar: () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        state.sidebarOpen = !state.sidebarOpen;
        if (state.sidebarOpen) {
            sidebar.classList.remove('transform', '-translate-x-full');
            overlay.classList.remove('hidden');
            document.body.classList.add('sidebar-open');
        } else {
            sidebar.classList.add('transform', '-translate-x-full');
            overlay.classList.add('hidden');
            document.body.classList.remove('sidebar-open');
        }
    },
    getDefaultImage: (type) => {
        if (type === 'EV') {
            return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='gray' viewBox='0 0 24 24'%3E%3Cpath d='M12 2a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2zm0 18a8 8 0 01-8-8 8 8 0 018-8 8 8 0 018 8 8 8 0 01-8 8zm-1-13h2v4h4v2h-6V7z'/%3E%3C/svg%3E";
        } else {
            return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='darkgray' viewBox='0 0 24 24'%3E%3Cpath d='M12 2a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2zm0 18a8 8 0 01-8-8 8 8 0 018-8 8 8 0 018 8 8 8 0 01-8 8zm-1-13h2v4h4v2h-6V7z'/%3E%3C/svg%3E";
        }
    }
};

const mapFunctions = {
    initMap: () => {
        console.log('Initializing Google Map');
        try {
            // Default center: India
            const defaultCenter = { lat: 20.5937, lng: 78.9629 };
            
            state.map = new google.maps.Map(document.getElementById('map'), {
                center: defaultCenter,
                zoom: 5,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                zoomControl: true
            });
            
            console.log('Google Map initialized successfully');
            // Load default city stations
            stationFunctions.loadDefaultCity();
        } catch (error) {
            console.error('Error initializing map:', error);
            document.getElementById('mapFallback').classList.remove('hidden');
            stationFunctions.loadDefaultCity();
        }
    },
    updateMarkers: () => {
        console.log('Updating markers for stations:', state.stations);
        if (!state.map) {
            console.warn('Map not initialized, skipping marker update');
            return;
        }
        
        // Clear existing markers
        state.markers.forEach(marker => marker.setMap(null));
        state.markers = [];
        
        // Create custom marker icons
        const evIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#10b981', // emerald-500 (EV green)
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
        };
        
        const cngIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#f59e0b', // amber-500 (CNG orange)
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
        };
        
        // Create markers for each station
        state.stations.forEach(station => {
            const marker = new google.maps.Marker({
                position: { lat: station.lat, lng: station.lng },
                map: state.map,
                icon: station.type === 'EV' ? evIcon : cngIcon,
                title: station.name
            });
            
            // Create info window content
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="padding: 8px;">
                        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${station.name}</h3>
                        <p style="margin: 4px 0; color: #4b5563;">${station.location}</p>
                        <p style="margin: 4px 0; color: #4b5563;"><strong>Type:</strong> ${station.type}</p>
                        <p style="margin: 4px 0; color: #4b5563;"><strong>Available Slots:</strong> ${station.available}</p>
                    </div>
                `
            });
            
            // Add click listener to show info window
            marker.addListener('click', () => {
                // Close other info windows
                state.markers.forEach(m => {
                    if (m.infoWindow) {
                        m.infoWindow.close();
                    }
                });
                infoWindow.open(state.map, marker);
            });
            
            marker.infoWindow = infoWindow;
            state.markers.push(marker);
        });
        
        // Fit bounds to show all markers if there are any
        if (state.markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            state.markers.forEach(marker => {
                bounds.extend(marker.getPosition());
            });
            state.map.fitBounds(bounds);
            
            // Don't zoom in too much if only one marker
            if (state.markers.length === 1) {
                state.map.setZoom(12);
            }
        }
    },
    setCenter: (lat, lng, zoom = 12) => {
        if (state.map) {
            state.map.setCenter({ lat, lng });
            state.map.setZoom(zoom);
        }
    }
};

const stationFunctions = {
    async loadDefaultCity() {
        try {
            const response = await api.getCities();
            if (response.success && response.cities.length > 0) {
                state.cities = response.cities;
                await this.generateStationsForCity(response.cities[0]);
            }
        } catch (error) {
            console.error('Error loading cities:', error);
            document.getElementById('stationsFallback').innerHTML = 'Failed to load stations. Please refresh the page.';
        }
    },
    async generateStationsForCity(city) {
        console.log('Generating stations for:', city.name);
        try {
            const response = await api.getStationsByCity(city.name);
            if (response.success) {
                state.stations = response.stations.map(s => ({
                    id: s.id,
                    name: s.name,
                    location: s.location,
                    lat: s.lat,
                    lng: s.lng,
                    type: s.type,
                    available: s.available,
                    image: s.image
                }));
                console.log('Stations loaded:', state.stations);
                this.displayStations();
                mapFunctions.updateMarkers();
                if (state.map && city.lat && city.lng) {
                    mapFunctions.setCenter(city.lat, city.lng, 12);
                }
            } else {
                throw new Error(response.message || 'Failed to load stations');
            }
        } catch (error) {
            console.error('Error generating stations:', error);
            document.getElementById('stationsFallback').innerHTML = 'Failed to load stations. Please refresh the page.';
            utils.showToast('Failed to load stations', 'error');
        }
    },
    displayStations: () => {
        console.log('Displaying stations');
        const stationsList = document.getElementById('stationsList');
        stationsList.innerHTML = '';
        const filteredStations = state.currentFilter === 'all'
            ? state.stations
            : state.stations.filter(s => s.type.toLowerCase() === state.currentFilter);
        
        if (filteredStations.length === 0) {
            stationsList.innerHTML = '<div class="col-span-full text-center text-gray-500 dark:text-gray-400">No stations available.</div>';
            return;
        }
        
        filteredStations.forEach((station, i) => {
            const card = document.createElement('div');
            card.className = `bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-lg animate-slide-in-left`;
            card.style.animationDelay = `${i * 0.2}s`;
            card.innerHTML = `
                <img src="${station.image}" alt="${station.name}" class="w-full h-40 object-cover rounded-lg mb-2" onerror="this.src='${utils.getDefaultImage(station.type)}'">
                <h3 class="text-lg font-semibold text-accent-indigo dark:text-indigo-400">${station.name} (${station.type})</h3>
                <p class="text-sm text-gray-700 dark:text-gray-300">${station.location}</p>
                <p class="text-sm text-gray-700 dark:text-gray-300">Available Slots: ${station.available}</p>
                <button class="book-btn mt-2 w-full p-2 bg-primary-teal text-white rounded-lg hover:bg-primary-teal-hover" data-id="${station.id}">
                    <span class="btn-text">Book Now</span>
                    <span class="loading hidden">Loading...</span>
                </button>
            `;
            stationsList.appendChild(card);
        });
        
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!state.currentUser) {
                    utils.showToast('Please login to book', 'error');
                    authFunctions.showAuthModal('login');
                    return;
                }
                const station = state.stations.find(s => s.id === parseInt(btn.dataset.id));
                state.selectedStation = station;
                bookingFunctions.openBookingModal(station);
                utils.toggleSidebar();
            });
        });
    },
    async searchStations() {
        const query = document.getElementById('locationInput').value.trim();
        if (!query) {
            utils.showToast('Please enter a city name', 'error');
            return;
        }
        
        try {
            const response = await api.getStationsByCity(query);
            if (response.success) {
                state.stations = response.stations.map(s => ({
                    id: s.id,
                    name: s.name,
                    location: s.location,
                    lat: s.lat,
                    lng: s.lng,
                    type: s.type,
                    available: s.available,
                    image: s.image
                }));
                this.displayStations();
                mapFunctions.updateMarkers();
                if (state.map && response.city) {
                    mapFunctions.setCenter(response.city.lat, response.city.lng, 12);
                }
                document.getElementById('searchSuggestions').classList.add('hidden');
            } else {
                utils.showToast(response.message || 'City not found', 'error');
            }
        } catch (error) {
            console.error('Search error:', error);
            utils.showToast('Failed to search stations', 'error');
        }
        utils.toggleSidebar();
    },
    async showSearchSuggestions(query) {
        console.log(`Showing suggestions for: ${query}`);
        const suggestions = document.getElementById('searchSuggestions');
        suggestions.innerHTML = '';
        if (!query) {
            suggestions.classList.add('hidden');
            return;
        }
        
        try {
            if (state.cities.length === 0) {
                const response = await api.getCities();
                if (response.success) {
                    state.cities = response.cities;
                }
            }
            
            const filtered = state.cities.filter(c =>
                c.name.toLowerCase().includes(query.toLowerCase()) ||
                c.state.toLowerCase().includes(query.toLowerCase()));
            
            if (filtered.length === 0) {
                suggestions.classList.add('hidden');
                return;
            }
            
            filtered.forEach(city => {
                const item = document.createElement('div');
                item.className = 'suggestion-item p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white';
                item.textContent = `${city.name}, ${city.state}`;
                item.addEventListener('click', async () => {
                    document.getElementById('locationInput').value = `${city.name}, ${city.state}`;
                    await this.generateStationsForCity(city);
                    suggestions.classList.add('hidden');
                    utils.toggleSidebar();
                });
                suggestions.appendChild(item);
            });
            suggestions.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }
};

const bookingFunctions = {
    async openBookingModal(station) {
        console.log('Opening booking modal for station:', station);
        console.log('Current user:', state.currentUser);
        
        document.getElementById('modalStationName').textContent = station.name;
        document.getElementById('modalStationImage').src = station.image;
        document.getElementById('modalStationImage').onerror = () => {
            document.getElementById('modalStationImage').src = utils.getDefaultImage(station.type);
        };
        document.getElementById('modalStationLocation').textContent = station.location;
        document.getElementById('modalStationType').textContent = station.type;
        document.getElementById('modalStationType').className = `station-type-badge px-2 py-1 rounded text-white ${station.type === 'EV' ? 'bg-ev-green' : 'bg-cng-orange'
            }`;
        document.getElementById('modalStationStatus').textContent = station.available > 0 ? "Available" : "Full";
        document.getElementById('modalStationStatus').className = `status-badge px-2 py-1 rounded text-white ${station.available > 0 ? 'bg-success-toast' : 'bg-error-toast'
            }`;
        
        const timeSlots = document.getElementById('timeSlots');
        timeSlots.innerHTML = '';
        const slots = ["09:00 AM", "12:00 PM", "03:00 PM"];
        slots.forEach(slot => {
            const slotEl = document.createElement('div');
            slotEl.className = `p-2 text-center border rounded-lg text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900`;
            slotEl.textContent = slot;
            slotEl.addEventListener('click', () => {
                document.querySelectorAll('#timeSlots > div').forEach(s => s.classList.remove('bg-accent-indigo', 'text-white'));
                slotEl.classList.add('bg-accent-indigo', 'text-white');
                state.selectedSlot = slot;
            });
            timeSlots.appendChild(slotEl);
        });
        
        const vehicleSelect = document.getElementById('vehicleSelect');
        vehicleSelect.innerHTML = '<option value="">Select a vehicle</option>';
        
        if (state.currentUser && state.userVehicles.length > 0) {
            const compatibleVehicles = state.userVehicles.filter(v =>
                v.type.toUpperCase() === station.type.toUpperCase()
            );
            console.log('Compatible vehicles:', compatibleVehicles);
            
            if (compatibleVehicles.length === 0) {
                const opt = document.createElement('option');
                opt.value = "";
                opt.textContent = "No compatible vehicles";
                opt.disabled = true;
                vehicleSelect.appendChild(opt);
            } else {
                compatibleVehicles.forEach(v => {
                    const opt = document.createElement('option');
                    opt.value = v.id.toString();
                    opt.textContent = `${v.vehicleNumber} (${v.type})`;
                    vehicleSelect.appendChild(opt);
                });
            }
        } else {
            console.log('No user or vehicles found');
            const opt = document.createElement('option');
            opt.value = "";
            opt.textContent = "No vehicles available";
            opt.disabled = true;
            vehicleSelect.appendChild(opt);
        }
        
        document.getElementById('bookingModal').classList.remove('hidden');
        document.getElementById('bookingModal').querySelector('.max-w-md').classList.remove('scale-95');
        document.getElementById('bookingModal').querySelector('.max-w-md').classList.add('scale-100');
    },
    async confirmBooking(e) {
        e.preventDefault();
        const vehicleSelect = document.getElementById('vehicleSelect');
        console.log('Confirm booking triggered');
        console.log('Selected slot:', state.selectedSlot);
        console.log('Selected vehicle ID:', vehicleSelect.value);
        
        if (!state.selectedSlot) {
            utils.showToast('Please select a time slot', 'error');
            return;
        }
        if (!vehicleSelect.value) {
            utils.showToast('Please select a vehicle', 'error');
            return;
        }
        
        utils.showLoading('confirmBooking');
        try {
            const bookingDate = new Date().toISOString().split('T')[0];
            const response = await api.createBooking(
                state.selectedStation.id,
                parseInt(vehicleSelect.value),
                state.selectedSlot,
                bookingDate
            );
            
            if (response.success) {
                document.getElementById('bookingModal').classList.add('hidden');
                utils.showToast(`Booked at ${state.selectedStation.name}`);
                
                state.selectedSlot = null;
                
                // Reload stations to update availability
                if (state.cities.length > 0) {
                    const currentCity = state.cities.find(c => 
                        state.stations.some(s => s.name.includes(c.name))
                    ) || state.cities[0];
                    await stationFunctions.generateStationsForCity(currentCity);
                }
                
                await uiFunctions.displayBookingHistory();
            } else {
                utils.showToast(response.message || 'Booking failed', 'error');
            }
        } catch (error) {
            console.error('Booking error:', error);
            utils.showToast(error.message || 'Booking failed', 'error');
        } finally {
            utils.hideLoading('confirmBooking');
        }
    }
};

const vehicleFunctions = {
    async showManageVehiclesModal() {
        const modal = document.getElementById('manageVehiclesModal');
        const currentVehicles = document.getElementById('currentVehicles');
        const addVehicleSection = document.getElementById('addVehicleSection');
        
        currentVehicles.innerHTML = '<h3 class="text-lg font-semibold mb-2">Current Vehicles</h3>';
        
        try {
            const response = await api.getVehicles();
            if (response.success) {
                state.userVehicles = response.vehicles;
                if (response.vehicles.length === 0) {
                    currentVehicles.innerHTML += '<p class="text-gray-500 dark:text-gray-400">No vehicles added.</p>';
                } else {
                    response.vehicles.forEach(v => {
                        const div = document.createElement('div');
                        div.className = 'p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2';
                        div.textContent = `${v.vehicleNumber} (${v.type})`;
                        currentVehicles.appendChild(div);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading vehicles:', error);
            currentVehicles.innerHTML += '<p class="text-red-500">Failed to load vehicles.</p>';
        }
        
        if (state.userVehicles.length >= 5) {
            addVehicleSection.classList.add('hidden');
        } else {
            addVehicleSection.classList.remove('hidden');
        }
        
        modal.classList.remove('hidden');
        modal.querySelector('.max-w-md').classList.remove('scale-95');
        modal.querySelector('.max-w-md').classList.add('scale-100');
        utils.toggleSidebar();
    },
    async addVehicle() {
        const vehicleNumber = document.getElementById('newVehicleNumber').value.trim().toUpperCase();
        const vehicleType = document.getElementById('newVehicleType').value.toUpperCase();
        
        utils.clearErrors();
        if (!vehicleNumber || !utils.validateVehicleNumber(vehicleNumber)) {
            utils.showError('addVehicleError', 'Valid vehicle number required (e.g., MH-12-AB-1234)');
            return;
        }
        if (!vehicleType) {
            utils.showError('addVehicleError', 'Vehicle type required');
            return;
        }
        
        utils.showLoading('addVehicleBtn');
        try {
            const response = await api.addVehicle(vehicleNumber, vehicleType);
            if (response.success) {
                document.getElementById('newVehicleNumber').value = '';
                document.getElementById('newVehicleType').value = '';
                document.getElementById('manageVehiclesModal').classList.add('hidden');
                utils.showToast('Vehicle added successfully');
                await this.showManageVehiclesModal();
            } else {
                utils.showError('addVehicleError', response.message || 'Failed to add vehicle');
            }
        } catch (error) {
            console.error('Add vehicle error:', error);
            utils.showError('addVehicleError', error.message || 'Failed to add vehicle');
        } finally {
            utils.hideLoading('addVehicleBtn');
        }
    }
};

const authFunctions = {
    initAuth: () => {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active:bg-primary-teal', 'active:text-white'));
                document.querySelectorAll('.auth-form-container').forEach(f => f.classList.add('hidden'));
                tab.classList.add('active:bg-primary-teal', 'active:text-white');
                document.getElementById(`${tab.dataset.tab}Form`).classList.remove('hidden');
                utils.clearErrors();
            });
        });
        
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            authFunctions.handleLogin();
        });
        
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            authFunctions.handleRegistration();
        });
    },
    showAuthModal: (tab) => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active:bg-primary-teal', 'active:text-white'));
        document.querySelectorAll('.auth-form-container').forEach(f => f.classList.add('hidden'));
        document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active:bg-primary-teal', 'active:text-white');
        document.getElementById(`${tab}Form`).classList.remove('hidden');
        document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('authModal').querySelector('.max-w-md').classList.remove('scale-95');
        document.getElementById('authModal').querySelector('.max-w-md').classList.add('scale-100');
        utils.toggleSidebar();
    },
    async handleLogin() {
        const email = utils.normalizeEmail(document.getElementById('loginEmail').value);
        const password = document.getElementById('loginPassword').value;
        
        utils.clearErrors();
        if (!email || !utils.validateEmail(email)) {
            utils.showError('loginEmailError', 'Valid email required');
            return;
        }
        if (!password) {
            utils.showError('loginPasswordError', 'Password required');
            return;
        }
        
        utils.showLoading('loginSubmitBtn');
        try {
            const response = await api.login(email, password);
            if (response.success) {
                state.currentUser = response.user;
                document.getElementById('userName').textContent = response.user.name;
                document.getElementById('userAvatar').textContent = response.user.name.charAt(0).toUpperCase();
                document.getElementById('userInfo').classList.remove('hidden');
                document.getElementById('loginBtn').classList.add('hidden');
                document.getElementById('signupBtn').classList.add('hidden');
                document.getElementById('manageVehiclesLink').classList.remove('hidden');
                document.getElementById('authModal').classList.add('hidden');
                
                // Load user vehicles
                await authFunctions.loadUserVehicles();
                await uiFunctions.displayBookingHistory();
                
                utils.showToast(`Welcome, ${response.user.name}`);
            } else {
                utils.showError('loginError', response.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            utils.showError('loginError', error.message || 'Login failed');
        } finally {
            utils.hideLoading('loginSubmitBtn');
        }
    },
    async handleRegistration() {
        const name = document.getElementById('registerName').value;
        const email = utils.normalizeEmail(document.getElementById('registerEmail').value);
        const password = document.getElementById('registerPassword').value;
        const vehicleNumbers = document.querySelectorAll('.vehicle-number');
        const vehicleTypes = document.querySelectorAll('.vehicle-type');
        const vehicles = [];
        
        utils.clearErrors();
        if (!name) {
            utils.showError('registerNameError', 'Name required');
            return;
        }
        if (!email || !utils.validateEmail(email)) {
            utils.showError('registerEmailError', 'Valid email required');
            return;
        }
        if (!password || password.length < 6) {
            utils.showError('registerPasswordError', 'Password must be 6+ characters');
            return;
        }
        
        let hasAtLeastOneVehicle = false;
        vehicleNumbers.forEach((input, index) => {
            const number = input.value.trim().toUpperCase();
            const type = vehicleTypes[index].value.toUpperCase();
            const idx = index + 1;
            
            if (number || type) {
                if (!number || !utils.validateVehicleNumber(number)) {
                    utils.showError(`vehicle${idx}Error`, 'Valid vehicle number required (e.g., MH-12-AB-1234)');
                    return;
                }
                if (!type) {
                    utils.showError(`vehicle${idx}Error`, 'Vehicle type required');
                    return;
                }
                vehicles.push({
                    vehicleNumber: number,
                    type: type
                });
                if (idx === 1) hasAtLeastOneVehicle = true;
            }
        });
        
        if (!hasAtLeastOneVehicle) {
            utils.showError('vehicle1Error', 'At least one vehicle is required');
            return;
        }
        
        utils.showLoading('registerSubmitBtn');
        try {
            const response = await api.register({ name, email, password, vehicles });
            if (response.success) {
                document.getElementById('authModal').classList.add('hidden');
                utils.showToast(`Welcome, ${name}`);
                // Auto login after registration
                state.currentUser = response.user;
                document.getElementById('userName').textContent = response.user.name;
                document.getElementById('userAvatar').textContent = response.user.name.charAt(0).toUpperCase();
                document.getElementById('userInfo').classList.remove('hidden');
                document.getElementById('loginBtn').classList.add('hidden');
                document.getElementById('signupBtn').classList.add('hidden');
                document.getElementById('manageVehiclesLink').classList.remove('hidden');
                
                // Load user vehicles
                await authFunctions.loadUserVehicles();
            } else {
                utils.showError('registerError', response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            utils.showError('registerError', error.message || 'Registration failed');
        } finally {
            utils.hideLoading('registerSubmitBtn');
        }
    },
    async loadUserVehicles() {
        try {
            const response = await api.getVehicles();
            if (response.success) {
                state.userVehicles = response.vehicles;
            }
        } catch (error) {
            console.error('Error loading vehicles:', error);
        }
    },
    async logout() {
        try {
            await api.logout();
            state.currentUser = null;
            state.userVehicles = [];
            document.getElementById('userInfo').classList.add('hidden');
            document.getElementById('loginBtn').classList.remove('hidden');
            document.getElementById('signupBtn').classList.remove('hidden');
            document.getElementById('manageVehiclesLink').classList.add('hidden');
            document.getElementById('bookingHistoryContent').classList.add('hidden');
            document.getElementById('homeContent').classList.remove('hidden');
            utils.showToast('Logged out');
            utils.toggleSidebar();
        } catch (error) {
            console.error('Logout error:', error);
            utils.showToast('Logout failed', 'error');
        }
    }
};

const uiFunctions = {
    initUI: () => {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                console.log('Filter clicked:', tab.dataset.type);
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('bg-indigo-100', 'dark:bg-indigo-900'));
                tab.classList.add('bg-indigo-100', 'dark:bg-indigo-900');
                state.currentFilter = tab.dataset.type;
                stationFunctions.displayStations();
                utils.toggleSidebar();
            });
        });
        
        document.getElementById('locationInput').addEventListener('input', (e) => {
            stationFunctions.showSearchSuggestions(e.target.value);
        });
        document.getElementById('searchBtn').addEventListener('click', () => {
            stationFunctions.searchStations();
        });
        document.getElementById('locationInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') stationFunctions.searchStations();
        });
        
        document.getElementById('sidebarToggle').addEventListener('click', utils.toggleSidebar);
        document.getElementById('closeSidebar').addEventListener('click', utils.toggleSidebar);
        document.getElementById('sidebarOverlay').addEventListener('click', utils.toggleSidebar);
        
        document.getElementById('homeLink').addEventListener('click', () => {
            document.getElementById('homeContent').classList.remove('hidden');
            document.getElementById('bookingHistoryContent').classList.add('hidden');
            utils.toggleSidebar();
        });
        
        document.getElementById('bookingHistoryLink').addEventListener('click', () => {
            document.getElementById('homeContent').classList.add('hidden');
            document.getElementById('bookingHistoryContent').classList.remove('hidden');
            uiFunctions.displayBookingHistory();
            utils.toggleSidebar();
        });
        
        document.getElementById('manageVehiclesLink').addEventListener('click', vehicleFunctions.showManageVehiclesModal);
        document.getElementById('closeManageVehiclesModal').addEventListener('click', () => {
            document.getElementById('manageVehiclesModal').classList.add('hidden');
        });
        document.getElementById('addVehicleBtn').addEventListener('click', vehicleFunctions.addVehicle);
        
        document.getElementById('loginBtn').addEventListener('click', () => authFunctions.showAuthModal('login'));
        document.getElementById('signupBtn').addEventListener('click', () => authFunctions.showAuthModal('register'));
        document.getElementById('logoutBtn').addEventListener('click', authFunctions.logout);
        document.getElementById('closeAuthModal').addEventListener('click', () => {
            document.getElementById('authModal').classList.add('hidden');
        });
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('bookingModal').classList.add('hidden');
            state.selectedSlot = null;
        });
        document.getElementById('bookingForm').addEventListener('submit', bookingFunctions.confirmBooking);
        
        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const isDark = document.body.classList.contains('dark');
            document.getElementById('themeIcon').textContent = isDark ? '☀' : '🌙';
        });
    },
    async displayBookingHistory() {
        console.log('Displaying booking history');
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = '';
        
        if (!state.currentUser) {
            timeline.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">Please login to view booking history</p>';
            return;
        }
        
        try {
            const response = await api.getBookings();
            if (response.success) {
                const bookings = response.bookings;
                if (bookings.length === 0) {
                    timeline.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">No bookings yet</p>';
                    return;
                }
                
                bookings.forEach((b, i) => {
                    const isCompleted = b.completed || b.status === 'completed';
                    const item = document.createElement('div');
                    item.className = `relative pl-8 pb-4 ${isCompleted ? 'opacity-70' : ''
                        }`;
                    item.innerHTML = `
                        <div class="absolute left-0 top-0 w-4 h-4 bg-accent-indigo rounded-full"></div>
                        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-lg flex gap-4 animate-slide-in-left" style="animation-delay: ${i * 0.2}s">
                            <img src="${b.image}" alt="${b.stationName}" class="w-16 h-10 object-cover rounded" onerror="this.src='${utils.getDefaultImage(b.stationType)}'">
                            <div>
                                <h4 class="text-lg font-semibold text-accent-indigo dark:text-indigo-400">${b.stationName} (${b.stationType})</h4>
                                <p class="text-sm text-gray-700 dark:text-gray-300">Date: ${b.date}</p>
                                <p class="text-sm text-gray-700 dark:text-gray-300">Time: ${b.time}</p>
                                <p class="text-sm text-gray-700 dark:text-gray-300">Vehicle: ${b.vehicle ? b.vehicle.vehicleNumber + ' (' + b.vehicle.type + ')' : 'None'}</p>
                                <p class="text-sm text-gray-700 dark:text-gray-300">Status: ${isCompleted ? 'Completed' : 'Upcoming'}</p>
                            </div>
                        </div>
                    `;
                    timeline.appendChild(item);
                });
            } else {
                timeline.innerHTML = '<p class="text-center text-red-500">Failed to load bookings</p>';
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            timeline.innerHTML = '<p class="text-center text-red-500">Failed to load bookings</p>';
        }
    }
};

// Global callback function for Google Maps API
window.initGoogleMap = function() {
    console.log('Google Maps API loaded');
    // Wait for DOM to be ready, then initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
};

// Initialize app function
async function initializeApp() {
    console.log('Initializing app');
    try {
        // Check if user is already logged in
        try {
            const authResponse = await api.checkAuth();
            if (authResponse.success && authResponse.authenticated) {
                state.currentUser = authResponse.user;
                document.getElementById('userName').textContent = authResponse.user.name;
                document.getElementById('userAvatar').textContent = authResponse.user.name.charAt(0).toUpperCase();
                document.getElementById('userInfo').classList.remove('hidden');
                document.getElementById('loginBtn').classList.add('hidden');
                document.getElementById('signupBtn').classList.add('hidden');
                document.getElementById('manageVehiclesLink').classList.remove('hidden');
                await authFunctions.loadUserVehicles();
            }
        } catch (error) {
            console.log('No active session');
        }
        
        // Initialize map (will be called when Google Maps API is ready)
        if (typeof google !== 'undefined' && google.maps) {
            mapFunctions.initMap();
        } else {
            console.error('Google Maps API not loaded');
            document.getElementById('mapFallback').classList.remove('hidden');
        }
        
        authFunctions.initAuth();
        uiFunctions.initUI();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error during app initialization:', error);
        document.getElementById('stationsFallback').innerHTML = 'Failed to initialize app. Please refresh the page.';
        document.getElementById('mapFallback').classList.remove('hidden');
    }
}

// Fallback: If DOM loads before Google Maps callback
document.addEventListener('DOMContentLoaded', () => {
    // If Google Maps is already loaded, initialize app
    if (typeof google !== 'undefined' && google.maps) {
        if (!state.map) {
            initializeApp();
        }
    }
});
