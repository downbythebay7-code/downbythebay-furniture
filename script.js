// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Elements
const categorySelect = document.getElementById('category-select');
const searchInput = document.getElementById('search-input');
const fileInput = document.getElementById('json-upload');
const loginBtn = document.getElementById('employee-login-btn');

// Global data
let allProducts = [];
let currentCategory = 'all';
let currentSearch = '';

// Cart
let cart = [];
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

function updateCart() {
    const totalItems = cart.length;
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
    cartItemsEl.textContent = totalItems;
    cartTotalEl.textContent = `$${totalPrice}`;
    checkoutBtn.disabled = totalItems === 0;
}

// Inference keywords
const categoryKeywords = {
    'Living Room Furniture': ['sofa', 'couch', 'sectional', 'coffee table', 'tv stand', 'recliner'],
    'Bedroom Furniture': ['bed', 'headboard', 'dresser', 'nightstand', 'mattress'],
    'Dining Room Furniture': ['dining table', 'chair', 'bench', 'sideboard'],
    'Office Furniture': ['desk', 'office chair', 'file cabinet', 'bookcase'],
    'Outdoor & Patio Furniture': ['patio', 'outdoor', 'lounge chair', 'hammock', 'umbrella'],
    'Baby & Kids Furniture': ['crib', 'changing table', 'bunk bed', 'high chair'],
    'Accent Furniture': ['console', 'ottoman', 'shelf', 'mirror', 'lamp']
};

function inferCategory(title, desc = '') {
    const text = (title + ' ' + desc).toLowerCase();
    for (const [cat, words] of Object.entries(categoryKeywords)) {
        if (words.some(w => text.includes(w))) return cat;
    }
    return 'Uncategorized';
}

function extractCategory(item) {
    return item.category || item.listing_category || item.sub_category || inferCategory(item.title, item.description);
}

// Render products with filters
function renderProducts() {
    let filtered = allProducts;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (currentSearch) {
        const query = currentSearch.toLowerCase();
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
    }

    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#666; grid-column:1/-1;">No products found.</p>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/300x200?text=Furniture'}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Furniture'">
            <h3>${product.title}</h3>
            <p class="price">$${product.price.toLocaleString()}</p>
            <p style="font-size: 0.9rem; color: #666; margin-bottom: 1rem;">
                <strong>${product.category}</strong><br>
                ${product.description ? product.description.substring(0, 80) + '...' : 'High-quality piece.'}
            </p>
            <button class="btn-secondary add-to-cart" data-name="${product.title}" data-price="${product.price}">Add to Cart</button>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.onclick = () => {
            cart.push({ name: btn.dataset.name, price: parseFloat(btn.dataset.price) });
            updateCart();
        };
    });
}

// Populate categories
function populateCategories() {
    const cats = [...new Set(allProducts.map(p => p.category))].sort();
    categorySelect.innerHTML = '<option value="all">All Products</option>';
    cats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
    });
}

// Event Listeners
categorySelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderProducts();
});

searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim();
    renderProducts();
});

// Employee Login + Upload
loginBtn.addEventListener('click', () => {
    const pwd = prompt('Enter employee password:');
    if (pwd === 'TheBay832') {
        fileInput.click();
    } else if (pwd !== null) {
        alert('Incorrect468 password.');
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.json')) {
        alert('Please upload a .json file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            const items = Array.isArray(data) ? data : [data];

            allProducts = items.map(item => ({
                title: item.title || item.name || 'Untitled',
                price: parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0,
                image: item.image || item.photo || item.images?.[0] || null,
                description: item.description || item.body || '',
                category: extractCategory(item)
            })).filter(p => p.price > 0);

            if (allProducts.length === 0) throw new Error('No valid products.');

            populateCategories();
            currentCategory = 'all';
            currentSearch = '';
            searchInput.value = '';
            categorySelect.value = 'all';
            renderProducts();

            alert(`Loaded ${allProducts.length} products! Use search + category to filter.`);
        } catch (err) {
            alert('JSON Error: ' + err.message);
        }
    };
    reader.readAsText(file);
});

// Fallback products
const fallbackProducts = [
    { title: "Leather Sofa", price: 899, image: "images/sofa.jpg", description: "Brown leather, like new", category: "Living Room Furniture" },
    { title: "Queen Bed Frame", price: 250, image: "images/bed.jpg", description: "Wooden, sturdy", category: "Bedroom Furniture" }
];

allProducts = fallbackProducts;
populateCategories();
renderProducts();

// Checkout
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    alert(`Checkout: ${cart.length} items – $${cart.reduce((s,i)=>s+i.price,0).toFixed(2)}`);
    cart = [];
    updateCart();
});

// Contact form
document.getElementById('contact-form').addEventListener('submit', e => {
    e.preventDefault();
    alert('Message sent!');
    e.target.reset();
});

// Year
document.getElementById('year').textContent = new Date().getFullYear();