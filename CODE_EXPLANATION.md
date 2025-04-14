# Recipe Finder App - Detailed Code Explanation

## 1. index.html - Complete Explanation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recipe Finder</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="styles.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
```
- **DOCTYPE**: Declares this is an HTML5 document
- **Meta Tags**: 
  - charset="UTF-8" ensures proper character display
  - viewport tag makes the site responsive on mobile devices
- **Title**: Sets the browser tab title
- **CSS Links**: 
  - Bootstrap for responsive layout
  - Custom styles for our app
  - Font Awesome for icons
  - Google Fonts for typography

```html
<body>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg">
        <div class="container">
            <a class="navbar-brand" href="#">Recipe Finder</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="favorites-link">
                            <i class="fas fa-heart"></i> Favorites
                        </a>
                    </li>
                    <li class="nav-item">
                        <button class="btn btn-link nav-link" id="dark-mode-toggle">
                            <i class="fas fa-moon"></i>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
```
- **Navigation Bar**:
  - Responsive navbar that collapses on mobile
  - Contains app title, favorites link, and dark mode toggle
  - Uses Bootstrap classes for styling and functionality

```html
    <!-- Search Section -->
    <section class="search-section">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="search-container">
                        <input type="text" id="searchInput" class="form-control" placeholder="Search for recipes...">
                        <button id="searchButton" class="btn btn-primary">
                            <i class="fas fa-search"></i>
                        </button>
                        <!-- Search History Dropdown -->
                        <div class="search-history-dropdown">
                            <div class="search-history-header">
                                <span>Recent Searches</span>
                                <button id="clearHistory" class="btn btn-sm btn-link">Clear</button>
                            </div>
                            <ul id="searchHistoryList" class="search-history-list"></ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
```
- **Search Section**:
  - Centered search input with button
  - Search history dropdown with clear option
  - Responsive layout using Bootstrap grid

```html
    <!-- Category Filters -->
    <section class="category-filters">
        <div class="container">
            <div class="row">
                <div class="col-md-3">
                    <select class="form-select" id="category-filter">
                        <option value="">All Categories</option>
                    </select>
                </div>
                <!-- Other filter dropdowns -->
            </div>
        </div>
    </section>
```
- **Category Filters**:
  - Dropdown menus for filtering recipes
  - Includes category, cuisine, time, and dietary filters
  - Uses Bootstrap form-select for styling

```html
    <!-- Recipe Grid -->
    <section class="recipe-grid-section">
        <div class="container">
            <div id="recipe-grid" class="row"></div>
            <div id="loading-spinner" class="text-center d-none">
                <div class="spinner-border" role="status"></div>
            </div>
            <div id="no-results" class="text-center d-none">
                <p>No recipes found. Try a different search term.</p>
            </div>
        </div>
    </section>
```
- **Recipe Grid**:
  - Container for recipe cards
  - Loading spinner for async operations
  - No results message display

```html
    <!-- Recipe Modal -->
    <div class="modal fade" id="recipeModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <!-- Modal content -->
            </div>
        </div>
    </div>
```
- **Recipe Modal**:
  - Bootstrap modal for recipe details
  - Large size for better content display
  - Contains recipe image, ingredients, and instructions

```html
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
```
- **Scripts**:
  - Bootstrap JavaScript for components
  - Custom JavaScript for app functionality

## 2. script.js - Complete Explanation

```javascript
// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const recipeGrid = document.getElementById('recipe-grid');
// ... other element selections
```
- **DOM Elements**:
  - Stores references to important HTML elements
  - Makes it easy to access and manipulate these elements

```javascript
// Constants
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const FAVORITES_KEY = 'recipe-favorites';
```
- **Constants**:
  - API endpoint for recipe data
  - Key for localStorage favorites

```javascript
// State Variables
let currentRecipe = null;
let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';
```
- **State Variables**:
  - Tracks current recipe being viewed
  - Stores favorite recipes
  - Manages dark mode state

```javascript
// Event Listeners
function init() {
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    // ... other event listeners
}
```
- **Event Listeners**:
  - Sets up user interaction handlers
  - Handles search, dark mode, favorites

```javascript
// API Functions
async function handleSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        showToast('Please enter a search term', 'error');
        return;
    }
    // ... API call and response handling
}
```
- **API Functions**:
  - Handles recipe search
  - Manages API requests and responses
  - Shows loading states and errors

```javascript
// UI Functions
function displayRecipes(recipes) {
    recipeGrid.innerHTML = '';
    recipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        recipeGrid.appendChild(card);
    });
}
```
- **UI Functions**:
  - Updates the display
  - Creates recipe cards
  - Manages modal content

```javascript
// Storage Functions
function addToFavorites(recipe) {
    favorites.push(recipe);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoriteButton();
}
```
- **Storage Functions**:
  - Manages localStorage
  - Handles favorites
  - Saves user preferences

## 3. styles.css - Complete Explanation

```css
/* Variables */
:root {
    --primary-color: #ff6b6b;
    --secondary-color: #4ecdc4;
    --text-color: #333;
    --bg-color: #f8f9fa;
}
```
- **CSS Variables**:
  - Defines reusable colors
  - Makes theme changes easier
  - Maintains consistency

```css
/* Base Styles */
body {
    font-family: 'Poppins', sans-serif;
    background: var(--bg-color);
    color: var(--text-color);
    transition: all 0.3s ease;
}
```
- **Base Styles**:
  - Sets default typography
  - Defines base colors
  - Adds smooth transitions

```css
/* Component Styles */
.recipe-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s ease;
}
```
- **Component Styles**:
  - Styles for recipe cards
  - Modal designs
  - Button styles

```css
/* Dark Mode */
.dark-mode {
    --bg-color: #121212;
    --text-color: #fff;
}
```
- **Dark Mode**:
  - Overrides light theme colors
  - Adjusts component styles
  - Maintains readability

```css
/* Responsive Design */
@media (max-width: 767px) {
    .recipe-card {
        margin-bottom: 20px;
    }
}
```
- **Responsive Design**:
  - Mobile-first approach
  - Adjusts layouts for different screens
  - Optimizes spacing and typography

This detailed explanation covers:
1. HTML structure and components
2. JavaScript functionality and logic
3. CSS styling and responsive design
4. How all parts work together

Each file serves a specific purpose:
- HTML: Structure and content
- JavaScript: Functionality and interactivity
- CSS: Styling and visual design 