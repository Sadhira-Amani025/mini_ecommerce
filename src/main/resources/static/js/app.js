/**
 * Mini E-Commerce - Frontend Core Script
 */

const API_BASE = '/api';

// --- Toast System ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast glass-panel ${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';

    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <div class="toast-content">${message}</div>
        <i class="fas fa-times toast-close" onclick="this.parentElement.remove()"></i>
    `;

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- Session Management ---
function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function isLoggedIn() {
    return !!getToken();
}

function saveSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function logout() {
    clearSession();
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// --- Navbar Configuration ---
function updateNavbar() {
    const user = getUser();
    const loginLink = document.getElementById('nav-login-link');
    const registerLink = document.getElementById('nav-register-link');
    const userDisplay = document.getElementById('nav-user-display');
    const adminLink = document.getElementById('nav-admin-link');
    const logoutBtn = document.getElementById('nav-logout-btn');

    if (isLoggedIn() && user) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        
        if (userDisplay) {
            userDisplay.style.display = 'flex';
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            userDisplay.innerHTML = `
                <div class="avatar">${initials}</div>
                <span>${user.name}</span>
            `;
        }

        if (adminLink) {
            adminLink.style.display = user.role === 'ROLE_ADMIN' ? 'flex' : 'none';
        }
        if (logoutBtn) logoutBtn.style.display = 'flex';

        // Update cart badge
        updateCartBadge();
    } else {
        if (loginLink) loginLink.style.display = 'flex';
        if (registerLink) registerLink.style.display = 'flex';
        if (userDisplay) userDisplay.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        const badge = document.getElementById('cart-badge');
        if (badge) badge.style.display = 'none';
    }
}

// --- Update Cart Badge ---
async function updateCartBadge() {
    if (!isLoggedIn()) return;

    // If we are currently on the cart page, hide the badge and mark as read
    if (window.location.pathname.endsWith('cart.html')) {
        const badge = document.getElementById('cart-badge');
        if (badge) badge.style.display = 'none';
        localStorage.setItem('cartBadgeHidden', 'true');
        return;
    }

    // Check if the badge has been hidden
    const isBadgeHidden = localStorage.getItem('cartBadgeHidden') === 'true';

    try {
        const res = await fetch(`${API_BASE}/cart`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (res.ok) {
            const cartItems = await res.json();
            const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
            
            const badge = document.getElementById('cart-badge');
            if (badge) {
                if (totalQty > 0 && !isBadgeHidden) {
                    badge.style.display = 'block';
                    badge.innerText = '';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    } catch (err) {
        console.error('Error updating cart badge', err);
    }
}

// --- Fetch & Render Products ---
async function fetchProducts(category = '') {
    const container = document.getElementById('product-grid');
    if (!container) return;

    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 0.5rem;">Loading products...</p></div>';

    try {
        let url = `${API_BASE}/products?t=${Date.now()}`;
        if (category && category !== 'all') {
            url = `${API_BASE}/products/category/${category}?t=${Date.now()}`;
        }

        const res = await fetch(url);
        if (res.ok) {
            const products = await res.json();
            renderProducts(products);
        } else {
            showToast('Failed to fetch products', 'error');
        }
    } catch (err) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><i class="fas fa-exclamation-triangle fa-2x" style="color: var(--danger-color);"></i><p style="margin-top: 0.5rem;">Error loading products.</p></div>';
    }
}

async function searchProducts(query) {
    const container = document.getElementById('product-grid');
    if (!container) return;

    if (!query.trim()) {
        fetchProducts('all');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}&t=${Date.now()}`);
        if (res.ok) {
            const products = await res.json();
            renderProducts(products);
            
            // Highlight active category filter off
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    } catch (err) {
        console.error('Search error', err);
    }
}

function renderProducts(products) {
    const container = document.getElementById('product-grid');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search fa-3x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No products found</h3>
                <p style="color: var(--text-secondary);">Try refining your search query.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => {
        const defaultImg = (product.category && product.category.toLowerCase() === 'stationery') 
            ? '/uploads/stationery_default.png' 
            : '/uploads/book_default.png';
        return `
        <div class="product-card glass-panel">
            <div class="product-img-container">
                <img src="${product.imageUrl || defaultImg}" alt="${product.name}" alt="${product.name}" onerror="this.src='${defaultImg}'">
                <span class="product-category-tag">${product.category}</span>
            </div>
            <div class="product-info">
                <h4 class="product-title">${product.name}</h4>
                <div class="product-meta">
                    <span class="product-price">₹${product.price}</span>
                    <button class="add-cart-btn" onclick="handleAddToCart(${product.id})" title="Add to Cart">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// --- Cart Operations ---
async function handleAddToCart(productId) {
    if (!isLoggedIn()) {
        showToast('Please login to add products to cart', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });

        if (res.ok) {
            localStorage.setItem('cartBadgeHidden', 'false');
            showToast('Product added to cart!', 'success');
            updateCartBadge();
        } else {
            const data = await res.json();
            showToast(data.message || 'Failed to add product to cart', 'error');
        }
    } catch (err) {
        showToast('Error adding product to cart', 'error');
    }
}

// --- Load Cart (Cart Page) ---
async function loadCartPage() {
    const itemsContainer = document.getElementById('cart-items-container');
    const checkoutPanel = document.getElementById('cart-checkout-panel');
    const emptyState = document.getElementById('cart-empty-state');
    const cartWrapper = document.getElementById('cart-wrapper');

    if (!itemsContainer) return;

    if (!isLoggedIn()) {
        if (cartWrapper) cartWrapper.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <i class="fas fa-lock empty-icon"></i>
                <h3 class="empty-title">Access Denied</h3>
                <p class="empty-desc">You must be logged in to view your shopping cart.</p>
                <a href="login.html" class="btn-primary">Go to Login</a>
            `;
        }
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/cart`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (res.ok) {
            const cartItems = await res.json();
            if (cartItems.length === 0) {
                if (cartWrapper) cartWrapper.style.display = 'none';
                if (emptyState) emptyState.style.display = 'block';
            } else {
                if (emptyState) emptyState.style.display = 'none';
                if (cartWrapper) cartWrapper.style.display = 'grid';
                renderCartPage(cartItems);
            }
        } else {
            showToast('Failed to load cart items', 'error');
        }
    } catch (err) {
        showToast('Error connecting to server', 'error');
    }
}

function renderCartPage(cartItems) {
    const container = document.getElementById('cart-items-container');
    const checkoutPanel = document.getElementById('cart-checkout-panel');
    if (!container || !checkoutPanel) return;

    let subtotal = 0;

    container.innerHTML = cartItems.map(item => {
        const itemTotal = item.product.price * item.quantity;
        subtotal += itemTotal;

        const defaultImg = (item.product.category && item.product.category.toLowerCase() === 'stationery') 
            ? '/uploads/stationery_default.png' 
            : '/uploads/book_default.png';

        return `
            <div class="cart-item-row" id="cart-item-row-${item.id}">
                <div class="cart-item-img">
                    <img src="${item.product.imageUrl || defaultImg}" alt="${item.product.name}" onerror="this.src='${defaultImg}'">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-category">${item.product.category}</div>
                    <div class="cart-item-unit-price" style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;">₹${item.product.price} each</div>
                </div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateCartQty(${item.id}, ${item.quantity - 1}, ${item.product.price})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-val" id="qty-${item.id}">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQty(${item.id}, ${item.quantity + 1}, ${item.product.price})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-price" id="total-price-${item.id}" data-unit-price="${item.product.price}" data-item-total="${itemTotal}">₹${itemTotal}</div>
                <button class="remove-item-btn" onclick="removeCartItem(${item.id})" title="Remove Item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    checkoutPanel.innerHTML = `
        <h3 style="margin-bottom: 1.5rem; font-family: 'Outfit';">Order Summary</h3>
        <div class="summary-row">
            <span style="color: var(--text-secondary);">Subtotal</span>
            <span id="summary-subtotal">₹${subtotal}</span>
        </div>
        <div class="summary-row">
            <span style="color: var(--text-secondary);">Delivery</span>
            <span style="color: var(--success-color);">FREE</span>
        </div>
        <div class="summary-row summary-total">
            <span>Grand Total</span>
            <span id="summary-grandtotal">₹${subtotal}</span>
        </div>
    `;
}

function updateSummaryTotal() {
    const priceElements = document.querySelectorAll('.cart-item-price');
    let subtotal = 0;
    priceElements.forEach(el => {
        const itemTotal = parseFloat(el.getAttribute('data-item-total') || 0);
        subtotal += itemTotal;
    });

    const subtotalEl = document.getElementById('summary-subtotal');
    const grandtotalEl = document.getElementById('summary-grandtotal');

    if (subtotalEl) subtotalEl.innerText = `₹${subtotal}`;
    if (grandtotalEl) grandtotalEl.innerText = `₹${subtotal}`;
}

async function updateCartQty(cartItemId, newQty, unitPrice) {
    if (newQty <= 0) {
        removeCartItem(cartItemId);
        return;
    }

    const qtySpan = document.getElementById(`qty-${cartItemId}`);
    const priceDiv = document.getElementById(`total-price-${cartItemId}`);
    
    const originalQty = qtySpan ? qtySpan.innerText : '';
    const originalPriceText = priceDiv ? priceDiv.innerText : '';
    const originalItemTotal = priceDiv ? priceDiv.getAttribute('data-item-total') : '';

    if (qtySpan && priceDiv) {
        qtySpan.innerText = newQty;
        const newItemTotal = unitPrice * newQty;
        priceDiv.innerText = `₹${newItemTotal}`;
        priceDiv.setAttribute('data-item-total', newItemTotal);
        
        const row = document.getElementById(`cart-item-row-${cartItemId}`);
        if (row) {
            const minusBtn = row.querySelector('.quantity-controls button:first-child');
            const plusBtn = row.querySelector('.quantity-controls button:last-child');
            if (minusBtn) minusBtn.setAttribute('onclick', `updateCartQty(${cartItemId}, ${newQty - 1}, ${unitPrice})`);
            if (plusBtn) plusBtn.setAttribute('onclick', `updateCartQty(${cartItemId}, ${newQty + 1}, ${unitPrice})`);
        }
        
        updateSummaryTotal();
    }

    try {
        const res = await fetch(`${API_BASE}/cart/update/${cartItemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                quantity: newQty
            })
        });

        if (!res.ok) {
            if (qtySpan && priceDiv) {
                qtySpan.innerText = originalQty;
                priceDiv.innerText = originalPriceText;
                priceDiv.setAttribute('data-item-total', originalItemTotal);
                updateSummaryTotal();
            }
            showToast('Failed to update quantity', 'error');
        }
    } catch (err) {
        if (qtySpan && priceDiv) {
            qtySpan.innerText = originalQty;
            priceDiv.innerText = originalPriceText;
            priceDiv.setAttribute('data-item-total', originalItemTotal);
            updateSummaryTotal();
        }
        showToast('Error updating quantity', 'error');
    }
}

async function removeCartItem(cartItemId) {
    try {
        const res = await fetch(`${API_BASE}/cart/remove/${cartItemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (res.ok) {
            showToast('Item removed from cart', 'success');
            loadCartPage();
            updateCartBadge();
        } else {
            showToast('Failed to remove item', 'error');
        }
    } catch (err) {
        showToast('Error removing item', 'error');
    }
}

async function handleCheckout() {
    try {
        const res = await fetch(`${API_BASE}/cart/clear`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (res.ok) {
            // Show Success Modal
            const modal = document.getElementById('success-modal');
            if (modal) {
                modal.classList.add('active');
            } else {
                showToast('Order placed successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
            updateCartBadge();
        } else {
            showToast('Checkout failed. Please try again.', 'error');
        }
    } catch (err) {
        showToast('Error during checkout', 'error');
    }
}

// Close Success Modal
function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.classList.remove('active');
    window.location.href = 'index.html';
}

// --- Debounce Utility for Searching ---
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

// --- Initialize Page Contents ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Navbar state update
    updateNavbar();

    // Password visibility toggle setup
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const passwordInput = e.currentTarget.parentElement.querySelector('input');
            if (passwordInput) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    e.currentTarget.classList.remove('fa-eye');
                    e.currentTarget.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    e.currentTarget.classList.remove('fa-eye-slash');
                    e.currentTarget.classList.add('fa-eye');
                }
            }
        });
    });

    // 2. Setup menu toggle for mobile
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 3. Page specific initializations
    const path = window.location.pathname;

    // Home Page Initializations
    if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
        fetchProducts('all');

        // Setup filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                const category = e.currentTarget.getAttribute('data-category');
                fetchProducts(category);
            });
        });

        // Setup search input and clear button
        const searchInput = document.getElementById('nav-search-input');
        const searchClearBtn = document.getElementById('search-clear-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                const query = e.target.value;
                
                if (query.trim()) {
                    if (searchClearBtn) searchClearBtn.style.display = 'block';
                    
                    // Smoothly scroll down to our featured products section
                    const productsSection = document.getElementById('products-section');
                    if (productsSection) {
                        productsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    if (searchClearBtn) searchClearBtn.style.display = 'none';
                }
                searchProducts(query);
            }, 300));
        }

        if (searchClearBtn && searchInput) {
            searchClearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchClearBtn.style.display = 'none';
                searchProducts('');
            });
        }
    }

    // Cart Page Initializations
    if (path.endsWith('cart.html')) {
        loadCartPage();
    }
});
