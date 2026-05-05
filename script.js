// Product Data
const products = [
    {
        id: 1,
        name: "Topi Baseball Klasik - Hitam / Classic Black Baseball Cap",
        price: 75000,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400",
        category: "Baseball"
    },
    {
        id: 2,
        name: "Snapback Streetwear Premium / Premium Snapback",
        price: 125000,
        image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=400",
        category: "Snapback"
    },
    {
        id: 3,
        name: "Beanie Rajut Musim Dingin / Winter Knit Beanie",
        price: 55000,
        image: "https://images.unsplash.com/photo-1576871337622-98d48d890e49?auto=format&fit=crop&q=80&w=400",
        category: "Beanie"
    },
    {
        id: 4,
        name: "Topi Bucket Canvas / Canvas Bucket Hat",
        price: 89000,
        image: "https://images.unsplash.com/photo-1589831377283-33cb1cc6bd5d?auto=format&fit=crop&q=80&w=400",
        category: "Bucket"
    },
    {
        id: 5,
        name: "Fedora Elegant Wool / Elegant Wool Fedora",
        price: 250000,
        image: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&q=80&w=400",
        category: "Fedora"
    },
    {
        id: 6,
        name: "Topi Trucker Mesh / Mesh Trucker Hat",
        price: 45000,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400",
        category: "Trucker"
    },
    {
        id: 7,
        name: "Topi Koboi Kulit / Leather Cowboy Hat",
        price: 350000,
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400",
        category: "Cowboy"
    },
    {
        id: 8,
        name: "Topi Golf Sport / Sport Golf Visor",
        price: 65000,
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80&w=400",
        category: "Golf"
    }
];

// State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let currentPromo = null;

// DOM Elements
const mainContent = document.getElementById('main-content');
const cartCount = document.getElementById('cart-count');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    showSection('home');
});

// Routing Logic
function showSection(section) {
    window.scrollTo(0, 0);
    switch (section) {
        case 'home':
            renderHome();
            break;
        case 'cart':
            renderCart();
            break;
        case 'checkout':
            renderCheckout();
            break;
        case 'history':
            renderHistory();
            break;
    }
}

// Search Logic
function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
    renderHome(filteredProducts);
}

// Render Functions
function renderHome(productList = products) {
    let html = `
        <div class="hero" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&q=80&w=1300') no-repeat center/cover; height: 350px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 30px; border-radius: 8px;">
            <h1 style="color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); font-size: 3rem; text-align: center;">Koleksi Topi Terbaik / Best Hat Collection</h1>
            <p style="color: white; font-size: 1.2rem; margin-top: 10px;">Gaya Maksimal, Harga Minimal / Maximum Style, Minimum Price</p>
        </div>
        <div class="product-grid">
            ${productList.length > 0 ? productList.map(product => `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}">
                    <div style="flex-grow: 1; display: flex; flex-direction: column;">
                        <h3>${product.name}</h3>
                        <p class="price">${formatRupiah(product.price)}</p>
                        <button class="btn-add-to-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Tambah / Add to Cart
                        </button>
                    </div>
                </div>
            `).join('') : '<div style="grid-column: 1/-1; text-align: center; padding: 50px; background: white; border-radius: 8px;"><h3>Produk tidak ditemukan / Product not found.</h3></div>'}
        </div>
    `;
    mainContent.innerHTML = html;
}

function renderCart() {
    if (cart.length === 0) {
        mainContent.innerHTML = `
            <div class="container-box" style="text-align: center; padding: 80px 20px;">
                <i class="fas fa-shopping-basket" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                <h2>Keranjang Belanja Anda Kosong / Your Cart is Empty</h2>
                <button class="btn-primary" style="width: auto; margin-top: 30px; padding: 12px 40px;" onclick="showSection('home')">Mulai Belanja / Shop Now</button>
            </div>
        `;
        return;
    }

    let subtotal = calculateTotal();

    let html = `
        <div class="container-box">
            <h2 style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Keranjang Belanja / Shopping Cart</h2>
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h3>${item.name}</h3>
                            <p class="text-bold" style="color: #B12704;">${formatRupiah(item.price)}</p>
                        </div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span style="min-width: 20px; text-align: center; font-weight: bold;">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                            <button class="btn-remove" onclick="removeFromCart(${item.id})">Hapus / Remove</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <h2 style="margin-bottom: 10px;">Subtotal (${cart.reduce((s, i) => s + i.quantity, 0)} item): <span style="color: #B12704;">${formatRupiah(subtotal)}</span></h2>
                <button class="btn-primary" style="width: auto; padding: 12px 60px;" onclick="showSection('checkout')">Lanjut ke Pembayaran / Proceed to Checkout</button>
            </div>
        </div>
    `;
    mainContent.innerHTML = html;
}

function renderCheckout() {
    if (cart.length === 0) {
        showSection('cart');
        return;
    }

    let subtotal = calculateTotal();
    let discount = 0;
    let promoLabel = "";

    if (currentPromo) {
        discount = subtotal * currentPromo.value;
        promoLabel = `Potongan Promo / Promo Discount (${currentPromo.code.toUpperCase()}): -${formatRupiah(discount)}`;
    }

    let total = subtotal - discount;

    let html = `
        <div class="container-box">
            <h2 style="margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Checkout</h2>
            <div class="checkout-grid">
                <div class="checkout-form">
                    <h3 style="margin-bottom: 15px;"><i class="fas fa-truck"></i> Detail Pengiriman / Shipping Details</h3>
                    <div class="form-group">
                        <label>Nama Lengkap / Full Name</label>
                        <input type="text" id="cust-name" placeholder="John Doe">
                    </div>
                    <div class="form-group">
                        <label>Alamat Lengkap / Full Address</label>
                        <input type="text" id="cust-address" placeholder="Jl. Raya No. 123, Jakarta">
                    </div>
                    <div class="form-group">
                        <label>Nomor Telepon / Phone Number</label>
                        <input type="text" id="cust-phone" placeholder="08123456789">
                    </div>

                    <div class="payment-options">
                        <h3 style="margin-bottom: 15px;"><i class="fas fa-wallet"></i> Metode Pembayaran / Payment Method</h3>
                        <label>
                            <input type="radio" name="payment" value="COD" checked>
                            <strong>COD</strong> (Bayar di Tempat / Cash on Delivery)
                        </label>
                        <label>
                            <input type="radio" name="payment" value="ShopeePay">
                            <strong>ShopeePay</strong>
                        </label>
                        <label>
                            <input type="radio" name="payment" value="SeaBank">
                            <strong>SeaBank</strong>
                        </label>
                    </div>
                </div>

                <div class="checkout-summary" style="background: #fdfdfd; padding: 25px; border: 1px solid #eee; border-radius: 8px;">
                    <h3 style="margin-bottom: 20px;">Ringkasan Pesanan / Order Summary</h3>
                    <div style="margin: 15px 0; max-height: 200px; overflow-y: auto;">
                        ${cart.map(item => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                                <span>${item.name} (x${item.quantity})</span>
                                <span>${formatRupiah(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #eee;">
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>Subtotal:</span>
                            <span>${formatRupiah(subtotal)}</span>
                        </div>
                        ${currentPromo ? `
                            <div style="display: flex; justify-content: space-between; color: green; font-weight: bold; font-size: 14px;">
                                <span>Promo (${currentPromo.code.toUpperCase()}):</span>
                                <span>-${formatRupiah(discount)}</span>
                            </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 1.2rem; font-weight: bold; color: #B12704;">
                            <span>Total:</span>
                            <span>${formatRupiah(total)}</span>
                        </div>
                    </div>

                    <div class="promo-section">
                        <input type="text" id="promo-code" placeholder="Kode Promo / Promo Code" value="${currentPromo ? currentPromo.code : ''}">
                        <button class="quantity-btn" onclick="applyPromo()" style="width: auto; padding: 0 15px;">Gunakan / Apply</button>
                    </div>

                    <button class="btn-primary" style="margin-top: 30px;" onclick="processOrder()">Buat Pesanan / Place Order</button>
                </div>
            </div>
        </div>
    `;
    mainContent.innerHTML = html;
}

function renderHistory() {
    if (orders.length === 0) {
        mainContent.innerHTML = `
            <div class="container-box" style="text-align: center; padding: 80px 20px;">
                <i class="fas fa-history" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                <h2>Belum ada riwayat pesanan / No order history yet</h2>
                <button class="btn-primary" style="width: auto; margin-top: 30px; padding: 12px 40px;" onclick="showSection('home')">Mulai Belanja / Shop Now</button>
            </div>
        `;
        return;
    }

    let html = `
        <div class="container-box">
            <h2 style="margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Riwayat Pesanan / Order History</h2>
            <div style="display: flex; flex-direction: column; gap: 20px;">
                ${orders.slice().reverse().map(order => `
                    <div style="border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <span style="background: #e7e9ec; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 10px;">#ORD-${order.id}</span>
                                <span style="color: #666; font-size: 14px;">${order.date}</span>
                            </div>
                            <span style="color: white; background: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">Pesanan Berhasil / Order Success</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <p style="font-size: 14px;"><strong>Pembayaran / Payment:</strong> ${order.paymentMethod}</p>
                            <p style="font-size: 14px;"><strong>Dikirim ke / Ship to:</strong> ${order.customer.name} - ${order.customer.address}</p>
                        </div>
                        <div style="border-top: 1px dashed #eee; padding-top: 15px;">
                            ${order.items.map(item => `
                                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px;">
                                    <span>${item.name} (x${item.quantity})</span>
                                    <span>${formatRupiah(item.price * item.quantity)}</span>
                                </div>
                            `).join('')}
                            <div style="display: flex; justify-content: flex-end; margin-top: 10px; font-weight: bold; border-top: 1px solid #eee; padding-top: 10px;">
                                <span>Total: ${formatRupiah(order.total)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    mainContent.innerHTML = html;
}

// Helper Functions
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = total;
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Cart Actions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();

    // Toast notification simulation
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Ditambahkan / Added';
    btn.style.backgroundColor = '#2e7d32';
    btn.style.color = 'white';

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
    }, 1500);
}

function updateQuantity(productId, change) {
    const item = cart.find(p => p.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
            updateCartCount();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartCount();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Promo Logic
function applyPromo() {
    const code = document.getElementById('promo-code').value.toLowerCase().trim();
    const promos = {
        'subur': 1.0,
        'eman': 0.5,
        'dudi': 0.25
    };

    if (promos[code] !== undefined) {
        currentPromo = { code: code, value: promos[code] };
        alert(`Kode Promo "${code.toUpperCase()}" Berhasil Digunakan! Potongan ${(promos[code]*100)}%`);
        renderCheckout();
    } else if (code === "") {
        currentPromo = null;
        renderCheckout();
    } else {
        alert("Kode promo tidak valid / Invalid promo code");
    }
}

// Checkout Logic
function processOrder() {
    const name = document.getElementById('cust-name').value;
    const address = document.getElementById('cust-address').value;
    const phone = document.getElementById('cust-phone').value;
    const payment = document.querySelector('input[name="payment"]:checked')?.value || "COD";

    if (!name || !address || !phone) {
        alert("Harap lengkapi semua data pengiriman / Please fill in all shipping details");
        return;
    }

    let subtotal = calculateTotal();
    let discount = currentPromo ? (subtotal * currentPromo.value) : 0;
    let total = subtotal - discount;

    const newOrder = {
        id: Math.floor(Math.random() * 900000) + 100000,
        date: new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }),
        items: [...cart],
        subtotal: subtotal,
        discount: discount,
        total: total,
        paymentMethod: payment,
        customer: { name, address, phone }
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Reset cart
    cart = [];
    saveCart();
    updateCartCount();
    currentPromo = null;

    alert("Pesanan Anda berhasil dibuat! / Order Placed Successfully!\n\nID: #ORD-" + newOrder.id);
    showSection('history');
}
