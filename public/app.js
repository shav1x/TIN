const app = document.getElementById('app');
let currentUser = JSON.parse(sessionStorage.getItem('user'));
let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
let currentPage = 1;
const itemsPerPage = 6;

let currentView = 'products';

let currentLang = 'en';

const translations = {
    en: {
        products: "Products",
        login: "Login",
        register: "Register",
        logout: "Logout",
        cart: "Cart",
        myOrders: "My Orders",
        adminOrders: "Orders",
        welcome: "Welcome",
        inStock: "In Stock",
        outStock: "Out of Stock",
        price: "Price",
        addToCart: "Add to Cart",
        qty: "Qty",
        cartTitle: "Your Shopping Cart",
        emptyCart: "Your cart is empty.",
        backStore: "Back to Store",
        remove: "Remove",
        total: "Total",
        completeOrder: "Complete Order",
        contShopping: "Continue Shopping",
        adminDash: "Admin Dashboard",
        addNew: "+ Add New Product",
        edit: "Edit",
        delete: "Delete",
        manageOrders: "Manage Customer Orders",
        myOrderHistory: "My Order History",
        noOrders: "No orders found.",
        cancelOrder: "Cancel Order",
        markCompleted: "Mark Completed",
        status: "Status",
        date: "Date",
        customer: "Customer",
        pending: "Pending",
        cancelled: "Cancelled",
        completed: "Completed",
        confirmDelete: "Are you sure you want to delete this product?",
        confirmCancel: "Are you sure you want to CANCEL this order?",
        confirmComplete: "Are you sure you want to mark this order as COMPLETED?",
        successAdd: "Product created successfully",
        successUpdate: "Product updated successfully",
        successDelete: "Product deleted successfully",
        username: "Username",
        password: "Password"
    },
    pl: {
        products: "Produkty",
        login: "Zaloguj",
        register: "Rejestracja",
        logout: "Wyloguj",
        cart: "Koszyk",
        myOrders: "Moje Zamówienia",
        adminOrders: "Zamówienia",
        welcome: "Witaj",
        inStock: "Dostępny",
        outStock: "Brak w magazynie",
        price: "Cena",
        addToCart: "Do koszyka",
        qty: "Ilość",
        cartTitle: "Twój Koszyk",
        emptyCart: "Twój koszyk jest pusty.",
        backStore: "Wróć do sklepu",
        remove: "Usuń",
        total: "Suma",
        completeOrder: "Złóż zamówienie",
        contShopping: "Kontynuuj zakupy",
        adminDash: "Panel Administratora",
        addNew: "+ Dodaj nowy produkt",
        edit: "Edytuj",
        delete: "Usuń",
        manageOrders: "Zarządzaj Zamówieniami",
        myOrderHistory: "Historia Zamówień",
        noOrders: "Brak zamówień.",
        cancelOrder: "Anuluj",
        markCompleted: "Zakończ",
        status: "Status",
        date: "Data",
        customer: "Klient",
        pending: "Oczekujące",
        cancelled: "Anulowane",
        completed: "Zakończone",
        confirmDelete: "Czy na pewno chcesz usunąć ten produkt?",
        confirmCancel: "Czy na pewno chcesz ANULOWAĆ to zamówienie?",
        confirmComplete: "Czy na pewno chcesz ZAKOŃCZYĆ to zamówienie?",
        successAdd: "Produkt dodany pomyślnie",
        successUpdate: "Produkt zaktualizowany pomyślnie",
        successDelete: "Produkt usunięty pomyślnie",
        username: "Nazwa użytkownika",
        password: "Hasło"
    },
    ua: {
        products: "Товари",
        login: "Увійти",
        register: "Реєстрація",
        logout: "Вийти",
        cart: "Кошик",
        myOrders: "Мої замовлення",
        adminOrders: "Замовлення",
        welcome: "Вітаємо",
        inStock: "В наявності",
        outStock: "Немає в наявності",
        price: "Ціна",
        addToCart: "У кошик",
        qty: "К-сть",
        cartTitle: "Ваш Кошик",
        emptyCart: "Ваш кошик порожній.",
        backStore: "До магазину",
        remove: "Видалити",
        total: "Всього",
        completeOrder: "Оформити",
        contShopping: "Продовжити",
        adminDash: "Панель Адміністратора",
        addNew: "+ Додати товар",
        edit: "Редагувати",
        delete: "Видалити",
        manageOrders: "Керування замовленнями",
        myOrderHistory: "Історія замовлень",
        noOrders: "Замовлень не знайдено.",
        cancelOrder: "Скасувати",
        markCompleted: "Завершити",
        status: "Статус",
        date: "Дата",
        customer: "Клієнт",
        pending: "Очікується",
        cancelled: "Скасовано",
        completed: "Виконано",
        confirmDelete: "Ви впевнені, що хочете видалити цей товар?",
        confirmCancel: "Ви впевнені, що хочете СКАСУВАТИ це замовлення?",
        confirmComplete: "Ви впевнені, що хочете ЗАВЕРШИТИ це замовлення?",
        successAdd: "Товар додано успішно",
        successUpdate: "Товар оновлено успішно",
        successDelete: "Товар видалено успішно",
        username: "Ім'я користувача",
        password: "Пароль"
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    updateNav();

    switch (currentView) {
        case 'cart':
            renderCart();
            break;
        case 'my_orders':
            loadMyOrders();
            break;
        case 'admin_orders':
            loadAdminOrders();
            break;
        case 'admin_products':
            loadAdminProducts();
            break;
        case 'login':
            renderLogin();
            break;
        case 'register':
            renderRegister();
            break;
        case 'products':
        default:
            loadProducts();
            break;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    handleHomeClick();
});

function handleHomeClick() {
    if (currentUser && currentUser.role === 'Admin') {
        loadAdminProducts();
    } else {
        loadProducts();
    }
}

function updateNav() {
    document.getElementById('nav-products').textContent = t('products');
    document.getElementById('nav-login').textContent = t('login');
    document.getElementById('nav-register').textContent = t('register');
    if(document.getElementById('nav-logout')) document.getElementById('nav-logout').textContent = t('logout');

    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');
    const usernameDisplay = document.getElementById('current-username');
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    if (currentUser) {
        guestNav.style.display = 'none';
        userNav.style.display = 'inline';

        let navHtml = `${currentUser.username} (${currentUser.role})`;

        if (currentUser.role === 'Admin') {
            navHtml += ` 
                | <button onclick="loadAdminOrders()">${t('adminOrders')}</button>
            `;
        } else {
            navHtml += ` 
                | <button onclick="renderCart()">${t('cart')} (${cartCount})</button>
                | <button onclick="loadMyOrders()">${t('myOrders')}</button>
            `;
        }
        usernameDisplay.innerHTML = navHtml;
    } else {
        guestNav.style.display = 'inline';
        userNav.style.display = 'none';
        usernameDisplay.textContent = '';
    }
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('user');
    cart = [];
    sessionStorage.removeItem('cart');
    updateNav();
    loadProducts();
}

function loadProducts() {
    currentView = 'products';

    fetch(`/api/products?page=${currentPage}&limit=${itemsPerPage}&t=${Date.now()}`)
        .then(res => res.json())
        .then(result => {
            const products = result.data;
            const pagination = result.pagination;

            app.innerHTML = `<h2>${t('products')}</h2>`;

            if (!products || products.length === 0) {
                app.innerHTML += '<p>No products found.</p>';
                return;
            }

            const div = document.createElement('div');
            div.className = 'product-list';

            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';

                const showQuantity = currentUser !== null;
                const stockText = p.Stock > 0
                    ? (showQuantity ? `${t('inStock')} (${p.Stock})` : t('inStock'))
                    : t('outStock');

                let actionHtml = '';
                if (currentUser && currentUser.role === 'Customer' && p.Stock > 0) {
                    actionHtml = `
                        <div class="cart-controls">
                            <input type="number" id="qty-${p.ID}" class="qty-input" value="1" min="1" max="${p.Stock}">
                            <button class="btn-add-cart" onclick='handleAddToCart(${JSON.stringify(p)})'>
                                ${t('addToCart')}
                            </button>
                        </div>
                    `;
                }

                card.innerHTML = `
                    <h3>${p.Name}</h3>
                    <p>${p.Description}</p>
                    <p><strong>${t('price')}:</strong> ${p.Price} PLN</p>
                    <p class="${p.Stock > 0 ? 'success' : 'error'}">
                        ${stockText}
                    </p>
                    ${actionHtml}
                `;
                div.appendChild(card);
            });
            app.appendChild(div);

            if (pagination && pagination.totalPages > 1) {
                renderPagination(pagination);
            }
        })
        .catch(err => console.error("Load Error:", err));
}

function loadAdminProducts() {
    currentView = 'admin_products';

    fetch(`/api/products?page=${currentPage}&limit=${itemsPerPage}&t=${Date.now()}`)
        .then(res => res.json())
        .then(result => {
            const products = result.data;
            const pagination = result.pagination;

            app.innerHTML = `<h2>${t('adminDash')}</h2>`;

            const addBtn = document.createElement('button');
            addBtn.textContent = t('addNew');
            addBtn.className = 'btn-add';
            addBtn.onclick = renderAddProduct;
            app.appendChild(addBtn);

            if (!products || products.length === 0) {
                app.innerHTML += '<p>No products found.</p>';
                return;
            }

            const div = document.createElement('div');
            div.className = 'product-list';

            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <h3>${p.Name}</h3>
                    <p>${p.Description}</p>
                    <p><strong>${t('price')}:</strong> ${p.Price} PLN</p>
                    <p><strong>Stock:</strong> ${p.Stock}</p>
                    <div class="admin-controls">
                        <button class="btn-edit" onclick="renderEditProduct(${p.ID})">${t('edit')}</button>
                        <button class="btn-delete" onclick="deleteProduct(${p.ID})">${t('delete')}</button>
                    </div>
                `;
                div.appendChild(card);
            });
            app.appendChild(div);

            if (pagination && pagination.totalPages > 1) {
                renderPagination(pagination);
            }
        })
        .catch(err => console.error("Admin Load Error:", err));
}

function addToCart(product, quantity) {
    if (quantity <= 0) return alert("Quantity must be at least 1");
    if (quantity > product.Stock) return alert("Not enough stock!");

    const existing = cart.find(item => item.id === product.ID);
    if (existing) {
        if (existing.quantity + quantity > product.Stock) {
            return alert("Cannot add more than available stock.");
        }
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.ID,
            name: product.Name,
            price: product.Price,
            quantity: quantity,
            maxStock: product.Stock
        });
    }

    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateNav();
    alert(t('addToCart') + " OK!");
}

function handleAddToCart(product) {
    const qtyInput = document.getElementById(`qty-${product.ID}`);
    const qty = parseInt(qtyInput.value);
    addToCart(product, qty);
}

function renderCart() {
    currentView = 'cart';

    app.innerHTML = `<h2>${t('cartTitle')}</h2>`;

    if (cart.length === 0) {
        app.innerHTML += `
            <p>${t('emptyCart')}</p>
            <button onclick="loadProducts()" class="btn-secondary">${t('backStore')}</button>
        `;
        return;
    }

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const li = document.createElement('li');
        li.style.padding = "15px";
        li.style.borderBottom = "1px solid #333";
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";

        li.innerHTML = `
            <div style="flex-grow: 1;">
                <strong>${item.name}</strong> 
                <br>
                <small style="color:#aaa;">${t('price')}: ${item.price} PLN</small>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="text-align: center;">
                    <label style="font-size: 0.8em; color: #aaa; display:block;">${t('qty')}</label>
                    <input type="number" class="qty-input-cart" 
                           value="${item.quantity}" min="1" max="${item.maxStock}"
                           onchange="updateCartQuantity(${index}, this.value)">
                </div>
                <div style="text-align: right; min-width: 100px;">
                    <span style="display:block; margin-bottom:5px; font-weight:bold;">${itemTotal.toFixed(2)} PLN</span>
                    <button onclick="removeFromCart(${index})" class="btn-remove">${t('remove')}</button>
                </div>
            </div>
        `;
        ul.appendChild(li);
    });

    app.appendChild(ul);

    const checkoutDiv = document.createElement('div');
    checkoutDiv.style.marginTop = "20px";
    checkoutDiv.innerHTML = `
        <h3 style="text-align:right; border-top: 2px solid #d32f2f; padding-top:10px;">
            ${t('total')}: ${total.toFixed(2)} PLN
        </h3>
        <button onclick="checkout()" class="btn-checkout">${t('completeOrder')}</button>
        <button onclick="loadProducts()" class="btn-secondary" style="width:100%;">${t('contShopping')}</button>
    `;
    app.appendChild(checkoutDiv);
}

function updateCartQuantity(index, newQty) {
    const qty = parseInt(newQty);
    const item = cart[index];
    if (isNaN(qty) || qty < 1) {
        alert("Quantity must be at least 1");
        renderCart();
        return;
    }
    if (qty > item.maxStock) {
        alert(`Sorry, only ${item.maxStock} items available.`);
        cart[index].quantity = item.maxStock;
    } else {
        cart[index].quantity = qty;
    }
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateNav();
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateNav();
}

function checkout() {
    if (!currentUser) return alert("Please login first.");

    const orderData = {
        userId: currentUser.id,
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
    };

    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
        .then(res => res.json())
        .then(result => {
            if (result.message === "Order placed successfully!") {
                alert("Order placed!");
                cart = [];
                sessionStorage.removeItem('cart');
                updateNav();
                loadMyOrders();
            } else {
                alert("Order Failed: " + result.error);
            }
        })
        .catch(err => alert("Error: " + err));
}

function loadMyOrders() {
    currentView = 'my_orders';

    if (!currentUser) return;
    fetch('/api/my-orders', { headers: { 'x-user-id': currentUser.id } })
        .then(res => res.json())
        .then(result => {
            app.innerHTML = `<h2>${t('myOrderHistory')}</h2>`;
            const orders = result.data;

            if (!orders || orders.length === 0) {
                app.innerHTML += `<p>${t('noOrders')}</p>`;
                return;
            }

            orders.forEach(order => {
                const div = document.createElement('div');
                div.className = 'product-card';
                div.style.marginBottom = "20px";

                let statusKey = order.status.toLowerCase();
                let statusColor = 'orange';
                if (order.status === 'completed') statusColor = 'green';
                if (order.status === 'cancelled') statusColor = 'red';
                div.style.borderLeft = `5px solid ${statusColor}`;

                let itemsHtml = order.items.map(i => `<li>${i.name} (x${i.quantity})</li>`).join('');

                let actionHtml = '';
                if (order.status === 'pending') {
                    actionHtml = `
                    <div style="margin-top:15px; border-top:1px dashed #444; padding-top:10px; text-align:right;">
                        <button onclick="cancelOrder(${order.id}, true)" class="btn-remove" style="float:none;">
                            ${t('cancelOrder')}
                        </button>
                    </div>
                `;
                }

                div.innerHTML = `
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #555; padding-bottom:5px; margin-bottom:10px;">
                    <strong>Order #${order.id}</strong>
                    <span>${new Date(order.date).toLocaleString()}</span>
                </div>
                <ul style="padding-left: 20px; color: #ccc;">${itemsHtml}</ul>
                <div style="text-align:right;">
                    <div style="font-weight:bold; color:#69f0ae;">${t('total')}: ${order.total.toFixed(2)} PLN</div>
                    <div style="margin-top:5px; color:#aaa;">${t('status')}: <strong style="color:${statusColor}; text-transform:uppercase;">${t(statusKey) || order.status}</strong></div>
                </div>
                ${actionHtml}
            `;
                app.appendChild(div);
            });
        });
}

function loadAdminOrders() {
    currentView = 'admin_orders';

    fetch('/api/admin/orders')
        .then(res => res.json())
        .then(result => {
            app.innerHTML = `<h2>${t('manageOrders')}</h2>`;
            const orders = result.data;

            if (!orders || orders.length === 0) {
                app.innerHTML += `<p>${t('noOrders')}</p>`;
                return;
            }

            orders.forEach(order => {
                const div = document.createElement('div');
                div.className = 'product-card';
                div.style.marginBottom = "20px";

                let statusKey = order.status.toLowerCase();
                let borderColor = 'orange';
                if (order.status === 'completed') borderColor = '#2e7d32';
                if (order.status === 'cancelled') borderColor = '#c62828';
                div.style.borderLeft = `5px solid ${borderColor}`;

                let itemsHtml = order.items.map(i => `<li>${i.name} (x${i.quantity})</li>`).join('');

                let actionButtons = '';
                if (order.status === 'pending') {
                    actionButtons = `
                    <button onclick="completeOrder(${order.id})" class="btn-checkout" style="width:auto; padding:8px 15px; font-size:0.9em; margin-right:10px;">
                        ${t('markCompleted')}
                    </button>
                    <button onclick="cancelOrder(${order.id})" class="btn-remove" style="float:none;">
                        ${t('cancelOrder')}
                    </button>
                `;
                } else {
                    actionButtons = `<span style="font-style:italic; color:#888;">${t(statusKey) || order.status}</span>`;
                }

                div.innerHTML = `
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #555; padding-bottom:5px; margin-bottom:10px;">
                    <strong>Order #${order.id}</strong>
                    <span style="color:#aaa;">${t('customer')}: <strong style="color:white">${order.customer}</strong></span>
                </div>
                <div style="display:flex; justify-content: space-between;">
                    <ul style="padding-left: 20px; color: #ccc; margin:0;">${itemsHtml}</ul>
                    <div style="text-align:right;">
                        <div style="font-weight:bold; color:#69f0ae;">${order.total.toFixed(2)} PLN</div>
                        <div style="margin-top:5px;">${t('status')}: <strong style="text-transform:uppercase; color:${borderColor}">${t(statusKey) || order.status}</strong></div>
                        <div style="margin-top:5px; font-size:0.85em; color:#aaa;">${new Date(order.date).toLocaleString()}</div>
                    </div>
                </div>
                <div style="margin-top: 15px; border-top: 1px dashed #444; padding-top: 10px; text-align: right;">
                    ${actionButtons}
                </div>
            `;
                app.appendChild(div);
            });
        })
        .catch(err => console.error(err));
}

function deleteProduct(id) {
    if (!confirm(t('confirmDelete'))) return;
    fetch(`/api/products/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(result => {
            if (result.message === "Product deleted successfully") {
                alert(t('successDelete'));
                loadAdminProducts();
            } else alert("Error: " + JSON.stringify(result));
        });
}

function cancelOrder(orderId, isCustomer = false) {
    if(!confirm(t('confirmCancel'))) return;
    const headers = {};
    if (isCustomer && currentUser) headers['x-user-id'] = currentUser.id;

    fetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH', headers: headers })
        .then(res => res.json())
        .then(result => {
            if(result.message) {
                alert(result.message);
                isCustomer ? loadMyOrders() : loadAdminOrders();
            } else alert("Error: " + result.error);
        });
}

function completeOrder(orderId) {
    if(!confirm(t('confirmComplete'))) return;
    fetch(`/api/orders/${orderId}/complete`, { method: 'PATCH' })
        .then(res => res.json())
        .then(result => {
            if(result.message) {
                alert(result.message);
                loadAdminOrders();
            } else alert("Error: " + result.error);
        });
}

function renderAddProduct() {
    app.innerHTML = `
        <h2>${t('addNew')}</h2>
        <form onsubmit="handleAddProduct(event)">
            <label>Name: <input type="text" name="name" required></label>
            <label>Description: <textarea name="description"></textarea></label>
            <label>Price: <input type="number" step="0.01" name="price" required></label>
            <label>Stock: <input type="number" name="stock" required></label>
            <button type="submit">Create</button>
            <button type="button" onclick="loadAdminProducts()" style="background:#555">Cancel</button>
        </form>
    `;
}

function handleAddProduct(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(result => {
            if (result.message && result.message.includes("success")) {
                alert(t('successAdd'));
                loadAdminProducts();
            } else alert("Error: " + result.error);
        });
}

function renderEditProduct(id) {
    fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(result => {
            const p = result.data;
            app.innerHTML = `
                <h2>${t('edit')}</h2>
                <form onsubmit="handleEditProduct(event, ${p.ID})">
                    <label>Name: <input type="text" name="name" value="${p.Name}" required></label>
                    <label>Description: <textarea name="description">${p.Description}</textarea></label>
                    <label>Price: <input type="number" step="0.01" name="price" value="${p.Price}" required></label>
                    <label>Stock: <input type="number" name="stock" value="${p.Stock}" required></label>
                    <button type="submit" class="btn-edit">Save Changes</button>
                    <button type="button" onclick="loadAdminProducts()" style="background:#555">Cancel</button>
                </form>
            `;
        });
}

function handleEditProduct(event, id) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(result => {
            if (result.message === "Product updated successfully") {
                alert(t('successUpdate'));
                loadAdminProducts();
            } else alert("Error: " + result.error);
        });
}

function renderPagination(pagination) {
    const navDiv = document.createElement('div');
    navDiv.className = 'pagination-controls';

    const prevDisabled = pagination.currentPage === 1 ? 'disabled' : '';
    const prevBtn = `<button onclick="changePage(${pagination.currentPage - 1})" ${prevDisabled}>&laquo; Previous</button>`;

    const nextDisabled = pagination.currentPage === pagination.totalPages ? 'disabled' : '';
    const nextBtn = `<button onclick="changePage(${pagination.currentPage + 1})" ${nextDisabled}>Next &raquo;</button>`;

    const info = `<span class="page-info">Page ${pagination.currentPage} of ${pagination.totalPages}</span>`;

    navDiv.innerHTML = prevBtn + info + nextBtn;
    app.appendChild(navDiv);
}

function changePage(newPage) {
    if (newPage < 1) return;
    currentPage = newPage;
    if (currentView === 'admin_products') loadAdminProducts();
    else loadProducts();
    window.scrollTo(0, 0);
}

function renderLogin() {
    currentView = 'login';
    app.innerHTML = `
        <h2>${t('login')}</h2>
        <form onsubmit="handleLogin(event)">
            <label>${t('username')}: <input type="text" name="username" required></label>
            <label>${t('password')}: <input type="password" name="password" required></label>
            <button type="submit">${t('login')}</button>
        </form>
    `;
}

function renderRegister() {
    currentView = 'register';
    app.innerHTML = `
        <h2>${t('register')}</h2>
        <form onsubmit="handleRegister(event)">
            <label>${t('username')}: <input type="text" name="username" required></label>
            <label>${t('password')}: <input type="password" name="password" required></label>
            <button type="submit">${t('register')}</button>
        </form>
    `;
}

function handleLogin(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(result => {
            if (result.user) {
                currentUser = result.user;
                sessionStorage.setItem('user', JSON.stringify(currentUser));
                updateNav();
                handleHomeClick();
            } else alert(result.error || "Login failed");
        });
}

function handleRegister(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(result => {
            alert(result.message || "Error");
            if(result.message === "User registered successfully!") renderLogin();
        });
}