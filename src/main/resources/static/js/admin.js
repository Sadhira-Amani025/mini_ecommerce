/**
 * Mini E-Commerce - Admin Management Script
 */

// API_BASE is already declared globally in app.js

// --- Protection Check ---
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        alert('Access Denied. Please login first.');
        window.location.href = 'login.html';
        return false;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'ROLE_ADMIN') {
        alert('Access Denied. You do not have administrator privileges.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Global variable to track editing
let editProductId = null;

// --- Load Registered Users ---
async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/admin/users?t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (res.ok) {
            const users = await res.json();
            tbody.innerHTML = users.map((user, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>
                        <span class="user-role-badge" style="background: ${user.role === 'ROLE_ADMIN' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)'}; color: ${user.role === 'ROLE_ADMIN' ? 'var(--secondary-color)' : 'var(--primary-color)'}; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">
                            ${user.role.replace('ROLE_', '')}
                        </span>
                    </td>
                </tr>
            `).join('');
        } else {
            showToast('Failed to load users list', 'error');
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--danger-color);"><i class="fas fa-exclamation-triangle"></i> Error loading users.</td></tr>';
    }
}

// --- Load Products for Admin Table ---
async function loadProductsAdmin() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading products...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/products?t=${Date.now()}`);
        if (res.ok) {
            const products = await res.json();
            tbody.innerHTML = products.map((product, index) => {
                const defaultImg = (product.category && product.category.toLowerCase() === 'stationery') 
                    ? '/uploads/stationery_default.png' 
                    : '/uploads/book_default.png';
                return `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <img src="${product.imageUrl || defaultImg}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='${defaultImg}'">
                    </td>
                    <td><strong>${product.name}</strong></td>
                    <td>${product.category}</td>
                    <td>₹${product.price}</td>
                    <td>
                        <button class="admin-action-btn edit" onclick="openEditModal(${JSON.stringify(product).replace(/"/g, '&quot;')})" title="Edit Product">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-action-btn delete" onclick="deleteProduct(${product.id})" title="Delete Product">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            }).join('');
        } else {
            showToast('Failed to load products list', 'error');
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger-color);"><i class="fas fa-exclamation-triangle"></i> Error loading products.</td></tr>';
    }
}

// --- Open Add Modal ---
function openAddModal() {
    editProductId = null;
    document.getElementById('modal-title').innerText = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-modal').classList.add('active');
}

// --- Open Edit Modal ---
function openEditModal(product) {
    editProductId = product.id;
    document.getElementById('modal-title').innerText = 'Edit Product';
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-category').value = product.category;
    document.getElementById('prod-price').value = product.price;
    document.getElementById('product-modal').classList.add('active');
}

// --- Close Modal ---
function closeModal() {
    document.getElementById('product-modal').classList.remove('active');
}

// --- Save Product (Add / Edit) ---
async function saveProduct(e) {
    e.preventDefault();

    const name = document.getElementById('prod-name').value;
    const category = document.getElementById('prod-category').value;
    const price = document.getElementById('prod-price').value;
    const imageFile = document.getElementById('prod-image').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    if (imageFile) {
        formData.append('imageFile', imageFile);
    }

    const url = editProductId ? `${API_BASE}/admin/products/${editProductId}` : `${API_BASE}/admin/products`;
    const method = editProductId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (res.ok) {
            showToast(editProductId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
            closeModal();
            loadProductsAdmin();
        } else {
            const data = await res.json();
            showToast(data.message || 'Operation failed', 'error');
        }
    } catch (err) {
        showToast('Error connecting to database', 'error');
    }
}

// --- Delete Product ---
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (res.ok) {
            showToast('Product deleted successfully!', 'success');
            loadProductsAdmin();
        } else {
            const data = await res.json();
            showToast(data.message || 'Failed to delete product', 'error');
        }
    } catch (err) {
        showToast('Error deleting product', 'error');
    }
}

// --- Initialize Dashboard ---
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;

    // Load initial views
    loadProductsAdmin();
    loadUsers();

    // Tab Switching
    const productTabBtn = document.getElementById('tab-products');
    const userTabBtn = document.getElementById('tab-users');
    const productsView = document.getElementById('products-view');
    const usersView = document.getElementById('users-view');

    if (productTabBtn && userTabBtn && productsView && usersView) {
        productTabBtn.addEventListener('click', () => {
            productTabBtn.classList.add('active');
            userTabBtn.classList.remove('active');
            productsView.style.display = 'block';
            usersView.style.display = 'none';
        });

        userTabBtn.addEventListener('click', () => {
            userTabBtn.classList.add('active');
            productTabBtn.classList.remove('active');
            productsView.style.display = 'none';
            usersView.style.display = 'block';
        });
    }

    // Modal Events
    const openAddBtn = document.getElementById('open-add-modal-btn');
    if (openAddBtn) {
        openAddBtn.addEventListener('click', openAddModal);
    }

    const closeBtn = document.querySelector('.modal-close');
    const overlay = document.querySelector('.modal-overlay');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Form Submit
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', saveProduct);
    }
});
