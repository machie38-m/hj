// Product Data
const products = [
    {
        id: 1,
        name: "Topi Baseball Klasik - Hitam",
        nameEn: "Classic Black Baseball Cap",
        price: 75000,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400",
        category: "Baseball"
    },
    {
        id: 2,
        name: "Topi Baseball Klasik - Putih",
        nameEn: "Classic White Baseball Cap",
        price: 75000,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400",
        category: "Baseball"
    },
    {
        id: 3,
        name: "Bucket Hat - Kuning Pastel",
        nameEn: "Pastel Yellow Bucket Hat",
        price: 85000,
        image: "https://images.unsplash.com/photo-1576871333021-d14620076a91?auto=format&fit=crop&q=80&w=400",
        category: "Bucket"
    },
    {
        id: 4,
        name: "Bucket Hat - Biru Muda",
        nameEn: "Light Blue Bucket Hat",
        price: 85000,
        image: "https://images.unsplash.com/photo-1620641151399-ca6a40a2323e?auto=format&fit=crop&q=80&w=400",
        category: "Bucket"
    },
    {
        id: 5,
        name: "Fedora Elegance - Coklat",
        nameEn: "Elegant Brown Fedora",
        price: 150000,
        image: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&q=80&w=400",
        category: "Fedora"
    },
    {
        id: 6,
        name: "Beanie Rajut - Abu-abu",
        nameEn: "Grey Knitted Beanie",
        price: 65000,
        image: "https://images.unsplash.com/photo-1576871333019-220ef346dd8b?auto=format&fit=crop&q=80&w=400",
        category: "Beanie"
    },
    {
        id: 7,
        name: "Snapback Modern - Merah",
        nameEn: "Modern Red Snapback",
        price: 95000,
        image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=400",
        category: "Snapback"
    },
    {
        id: 8,
        name: "Sun Hat Pantai - Jerami",
        nameEn: "Straw Beach Sun Hat",
        price: 125000,
        image: "https://images.unsplash.com/photo-1565264317065-252ad7382e44?auto=format&fit=crop&q=80&w=400",
        category: "Sun Hat"
    },
    {
        id: 9,
        name: "Topi Beret - Pink Pastel",
        nameEn: "Pastel Pink Beret",
        price: 110000,
        image: "https://images.unsplash.com/photo-1523455246772-5205565576a0?auto=format&fit=crop&q=80&w=400",
        category: "Beret"
    },
    {
        id: 10,
        name: "Trucker Hat - Navy/Putih",
        nameEn: "Navy/White Trucker Hat",
        price: 80000,
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=400",
        category: "Trucker"
    },
    {
        id: 11,
        name: "Visor Sport - Oranye",
        nameEn: "Orange Sport Visor",
        price: 70000,
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=400", // Generic placeholder
        category: "Sport"
    },
    {
        id: 12,
        name: "Boonie Hat - Hijau Army",
        nameEn: "Army Green Boonie Hat",
        price: 135000,
        image: "https://images.unsplash.com/photo-1572427735444-44470d6f332d?auto=format&fit=crop&q=80&w=400",
        category: "Outdoor"
    }
];

// State Management
let cart = JSON.parse(localStorage.getItem('zshop_cart')) || [];
let activePromo = null;

// Promo Codes
const promos = {
    'subur': 1.0,  // 100%
    'eman': 0.5,   // 50%
    'dudi': 0.25   // 25%
};

// Formatting Currency
function formatRupiah(amount) {
    return "Rp " + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Navigation
function showSection(sectionId) {
    const main = document.getElementById('main-content');
    window.scrollTo(0, 0);

    if (sectionId === 'home') {
        renderHome();
    } else if (sectionId === 'cart') {
        renderCart();
    } else if (sectionId === 'checkout') {
        renderCheckout();
    }
}

// Core Functions
function addToCart(productId, buyNow = false) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();

    if (buyNow) {
        // Filter cart to only include THIS item for a true "Buy Now" feel,
        // OR just proceed to checkout with current cart.
        // User said "beli sekarang" - typically this means just this item.
        cart = [{ ...product, quantity: 1 }];
        saveCart();
        updateCartCount();
        showSection('checkout');
    } else {
        alert(`${product.name} telah ditambahkan ke keranjang!`);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartCount();
            renderCart();
        }
    }
}

function saveCart() {
    localStorage.setItem('zshop_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = count;
}

function applyPromo() {
    const code = document.getElementById('promo-input').value.toLowerCase().trim();

    // Capture existing form data to prevent loss on re-render
    const formData = {
        name: document.getElementById('name')?.value || '',
        address: document.getElementById('address')?.value || '',
        phone: document.getElementById('phone')?.value || ''
    };

    if (promos[code]) {
        activePromo = { code, discount: promos[code] };
        alert(`Promo ${code.toUpperCase()} berhasil digunakan!`);
    } else {
        alert('Kode promo tidak valid.');
        activePromo = null;
    }
    renderCheckout(formData);
}

// Render Logic
function renderHome(filteredProducts = products) {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <section class="hero">
            <h1>Z Shop</h1>
            <p>Koleksi Topi Paling Keren & Trendi</p>
        </section>
        <section class="products-container">
            <div class="product-grid">
                ${filteredProducts.map(p => `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${p.image}" alt="${p.name}">
                        </div>
                        <div class="product-info">
                            <h3>${p.name}</h3>
                            <p class="product-price">${formatRupiah(p.price)}</p>
                            <div class="product-actions">
                                <button class="btn-secondary" onclick="addToCart(${p.id})">
                                    <i class="fas fa-cart-plus"></i> + Keranjang
                                </button>
                                <button class="btn-primary" onclick="addToCart(${p.id}, true)">
                                    Beli Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function renderCart() {
    const main = document.getElementById('main-content');
    if (cart.length === 0) {
        main.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-basket fa-4x"></i>
                <h2>Keranjang Belanja Anda Kosong</h2>
                <button class="btn-primary" onclick="showSection('home')">Mulai Belanja</button>
            </div>
        `;
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    main.innerHTML = `
        <div class="cart-page">
            <h2>Keranjang Belanja</h2>
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h3>${item.name}</h3>
                            <p>${formatRupiah(item.price)}</p>
                        </div>
                        <div class="item-qty">
                            <button onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <div class="item-remove">
                            <button onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal (${cart.length} item)</span>
                    <span>${formatRupiah(subtotal)}</span>
                </div>
                <button class="btn-primary full-width" onclick="showSection('checkout')">Lanjut ke Pembayaran</button>
            </div>
        </div>
    `;
}

function renderCheckout(formData = {name: '', address: '', phone: ''}) {
    const main = document.getElementById('main-content');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = activePromo ? Math.floor(subtotal * activePromo.discount) : 0;
    const total = subtotal - discountAmount;

    main.innerHTML = `
        <div class="checkout-page">
            <div class="checkout-form">
                <h2>Detail Pengiriman</h2>
                <div class="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" id="name" placeholder="Masukkan nama lengkap" value="${formData.name}">
                </div>
                <div class="form-group">
                    <label>Alamat Lengkap</label>
                    <textarea id="address" rows="3" placeholder="Masukkan alamat lengkap pengiriman">${formData.address}</textarea>
                </div>
                <div class="form-group">
                    <label>Nomor WhatsApp</label>
                    <input type="tel" id="phone" placeholder="Contoh: 08123456789" value="${formData.phone}">
                </div>
            </div>
            <div class="order-summary">
                <h2>Ringkasan Pesanan</h2>
                <div class="summary-items">
                    ${cart.map(item => `
                        <div class="summary-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>${formatRupiah(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                <hr>
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${formatRupiah(subtotal)}</span>
                </div>
                ${activePromo ? `
                    <div class="summary-row promo-text">
                        <span>Promo (${activePromo.code.toUpperCase()})</span>
                        <span>-${formatRupiah(discountAmount)}</span>
                    </div>
                ` : ''}
                <div class="summary-row total">
                    <span>Total</span>
                    <span>${formatRupiah(total)}</span>
                </div>

                <div class="promo-section">
                    <input type="text" id="promo-input" placeholder="Kode Promo" value="${activePromo ? activePromo.code : ''}">
                    <button onclick="applyPromo()">Gunakan</button>
                </div>

                <div class="checkout-actions">
                    <button class="btn-wa" onclick="processOrder('wa')">
                        <i class="fab fa-whatsapp"></i> Bayar via WhatsApp
                    </button>
                    <button class="btn-email" onclick="processOrder('email')">
                        <i class="fas fa-envelope"></i> Bayar via Email
                    </button>
                </div>
            </div>
        </div>
    `;
}

function processOrder(method) {
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    if (!name || !address || !phone) {
        alert('Mohon lengkapi semua data pengiriman!');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = activePromo ? Math.floor(subtotal * activePromo.discount) : 0;
    const total = subtotal - discountAmount;

    let itemsText = cart.map(item => `- ${item.name} (x${item.quantity}): ${formatRupiah(item.price * item.quantity)}`).join('\n');

    const message = `Halo Z Shop, saya ingin memesan:

${itemsText}

Subtotal: ${formatRupiah(subtotal)}
${activePromo ? `Promo: -${formatRupiah(discountAmount)} (${activePromo.code})` : ''}
Total: ${formatRupiah(total)}

Detail Pengiriman:
Nama: ${name}
Alamat: ${address}
No. HP: ${phone}

Terima kasih!`;

    if (method === 'wa') {
        const waUrl = `https://wa.me/6288973262022?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    } else {
        const mailUrl = `mailto:machie8910@gmail.com?subject=Pesanan Z Shop - ${name}&body=${encodeURIComponent(message)}`;
        window.location.href = mailUrl;
    }

    // Clear cart after successful "order"
    cart = [];
    saveCart();
    updateCartCount();
    alert('Pesanan Anda telah diteruskan. Silakan selesaikan pembayaran melalui platform yang dipilih.');
    showSection('home');
}

function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
    renderHome(filtered);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    showSection('home');

    // Add search listener
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchProducts();
    });
});
