window.previewGridImage = function (input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.getElementById(previewId);
            img.src = e.target.result;
            img.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.endsWith('dashboard.html')) return;

    const API_URL = (typeof CONFIG !== 'undefined' && CONFIG.apiUrl)
        ? `${CONFIG.apiUrl}/bikes`
        : 'https://hariharabikebazar.onrender.com/api/bikes';
    let allBikes = [];

    // --- API Calls ---
    async function getBikes() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch bikes');
            allBikes = await response.json();
            return allBikes;
        } catch (error) {
            console.error('Error fetching bikes:', error);
            return [];
        }
    }

    async function addBike(bikeData) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bikeData)
            });
            if (!response.ok) throw new Error('Failed to add bike');
            return await response.json();
        } catch (error) {
            console.error('Error adding bike:', error);
            return null;
        }
    }

    async function updateBike(id, bikeData) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bikeData)
            });
            if (!response.ok) throw new Error('Failed to update bike');
            return await response.json();
        } catch (error) {
            console.error('Error updating bike:', error);
            return null;
        }
    }

    async function deleteBike(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete bike');
            await renderBikesTable();
            await updateStats();
        } catch (error) {
            console.error('Error deleting bike:', error);
        }
    }

    // --- UI Navigation ---
    const navDashboard = document.getElementById('navDashboard');
    const navAddBike = document.getElementById('navAddBike');
    const navManageBikes = document.getElementById('navManageBikes');

    const viewDashboard = document.getElementById('viewDashboard');
    const viewAddBike = document.getElementById('viewAddBike');
    const viewManageBikes = document.getElementById('viewManageBikes');
    const viewEditBike = document.getElementById('viewEditBike');
    const topBarTitle = document.querySelector('.top-bar h1');

    function switchView(viewName) {
        viewDashboard.style.display = 'none';
        viewAddBike.style.display = 'none';
        viewManageBikes.style.display = 'none';
        if (viewEditBike) viewEditBike.style.display = 'none';

        navDashboard.classList.remove('active');
        navAddBike.classList.remove('active');
        navManageBikes.classList.remove('active');

        if (viewName === 'dashboard') {
            viewDashboard.style.display = 'block';
            navDashboard.classList.add('active');
            topBarTitle.textContent = 'Dashboard Overview';
            const adminName = sessionStorage.getItem('adminUsername') || 'Admin';
            document.querySelector('.admin-profile').textContent = `Welcome, ${adminName}`;
            updateStats();
        } else if (viewName === 'addBike') {
            viewAddBike.style.display = 'block';
            navAddBike.classList.add('active');
            topBarTitle.textContent = 'Upload New Bike';
        } else if (viewName === 'manageBikes') {
            viewManageBikes.style.display = 'block';
            navManageBikes.classList.add('active');
            topBarTitle.textContent = 'Manage Bikes';
            renderBikesTable();
        } else if (viewName === 'editBike') {
            if (viewEditBike) viewEditBike.style.display = 'block';
            navManageBikes.classList.add('active');
            topBarTitle.textContent = 'Edit Bike';
        }
    }

    navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchView('dashboard'); });
    navAddBike.addEventListener('click', (e) => { e.preventDefault(); switchView('addBike'); });
    navManageBikes.addEventListener('click', (e) => { e.preventDefault(); switchView('manageBikes'); });

    async function updateStats() {
        const bikes = await getBikes();
        document.getElementById('totalBikesCount').textContent = bikes.length;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCount = bikes.filter(b => new Date(b.uploadDate) >= sevenDaysAgo).length;
        document.getElementById('recentBikesCount').textContent = recentCount;
    }

    // Helper to read file to base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsDataURL(file);
        });
    }

    // --- Add Form Handling ---
    const addBikeForm = document.getElementById('addBikeForm');
    if (addBikeForm) {
        addBikeForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = addBikeForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';

            try {
                let base64Images = [];
                for (let i = 0; i < 5; i++) {
                    const fileInput = document.getElementById(`add-file-${i}`);
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        const b64 = await readFileAsBase64(fileInput.files[0]);
                        base64Images.push(b64);
                    }
                }

                if (base64Images.length === 0) {
                    alert('Please select at least the primary image.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Upload Bike';
                    return;
                }

                const newBike = {
                    name: document.getElementById('bikeName').value,
                    brand: document.getElementById('bikeBrand').value,
                    price: document.getElementById('bikePrice').value,
                    year: document.getElementById('bikeYear').value,
                    mileage: document.getElementById('bikeMileage').value,
                    images: base64Images,
                    description: document.getElementById('bikeDescription').value,
                };

                const savedBike = await addBike(newBike);

                if (savedBike) {
                    alert('Bike uploaded successfully!');
                    addBikeForm.reset();
                    // Clear all previews
                    for (let i = 0; i < 5; i++) {
                        const preview = document.getElementById(`add-preview-${i}`);
                        if (preview) { preview.src = ''; preview.style.display = 'none'; }
                    }
                    switchView('manageBikes');
                } else {
                    alert('Failed to upload bike.');
                }
            } catch (err) {
                console.error("Error during file read", err);
                alert('Failed to read images.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Upload Bike';
            }
        });
    }

    // --- Edit Form Handling ---
    const editBikeForm = document.getElementById('editBikeForm');
    if (editBikeForm) {
        editBikeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = editBikeForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const bikeId = document.getElementById('editBikeId').value;

            try {
                let base64Images = [];
                for (let i = 0; i < 5; i++) {
                    const fileInput = document.getElementById(`edit-file-${i}`);
                    const existingInput = document.getElementById(`edit-existing-${i}`);

                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        // User uploaded a new file for this zone
                        const b64 = await readFileAsBase64(fileInput.files[0]);
                        base64Images.push(b64);
                    } else if (existingInput && existingInput.value) {
                        // Use existing image
                        base64Images.push(existingInput.value);
                    }
                }

                if (base64Images.length === 0) {
                    alert('At least one image is required.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save Changes';
                    return;
                }

                const updatedData = {
                    name: document.getElementById('editBikeName').value,
                    brand: document.getElementById('editBikeBrand').value,
                    price: document.getElementById('editBikePrice').value,
                    year: document.getElementById('editBikeYear').value,
                    mileage: document.getElementById('editBikeMileage').value,
                    images: base64Images,
                    description: document.getElementById('editBikeDescription').value,
                };

                const savedBike = await updateBike(bikeId, updatedData);

                if (savedBike) {
                    alert('Bike updated successfully!');
                    switchView('manageBikes');
                } else {
                    alert('Failed to update bike.');
                }
            } catch (err) {
                console.error("Error during update", err);
                alert('Error updating bike.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Changes';
            }
        });
    }

    window.openEditBike = function (id) {
        const bike = allBikes.find(b => (b._id || b.id) === id);
        if (!bike) return;

        document.getElementById('editBikeId').value = id;
        document.getElementById('editBikeName').value = bike.name || '';
        document.getElementById('editBikeBrand').value = bike.brand || '';
        document.getElementById('editBikePrice').value = bike.price || '';
        document.getElementById('editBikeYear').value = bike.year || '';
        document.getElementById('editBikeMileage').value = bike.mileage || '';
        document.getElementById('editBikeDescription').value = bike.description || '';

        // Reset inputs and previews
        for (let i = 0; i < 5; i++) {
            const preview = document.getElementById(`edit-preview-${i}`);
            const existingInput = document.getElementById(`edit-existing-${i}`);
            const fileInput = document.getElementById(`edit-file-${i}`);
            if (fileInput) fileInput.value = '';

            if (bike.images && bike.images[i]) {
                if (preview) { preview.src = bike.images[i]; preview.style.display = 'block'; }
                if (existingInput) { existingInput.value = bike.images[i]; }
            } else {
                if (preview) { preview.src = ''; preview.style.display = 'none'; }
                if (existingInput) { existingInput.value = ''; }
            }
        }

        switchView('editBike');
    };

    // --- Rendering Table ---
    async function renderBikesTable() {
        const tbody = document.getElementById('bikesTableBody');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading bikes...</td></tr>';

        const bikes = await getBikes();

        if (bikes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No bikes uploaded yet.</td></tr>';
            return;
        }

        tbody.innerHTML = '';

        bikes.forEach(bike => {
            const tr = document.createElement('tr');
            const bikeId = bike._id || bike.id;

            const tdImage = document.createElement('td');
            const img = document.createElement('img');
            const primaryImage = (bike.images && bike.images.length > 0) ? bike.images[0] : (bike.image || 'https://via.placeholder.com/60x40?text=No+Img');
            img.src = primaryImage;
            img.className = 'bike-img-thumbnail';
            img.onerror = function () { this.src = 'https://via.placeholder.com/60x40?text=Error'; };
            tdImage.appendChild(img);

            const tdName = document.createElement('td');
            tdName.textContent = bike.name;
            tdName.style.fontWeight = '500';

            const tdBrand = document.createElement('td');
            tdBrand.textContent = bike.brand;

            const tdYear = document.createElement('td');
            tdYear.textContent = bike.year;

            const tdPrice = document.createElement('td');
            tdPrice.textContent = '₹' + parseInt(bike.price).toLocaleString('en-IN');

            const tdActions = document.createElement('td');

            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn';
            editBtn.textContent = 'Edit';
            editBtn.style.color = 'var(--primary-color)';
            editBtn.style.marginRight = '10px';
            editBtn.onclick = () => window.openEditBike(bikeId);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => {
                if (confirm(`Are you sure you want to delete ${bike.name}?`)) {
                    deleteBike(bikeId);
                }
            };

            tdActions.appendChild(editBtn);
            tdActions.appendChild(deleteBtn);

            tr.appendChild(tdImage);
            tr.appendChild(tdName);
            tr.appendChild(tdBrand);
            tr.appendChild(tdYear);
            tr.appendChild(tdPrice);
            tr.appendChild(tdActions);

            tbody.appendChild(tr);
        });
    }

    updateStats();
});
