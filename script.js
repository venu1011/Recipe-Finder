// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const recipeGrid = document.getElementById('recipe-grid');
const featuredRecipesGrid = document.getElementById('featured-recipes-grid');
const loadingSpinner = document.getElementById('loading-spinner');
const noResults = document.getElementById('no-results');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const favoritesLink = document.getElementById('favorites-link');
const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));
const addToFavoritesBtn = document.getElementById('addToFavorites');
const spotlightRecipeImage = document.getElementById('spotlightRecipeImage');
const spotlightRecipeTitle = document.getElementById('spotlightRecipeTitle');
const spotlightRecipeDescription = document.getElementById('spotlightRecipeDescription');
const viewSpotlightRecipeBtn = document.getElementById('viewSpotlightRecipe');
const modalTitle = document.getElementById('recipeModalLabel');
const modalImage = document.getElementById('modalRecipeImage');
const modalIngredients = document.getElementById('modalIngredients');
const modalInstructions = document.getElementById('modalInstructions');
const modalYoutube = document.getElementById('modalYoutube');
const categoryFilter = document.getElementById('category-filter');
const areaFilter = document.getElementById('area-filter');
const timeFilter = document.getElementById('time-filter');
const dietaryFilter = document.getElementById('dietary-filter');
const toastContainer = document.querySelector('.toast-container');

// Featured Recipe Elements
const featuredRecipeTitle = document.getElementById('featuredRecipeTitle');
const featuredRecipeDescription = document.getElementById('featuredRecipeDescription');
const featuredRecipeImage = document.getElementById('featuredRecipeImage');
const viewFeaturedRecipe = document.getElementById('viewFeaturedRecipe');

// Constants
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const FAVORITES_KEY = 'recipe-favorites';
let currentRecipe = null;
let spotlightRecipe = null;
let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
let currentFilters = {
    category: '',
    area: '',
    time: '',
    dietary: ''
};

// Initialize the app
function init() {
    // Set initial dark mode state
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Add event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    darkModeToggle.addEventListener('click', toggleDarkMode);
    favoritesLink.addEventListener('click', showFavorites);
    addToFavoritesBtn.addEventListener('click', toggleFavorite);

    // Add filter event listeners
    categoryFilter.addEventListener('change', handleFilterChange);
    areaFilter.addEventListener('change', handleFilterChange);
    timeFilter.addEventListener('change', handleFilterChange);
    dietaryFilter.addEventListener('change', handleFilterChange);

    // Initialize search history
    initializeSearchHistory();

    // Load random recipes
    loadRandomRecipes();
    loadFeaturedRecipes();
}

// Load spotlight recipe
async function loadSpotlightRecipe() {
    try {
        const response = await fetch(`${API_BASE_URL}/random.php`);
        const data = await response.json();
        
        if (data.meals && data.meals[0]) {
            spotlightRecipe = data.meals[0];
            updateSpotlightRecipeUI(spotlightRecipe);
        }
    } catch (error) {
        console.error('Error loading spotlight recipe:', error);
        showToast('Error loading spotlight recipe');
    }
}

// Update spotlight recipe UI
function updateSpotlightRecipeUI(recipe) {
    if (!spotlightRecipeImage || !spotlightRecipeTitle || !spotlightRecipeDescription) {
        console.warn('Spotlight recipe elements not found');
        return;
    }
    
    spotlightRecipeImage.src = recipe.strMealThumb;
    spotlightRecipeTitle.textContent = recipe.strMeal;
    spotlightRecipeDescription.textContent = recipe.strInstructions.substring(0, 200) + '...';
}

// Load featured recipes
async function loadFeaturedRecipes() {
    try {
        const featuredRecipes = [];
        // Fetch 4 random recipes
        for (let i = 0; i < 4; i++) {
            const response = await fetch(`${API_BASE_URL}/random.php`);
            const data = await response.json();
            if (data.meals && data.meals[0]) {
                featuredRecipes.push(data.meals[0]);
            }
        }
        displayFeaturedRecipes(featuredRecipes);
    } catch (error) {
        console.error('Error loading featured recipes:', error);
        showToast('Error loading featured recipes', 'error');
    }
}

// Display featured recipes
function displayFeaturedRecipes(recipes) {
    featuredRecipesGrid.innerHTML = '';
    recipes.forEach(recipe => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3';
        
        const card = document.createElement('div');
        card.className = 'featured-recipe-card';
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            </div>
            <div class="card-content">
                <h3 class="card-title">${recipe.strMeal}</h3>
                <p class="card-text">${recipe.strInstructions.substring(0, 150)}...</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-view" data-id="${recipe.idMeal}">
                    View Recipe
                </button>
            </div>
        `;
        
        col.appendChild(card);
        featuredRecipesGrid.appendChild(col);
        
        // Add click event to view recipe button
        card.querySelector('.btn-view').addEventListener('click', () => {
            showRecipeDetails(recipe.idMeal);
        });
    });
}

// Search history functionality
function initializeSearchHistory() {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    updateSearchHistoryUI(searchHistory);
}

function updateSearchHistoryUI(history) {
    const searchHistoryList = document.getElementById('searchHistoryList');
    searchHistoryList.innerHTML = '';
    
    history.forEach(term => {
        const li = document.createElement('li');
        li.textContent = term;
        li.style.cursor = 'pointer';
        li.style.padding = '8px 15px';
        li.style.transition = 'background-color 0.3s ease';
        
        li.addEventListener('click', () => {
            searchInput.value = term;
            handleSearch();
            // Hide the dropdown after selection
            document.querySelector('.search-history-dropdown').style.display = 'none';
        });
        
        li.addEventListener('mouseover', () => {
            li.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        });
        
        li.addEventListener('mouseout', () => {
            li.style.backgroundColor = 'transparent';
        });
        
        searchHistoryList.appendChild(li);
    });
}

// Update search input event listeners
searchInput.addEventListener('focus', () => {
    const dropdown = document.querySelector('.search-history-dropdown');
    if (dropdown) {
        dropdown.style.display = 'block';
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.search-history-dropdown');
    const searchContainer = document.querySelector('.search-container');
    
    if (dropdown && searchContainer && !searchContainer.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Clear search history
document.getElementById('clearHistory').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the click from closing the dropdown
    localStorage.removeItem('searchHistory');
    updateSearchHistoryUI([]);
});

// Back to top button functionality
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Image loading animation
function handleImageLoad(img) {
    img.classList.remove('loading');
    img.classList.add('loaded');
}

// Update createRecipeCard function to include image loading
function createRecipeCard(recipe) {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-sm-6 fade-in';
    
    const card = document.createElement('div');
    card.className = 'card recipe-card glass';
    
    const img = document.createElement('img');
    img.src = recipe.strMealThumb;
    img.alt = recipe.strMeal;
    img.className = 'card-img-top loading';
    img.onload = () => handleImageLoad(img);
    
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${recipe.strMeal}</h5>
            <button class="btn btn-primary view-recipe" data-id="${recipe.idMeal}">
                View Details
            </button>
        </div>
    `;
    
    card.insertBefore(img, card.firstChild);
    col.appendChild(card);
    
    // Add click event to view recipe button
    const viewButton = col.querySelector('.view-recipe');
    viewButton.addEventListener('click', (e) => {
        e.preventDefault();
        const recipeId = viewButton.getAttribute('data-id');
        if (recipeId) {
            showRecipeDetails(recipeId);
        } else {
            showToast('Error: Recipe ID not found', 'error');
        }
    });
    
    return col;
}

// Handle search functionality
async function handleSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        showToast('Please enter a search term', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/search.php?s=${searchTerm}`);
        const data = await response.json();
        
        if (data.meals) {
            displayRecipes(data.meals);
            addToSearchHistory(searchTerm);
        } else {
            showToast('No recipes found. Try a different search term.', 'error');
            showNoResults();
        }
    } catch (error) {
        console.error('Error searching recipes:', error);
        showToast('Error searching recipes. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Load random recipes
async function loadRandomRecipes() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/random.php`);
        const data = await response.json();
        if (data.meals) {
            displayRecipes(data.meals);
        }
    } catch (error) {
        console.error('Error loading random recipes:', error);
        showToast('Error loading recipes. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display recipes in the grid
function displayRecipes(recipes) {
    recipeGrid.innerHTML = '';
    noResults.classList.add('d-none');
    
    if (!Array.isArray(recipes)) {
        console.error('Recipes is not an array:', recipes);
        showToast('Error displaying recipes', 'error');
        return;
    }
    
    if (recipes.length === 0) {
        showNoResults();
        return;
    }
    
    recipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        recipeGrid.appendChild(card);
    });
}

// Nutrition calculation functions
function calculateNutrition(recipe) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            ingredients.push({
                name: ingredient,
                measure: measure
            });
        }
    }

    // This is a simplified calculation - in a real app, you'd use a nutrition API
    const nutrition = {
        calories: Math.floor(Math.random() * 500) + 200, // Random value for demo
        protein: Math.floor(Math.random() * 30) + 10,
        carbs: Math.floor(Math.random() * 50) + 20,
        fat: Math.floor(Math.random() * 20) + 5,
        fiber: Math.floor(Math.random() * 10) + 2,
        sugar: Math.floor(Math.random() * 20) + 5,
        sodium: Math.floor(Math.random() * 1000) + 200
    };

    return nutrition;
}

function updateNutritionUI(nutrition) {
    // Update nutrition values
    document.getElementById('calories').textContent = `${nutrition.calories} kcal`;
    document.getElementById('protein').textContent = `${nutrition.protein}g`;
    document.getElementById('carbs').textContent = `${nutrition.carbs}g`;
    document.getElementById('fat').textContent = `${nutrition.fat}g`;

    // Update nutrition facts
    const nutritionFacts = document.getElementById('nutritionFacts');
    nutritionFacts.innerHTML = `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Fiber
            <span class="badge bg-primary rounded-pill">${nutrition.fiber}g</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Sugar
            <span class="badge bg-primary rounded-pill">${nutrition.sugar}g</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Sodium
            <span class="badge bg-primary rounded-pill">${nutrition.sodium}mg</span>
        </li>
    `;

    // Update nutrition chart
    const ctx = document.getElementById('nutritionChart').getContext('2d');
    
    // Check if chart exists and destroy it
    if (window.nutritionChart && typeof window.nutritionChart.destroy === 'function') {
        window.nutritionChart.destroy();
    }
    
    // Create new chart
    window.nutritionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                data: [nutrition.protein, nutrition.carbs, nutrition.fat],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 206, 86, 0.8)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Show recipe details in modal
async function showRecipeDetails(recipeId) {
    try {
        showLoading(true);
        console.log('Fetching recipe details for ID:', recipeId);
        
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${recipeId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.meals && data.meals[0]) {
            const recipe = data.meals[0];
            currentRecipe = recipe;
            
            // Update modal content
            document.getElementById('recipeModalLabel').textContent = recipe.strMeal;
            modalImage.src = recipe.strMealThumb;
            
            // Set ingredients list
            modalIngredients.innerHTML = '';
            for (let i = 1; i <= 20; i++) {
                const ingredient = recipe[`strIngredient${i}`];
                const measure = recipe[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== '') {
                    const li = document.createElement('li');
                    li.className = 'list-group-item glass';
                    li.textContent = `${measure} ${ingredient}`;
                    modalIngredients.appendChild(li);
                }
            }
            
            // Set instructions
            modalInstructions.textContent = recipe.strInstructions;
            
            // Set YouTube video if available
            if (recipe.strYoutube) {
                const videoId = recipe.strYoutube.split('v=')[1];
                modalYoutube.innerHTML = `
                    <h6 class="mb-3">Video Tutorial:</h6>
                    <div class="ratio ratio-16x9">
                        <iframe src="https://www.youtube.com/embed/${videoId}" 
                                title="YouTube video" 
                                allowfullscreen>
                        </iframe>
                    </div>
                `;
            } else {
                modalYoutube.innerHTML = '';
            }

            // Calculate and display nutrition information
            const nutrition = calculateNutrition(recipe);
            updateNutritionUI(nutrition);
            
            // Update favorite button state
            updateFavoriteButton();
            
            // Show modal
            recipeModal.show();
        } else {
            console.error('No recipe found for ID:', recipeId);
            showToast('Recipe details not found. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        showToast('Error loading recipe details. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Toggle favorite status
function toggleFavorite() {
    if (!currentRecipe) return;
    
    const index = favorites.findIndex(fav => fav.idMeal === currentRecipe.idMeal);
    
    if (index === -1) {
        favorites.push(currentRecipe);
        showToast('Added to favorites!', 'success');
    } else {
        favorites.splice(index, 1);
        showToast('Removed from favorites!', 'info');
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoriteButton();
}

// Update favorite button state
function updateFavoriteButton() {
    if (!currentRecipe) return;
    
    const isFavorite = favorites.some(fav => fav.idMeal === currentRecipe.idMeal);
    addToFavoritesBtn.innerHTML = isFavorite 
        ? '<i class="fas fa-heart"></i> Remove from Favorites'
        : '<i class="fas fa-heart"></i> Add to Favorites';
    
    addToFavoritesBtn.className = isFavorite
        ? 'btn btn-danger'
        : 'btn btn-primary';
}

// Show favorites
function showFavorites(e) {
    e.preventDefault();
    if (favorites.length === 0) {
        showToast('No favorites yet!', 'info');
        return;
    }

    // Clear the recipe grid
    recipeGrid.innerHTML = '';
    
    // Add a title for favorites section
    const titleRow = document.createElement('div');
    titleRow.className = 'row mb-4';
    titleRow.innerHTML = `
        <div class="col-12">
            <h2 class="section-title">
                <i class="fas fa-heart text-danger me-2"></i>
                My Favorite Recipes
            </h2>
        </div>
    `;
    recipeGrid.appendChild(titleRow);

    // Display favorite recipes
    favorites.forEach(recipe => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 fade-in';
        
        const card = document.createElement('div');
        card.className = 'card recipe-card glass';
        
        card.innerHTML = `
            <img src="${recipe.strMealThumb}" class="card-img-top" alt="${recipe.strMeal}">
            <div class="card-body">
                <h5 class="card-title">${recipe.strMeal}</h5>
                <div class="d-flex justify-content-between align-items-center">
                    <button class="btn btn-primary view-recipe" data-id="${recipe.idMeal}">
                        View Details
                    </button>
                    <button class="btn btn-danger remove-favorite" data-id="${recipe.idMeal}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        col.appendChild(card);
        recipeGrid.appendChild(col);
        
        // Add click event to view recipe button
        col.querySelector('.view-recipe').addEventListener('click', () => showRecipeDetails(recipe.idMeal));
        
        // Add click event to remove favorite button
        col.querySelector('.remove-favorite').addEventListener('click', () => removeFromFavorites(recipe.idMeal));
    });
}

// Remove recipe from favorites
function removeFromFavorites(recipeId) {
    favorites = favorites.filter(recipe => recipe.idMeal !== recipeId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    showToast('Recipe removed from favorites!', 'success');
    
    // Refresh the favorites display
    showFavorites(new Event('click'));
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', isDarkMode);
}

// Show/hide loading spinner
function showLoading(show) {
    loadingSpinner.classList.toggle('d-none', !show);
}

// Show no results message
function showNoResults() {
    recipeGrid.innerHTML = '';
    noResults.classList.remove('d-none');
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Handle filter changes
function handleFilterChange() {
    currentFilters = {
        category: categoryFilter.value,
        area: areaFilter.value,
        time: timeFilter.value,
        dietary: dietaryFilter.value
    };

    if (currentFilters.category || currentFilters.area) {
        searchByFilters();
    } else {
        loadRandomRecipes();
    }
}

// Helper function to estimate cooking time
function estimateCookingTime(recipe) {
    if (!recipe || !recipe.strInstructions) {
        return 30; // Default time if no instructions
    }
    
    const instructions = recipe.strInstructions;
    const wordCount = instructions.split(' ').length;
    return Math.ceil(wordCount / 50) * 5; // Rough estimate: 5 minutes per 50 words
}

// Filter by cooking time
async function filterByTime(recipes) {
    if (!Array.isArray(recipes)) {
        console.error('Recipes is not an array:', recipes);
        return [];
    }
    
    const filteredRecipes = [];
    const maxTime = parseInt(currentFilters.time);
    
    for (const recipe of recipes) {
        const details = await fetchRecipeDetails(recipe.idMeal);
        if (details) {
            const time = estimateCookingTime(details);
            if (time <= maxTime) {
                filteredRecipes.push(recipe);
            }
        }
    }
    
    return filteredRecipes;
}

// Filter by dietary restrictions
async function filterByDietary(meals) {
    const filteredMeals = [];
    
    for (const meal of meals) {
        const details = await fetchRecipeDetails(meal.idMeal);
        if (details) {
            const isVegetarian = checkIfVegetarian(details);
            const isVegan = checkIfVegan(details);
            const isGlutenFree = checkIfGlutenFree(details);
            
            if (
                (currentFilters.dietary === 'vegetarian' && isVegetarian) ||
                (currentFilters.dietary === 'vegan' && isVegan) ||
                (currentFilters.dietary === 'gluten-free' && isGlutenFree)
            ) {
                filteredMeals.push(meal);
            }
        }
    }
    
    return filteredMeals;
}

// Helper function to check if recipe is vegetarian
function checkIfVegetarian(recipe) {
    const nonVegetarianIngredients = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'seafood', 'meat'];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`]?.toLowerCase();
        if (ingredient && nonVegetarianIngredients.some(nonVeg => ingredient.includes(nonVeg))) {
            return false;
        }
    }
    return true;
}

// Helper function to check if recipe is vegan
function checkIfVegan(recipe) {
    const nonVeganIngredients = ['milk', 'cheese', 'butter', 'cream', 'egg', 'honey', 'yogurt'];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`]?.toLowerCase();
        if (ingredient && nonVeganIngredients.some(nonVegan => ingredient.includes(nonVegan))) {
            return false;
        }
    }
    return true;
}

// Helper function to check if recipe is gluten-free
function checkIfGlutenFree(recipe) {
    const glutenIngredients = ['flour', 'wheat', 'barley', 'rye', 'pasta', 'bread', 'couscous'];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`]?.toLowerCase();
        if (ingredient && glutenIngredients.some(gluten => ingredient.includes(gluten))) {
            return false;
        }
    }
    return true;
}

// Add missing functions
function addToSearchHistory(term) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    history = [term, ...history.filter(item => item !== term)].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    updateSearchHistoryUI(history);
}

function hideLoading() {
    showLoading(false);
}

async function fetchRecipeDetails(recipeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${recipeId}`);
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
}

// Search by filters
async function searchByFilters() {
    try {
        showLoading(true);
        let url = `${API_BASE_URL}/filter.php?`;
        
        if (currentFilters.category) {
            url += `c=${currentFilters.category}`;
        } else if (currentFilters.area) {
            url += `a=${currentFilters.area}`;
        } else {
            url = `${API_BASE_URL}/search.php?s=`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.meals) {
            let filteredRecipes = data.meals;
            
            if (currentFilters.time) {
                filteredRecipes = await filterByTime(filteredRecipes);
            }
            
            if (currentFilters.dietary) {
                filteredRecipes = filterByDietary(filteredRecipes);
            }
            
            displayRecipes(filteredRecipes);
        } else {
            showToast('No recipes found with these filters.', 'error');
            showNoResults();
        }
    } catch (error) {
        console.error('Error searching by filters:', error);
        showToast('Error applying filters. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 