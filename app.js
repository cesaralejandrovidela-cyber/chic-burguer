// Chic Burger - Core Application Logic (Updated with Auth, Page Separation, Nile DB Full-Stack API Integration)
// Handles Catalog state, shopping cart drawer, customized additions, automatic discounts,
// localStorage persistency, admin product CRUD via REST API, sessionStorage authentication, and WhatsApp checkout.

// API URL CONFIGURATION
// Auto-detects local development vs production (Vercel API hosting)
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:10000"
    : ""; // Relative path in production since frontend and backend are hosted together on Vercel!

// Global State
let products = [];
let cart = [];
let activeCategory = 'all';
let activeCustomizerProduct = null;
let currentCustomizerState = {
    size: 'chico',
    sizePrice: 0,
    combo: false,
    comboPrice: 3500,
    extras: [], // Array of {name, price}
    quantity: 1
};

// Selected product ID in Admin panel
let selectedEditingProductId = null;

// Initial Seed Products (Used as fallback if API is not yet configured or is offline)
const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: "Hamburguesa Simple",
        category: "hamburguesas",
        price: 7000,
        description: "Carne vacuna casera, lechuga, tomate, jamón, queso y huevo. Acompañada con papas fritas.",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60",
        active: true,
        allowSizes: true,
        priceMediano: 1500,
        priceGrande: 3000,
        allowCombos: true,
        priceCombo: 3500,
        allowExtras: true,
        priceExtraPapas: 1200,
        priceExtraQueso: 800,
        priceExtraBebida: 1500,
        allowPromo: true,
        promo2xPrice: 12000
    },
    {
        id: 2,
        name: "Hamburguesa Simple con Cheddar",
        category: "hamburguesas",
        price: 8000,
        description: "Carne vacuna casera, queso cheddar, lechuga, tomate y huevo. Acompañada con papas fritas.",
        imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop&q=60",
        active: true,
        allowSizes: true,
        priceMediano: 1500,
        priceGrande: 3000,
        allowCombos: true,
        priceCombo: 3500,
        allowExtras: true,
        priceExtraPapas: 1200,
        priceExtraQueso: 800,
        priceExtraBebida: 1500,
        allowPromo: true,
        promo2xPrice: 14000
    },
    {
        id: 3,
        name: "Hamburguesa Doble",
        category: "hamburguesas",
        price: 8500,
        description: "Doble carne vacuna casera, lechuga, tomate, jamón, queso y huevo. Acompañada con papas fritas.",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60",
        active: true,
        allowSizes: true,
        priceMediano: 1500,
        priceGrande: 3000,
        allowCombos: true,
        priceCombo: 3500,
        allowExtras: true,
        priceExtraPapas: 1200,
        priceExtraQueso: 800,
        priceExtraBebida: 1500,
        allowPromo: true,
        promo2xPrice: 16000
    },
    {
        id: 4,
        name: "Hamburguesa Doble con Cheddar",
        category: "hamburguesas",
        price: 9000,
        description: "Doble carne vacuna casera, queso cheddar, lechuga, tomate y huevo. Acompañada con papas fritas.",
        imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=60",
        active: true,
        allowSizes: true,
        priceMediano: 1500,
        priceGrande: 3000,
        allowCombos: true,
        priceCombo: 3500,
        allowExtras: true,
        priceExtraPapas: 1200,
        priceExtraQueso: 800,
        priceExtraBebida: 1500,
        allowPromo: true,
        promo2xPrice: 17000
    },
    {
        id: 5,
        name: "Hamburguesa Triple Simple",
        category: "hamburguesas",
        price: 10000,
        description: "Triple carne vacuna casera, lechuga, tomate, jamón, queso y huevo. Acompañada con papas fritas.",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60",
        active: true,
        allowSizes: true,
        priceMediano: 1500,
        priceGrande: 3000,
        allowCombos: true,
        priceCombo: 3500,
        allowExtras: true,
        priceExtraPapas: 1200,
        priceExtraQueso: 800,
        priceExtraBebida: 1500,
        allowPromo: true,
        promo2xPrice: 18000
    },
    {
        id: 6,
        name: "Hamburguesa Triple con Cheddar",
        category: "hamburguesas",
        price: 10500,
        description: "Triple carne vacuna casera, queso cheddar, lechuga, tomate y huevo. Acompañada con papas fritas.",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60",
        active: true,
        allowSizes: true,
        priceMediano: 1500,
        priceGrande: 3000,
        allowCombos: true,
        priceCombo: 3500,
        allowExtras: true,
        priceExtraPapas: 1200,
        priceExtraQueso: 800,
        priceExtraBebida: 1500,
        allowPromo: true,
        promo2xPrice: 18500
    },
    {
        id: 7,
        name: "Papas Fritas Medianas",
        category: "papas-extras",
        price: 3500,
        description: "Porción de papas fritas tradicionales crocantes, sazonadas con sal y hierbas.",
        imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=60",
        active: true,
        allowSizes: false,
        priceMediano: 0,
        priceGrande: 0,
        allowCombos: false,
        priceCombo: 0,
        allowExtras: true,
        priceExtraPapas: 1200,
        priceExtraQueso: 800,
        priceExtraBebida: 1500,
        allowPromo: false,
        promo2xPrice: 0
    },
    {
        id: 8,
        name: "Papas Especiales con Cheddar & Bacon",
        category: "papas-extras",
        price: 4800,
        description: "Porción grande de papas fritas cubiertas de queso cheddar fundido y panceta crujiente picada.",
        imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=60",
        active: true,
        allowSizes: false,
        priceMediano: 0,
        priceGrande: 0,
        allowCombos: false,
        priceCombo: 0,
        allowExtras: false,
        priceExtraPapas: 0,
        priceExtraQueso: 0,
        priceExtraBebida: 0,
        allowPromo: false,
        promo2xPrice: 0
    }
];

// INIT
window.addEventListener("DOMContentLoaded", () => {
    // Apply theme from settings
    const localTheme = localStorage.getItem("chic_theme") || "theme-plastic-pink";
    applyTheme(localTheme);
    loadTheme();

    // Apply custom brand background if present in localStorage
    applyWebpageBackground();

    // Load products from Nile API
    fetchProducts();
    
    // Load cart from LocalStorage
    const storedCart = localStorage.getItem("chic_cart");
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
    
    // Page-specific initialization based on DOM nodes
    const isClientPage = document.getElementById("view-client") !== null;
    const isAdminPage = document.getElementById("view-admin") !== null;
    
    if (isClientPage) {
        renderCart();
        initDynamicBackground();
    }
    
    if (isAdminPage) {
        checkAdminSession();
        setupDragAndDrop();
    }
});

// Apply custom brand background styling to body
function applyWebpageBackground() {
    const bgData = localStorage.getItem("chic_custom_bg");
    if (bgData) {
        document.body.style.backgroundImage = `url('${bgData}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    } else {
        document.body.style.backgroundImage = "";
    }
}

// LOAD PRODUCTS FROM REST API
async function fetchProducts() {
    try {
        console.log(`fetching products from ${API_URL}/api/products...`);
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error("API request failed");
        
        products = await res.json();
        console.log("Products loaded from database successfully:", products.length);
    } catch (err) {
        console.warn("Could not reach backend API. Falling back to local storage/seed:", err);
        // Fallback to local storage or initial values
        const storedProducts = localStorage.getItem("chic_products");
        if (storedProducts) {
            products = JSON.parse(storedProducts);
        } else {
            products = [...INITIAL_PRODUCTS];
            localStorage.setItem("chic_products", JSON.stringify(products));
        }
    }
    
    // Custom category sorting: hamburguesas first, combos, papas, bebidas last
    const categoryOrder = {
        'hamburguesas': 1,
        'combos': 2,
        'papas-extras': 3,
        'bebidas': 4
    };
    products.sort((a, b) => {
        const orderA = categoryOrder[a.category] || 99;
        const orderB = categoryOrder[b.category] || 99;
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        return a.id - b.id;
    });
    
    // Render whichever components exist on the page
    const isClientPage = document.getElementById("view-client") !== null;
    const isAdminPage = document.getElementById("view-admin") !== null;
    
    if (isClientPage) renderCatalog();
    if (isAdminPage) renderInventoryList();
}

// View Switcher Router
function switchView(view) {
    if (view === 'client') {
        window.location.href = 'catalogo.html';
    } else {
        window.location.href = 'index.html';
    }
}

// ================= ADMIN SECURITY (LOGIN DIARIO) =================

function checkAdminSession() {
    const isLogged = sessionStorage.getItem("chic_admin_session") === "active";
    const loginOverlay = document.getElementById("admin-login-overlay");
    const dashboardView = document.getElementById("admin-dashboard-view");
    
    if (!loginOverlay || !dashboardView) return;
    
    if (isLogged) {
        loginOverlay.classList.add("hidden");
        dashboardView.classList.remove("hidden");
        
        renderInventoryList();
        closeProductEditor();
    } else {
        loginOverlay.classList.remove("hidden");
        dashboardView.classList.add("hidden");
    }
}

function handleAdminLogin(event) {
    if (event) event.preventDefault();
    
    const user = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value.trim();
    
    if (user === "admin" && pass === "chicburger2026") {
        sessionStorage.setItem("chic_admin_session", "active");
        showToast("Sesión de gestión iniciada correctamente", "success");
        checkAdminSession();
    } else {
        showToast("Credenciales inválidas. Reintenta.", "error");
    }
}

function handleAdminLogout() {
    if (confirm("¿Cerrar la sesión de gestión diaria?")) {
        sessionStorage.removeItem("chic_admin_session");
        showToast("Sesión finalizada", "info");
        checkAdminSession();
    }
}

// ================= VISTA CLIENTE: CATÁLOGO =================

// Render Catalog Grids
function renderCatalog() {
    const container = document.getElementById("catalog-products-container");
    if (!container) return;
    container.innerHTML = "";
    
    const activeProducts = products.filter(p => p.active);
    const filteredProducts = activeCategory === 'all' 
        ? activeProducts 
        : activeProducts.filter(p => p.category === activeCategory);
        
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #888;">
                <i class="fa-solid fa-face-frown" style="font-size: 2.5rem; margin-bottom: 0.8rem;"></i>
                <p>No hay productos activos en esta categoría por el momento.</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const hasCustomOptions = product.allowSizes || product.allowCombos || product.allowExtras;
        const promoCloud = (product.allowPromo && product.promo2xPrice)
            ? `<div class="product-promo-badge-cloud">
                   <span class="promo-label">PROMO 2x</span>
                   <span class="promo-price-val">$${product.promo2xPrice.toLocaleString('es-AR')}</span>
               </div>`
            : "";
            
        const card = document.createElement("div");
        card.className = "product-card";
        card.style.cursor = "pointer";
        card.onclick = (e) => {
            if (!e.target.closest('.btn-add')) {
                openCustomizer(product.id);
            }
        };
        card.innerHTML = `
            <!-- Floating Promo Badge -->
            ${promoCloud}
            
            <div class="product-image-container">
                <img src="${product.imageUrl}" class="product-image" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60'">
            </div>
            <div class="product-content">
                <div class="product-sticker-title">
                    <h3 class="product-name">${product.name}</h3>
                </div>
                
                <p class="product-description">${product.description || 'Sin descripción disponible.'}</p>
                
                <div class="product-price-ribbon">
                    $${product.price.toLocaleString('es-AR')}
                </div>
                
                <div class="product-footer">
                    <button class="btn-add" style="width: 100%;" onclick="${hasCustomOptions ? `openCustomizer(${product.id})` : `quickAddProduct(${product.id})`}">
                        ${hasCustomOptions ? '<i class="fa-solid fa-sliders"></i> Pedir' : '<i class="fa-solid fa-plus"></i> Agregar'}
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Category filter tabs
function filterCategory(category) {
    activeCategory = category;
    
    const btns = document.querySelectorAll("#category-nav-bar .category-btn");
    btns.forEach(btn => btn.classList.remove("active"));
    
    event.currentTarget.classList.add("active");
    renderCatalog();
}

// Add directly if no choices are required (e.g. Lata de Coca)
function quickAddProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const cartItemId = Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    const cartItem = {
        id: cartItemId,
        productId: product.id,
        name: product.name,
        quantity: 1,
        basePrice: product.price,
        subtotal: product.price,
        details: {
            size: 'regular',
            combo: false,
            extras: []
        }
    };
    
    cart.push(cartItem);
    saveCart();
    renderCart();
    showToast(`¡${product.name} agregado al carrito!`, "success");
}

// Open Promo Flyer selection in Customizer (e.g. 4 Hamburguesas con papas)
function openPromoCustomizer(promoType) {
    togglePromosModal(false);
    let promoProduct = {};
    
    if (promoType === 'promo-chic') {
        promoProduct = {
            id: 999,
            name: "Promo Chic Burger (4 Hamburguesas)",
            price: 23000,
            description: "4 Hamburguesas completas con papas fritas familiares. (Tamaño chico por defecto).",
            imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=60",
            allowSizes: false,
            allowCombos: false,
            allowExtras: true,
            priceExtraPapas: 1200,
            priceExtraQueso: 800,
            priceExtraBebida: 1500
        };
    } else if (promoType === 'promo-2x') {
        promoProduct = {
            id: 998,
            name: "Promo 2x XL + Papas",
            price: 12000,
            description: "Dos hamburguesas extra grandes completas con papas fritas medianas.",
            imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=60",
            allowSizes: false,
            allowCombos: false,
            allowExtras: true,
            priceExtraPapas: 1200,
            priceExtraQueso: 800,
            priceExtraBebida: 1500
        };
    }
    
    openCustomizerDirect(promoProduct);
}

// ================= CUSTOMIZER MODAL LOGIC =================

function openCustomizer(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    openCustomizerDirect(product);
}

function openCustomizerDirect(product) {
    activeCustomizerProduct = product;
    
    currentCustomizerState = {
        size: product.allowSizes ? 'chico' : 'regular',
        sizePrice: 0,
        combo: false,
        comboPrice: product.priceCombo || 3500,
        extras: [],
        quantity: 1
    };
    
    document.getElementById("cust-prod-name").textContent = product.name;
    document.getElementById("cust-prod-desc").textContent = product.description;
    
    const imgEl = document.getElementById("cust-prod-img");
    imgEl.src = product.imageUrl;
    imgEl.onerror = () => imgEl.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60';
    
    // Sizes
    const sizeSec = document.getElementById("cust-section-sizes");
    const sizesContainer = document.getElementById("cust-sizes-container");
    sizesContainer.innerHTML = "";
    
    if (product.allowSizes) {
        sizeSec.classList.remove("hidden");
        const medPrice = product.priceMediano || 1500;
        const grnPrice = product.priceGrande || 3000;
        
        sizesContainer.innerHTML = `
            <label class="option-card selected" onclick="selectSizeOption(this, 'chico', 0)">
                <input type="radio" name="cust-size" value="chico" checked>
                <span class="option-label">Chico (Simple)</span>
                <span class="option-price">Sin costo extra</span>
            </label>
            <label class="option-card" onclick="selectSizeOption(this, 'mediano', ${medPrice})">
                <input type="radio" name="cust-size" value="mediano">
                <span class="option-label">Mediano (Doble)</span>
                <span class="option-price">+$${medPrice.toLocaleString('es-AR')}</span>
            </label>
            <label class="option-card" onclick="selectSizeOption(this, 'grande', ${grnPrice})">
                <input type="radio" name="cust-size" value="grande">
                <span class="option-label">Grande (Triple)</span>
                <span class="option-price">+$${grnPrice.toLocaleString('es-AR')}</span>
            </label>
        `;
    } else {
        sizeSec.classList.add("hidden");
    }
    
    // Combos
    const comboSec = document.getElementById("cust-section-combos");
    const comboContainer = document.getElementById("cust-combos-container");
    comboContainer.innerHTML = "";
    
    if (product.allowCombos) {
        comboSec.classList.remove("hidden");
        const cmbPrice = product.priceCombo || 3500;
        
        comboContainer.innerHTML = `
            <label class="option-card" id="card-combo-upgrade" onclick="toggleComboOption(this, ${cmbPrice})">
                <input type="checkbox" id="chk-combo-upgrade" value="hamburguesa + papas + bebida">
                <span class="option-label"><i class="fa-solid fa-mug-hot"></i> Menú Combo</span>
                <span class="option-price">+ Papas + Bebida (+$${cmbPrice.toLocaleString('es-AR')})</span>
            </label>
        `;
    } else {
        comboSec.classList.add("hidden");
    }
    
    // Extras
    const extraSec = document.getElementById("cust-section-extras");
    const extrasContainer = document.getElementById("cust-extras-container");
    extrasContainer.innerHTML = "";
    
    if (product.allowExtras) {
        extraSec.classList.remove("hidden");
        const extraPapas = product.priceExtraPapas || 1200;
        const extraQueso = product.priceExtraQueso || 800;
        const extraBebida = product.priceExtraBebida || 1500;
        
        extrasContainer.innerHTML = `
            <label class="option-card" onclick="toggleExtraOption(this, 'papas', ${extraPapas})">
                <input type="checkbox" name="cust-extra" value="papas">
                <span class="option-label">Papas Extras</span>
                <span class="option-price">+$${extraPapas.toLocaleString('es-AR')}</span>
            </label>
            <label class="option-card" onclick="toggleExtraOption(this, 'queso extra', ${extraQueso})">
                <input type="checkbox" name="cust-extra" value="queso extra">
                <span class="option-label">Queso Extra</span>
                <span class="option-price">+$${extraQueso.toLocaleString('es-AR')}</span>
            </label>
            <label class="option-card" onclick="toggleExtraOption(this, 'bebida grande', ${extraBebida})">
                <input type="checkbox" name="cust-extra" value="bebida grande">
                <span class="option-label">Bebida Grande</span>
                <span class="option-price">+$${extraBebida.toLocaleString('es-AR')}</span>
            </label>
        `;
    } else {
        extraSec.classList.add("hidden");
    }
    
    document.getElementById("cust-quantity").textContent = "1";
    
    updateCustomizerTotalPrice();
    
    // Push state to history for mobile back-button support
    if (!modalStatePushed) {
        history.pushState({ modalOpen: true }, "");
        modalStatePushed = true;
    }
    
    document.getElementById("customizer-modal").classList.add("open");
}

let modalStatePushed = false;
let promosModalStatePushed = false;

function closeCustomizerModal(isPopState = false) {
    document.getElementById("customizer-modal").classList.remove("open");
    activeCustomizerProduct = null;
    
    // If we closed the modal manually (not via browser back button),
    // we must pop the history state we pushed so history stays clean.
    if (modalStatePushed && !isPopState) {
        history.back();
        modalStatePushed = false;
    } else if (isPopState) {
        modalStatePushed = false;
    }
}

function togglePromosModal(open, isPopState = false) {
    const modal = document.getElementById("promos-modal");
    if (!modal) return;
    
    if (open) {
        modal.classList.add("open");
        if (!isPopState) {
            history.pushState({ promosOpen: true }, "");
            promosModalStatePushed = true;
        }
    } else {
        modal.classList.remove("open");
        if (promosModalStatePushed && !isPopState) {
            history.back();
            promosModalStatePushed = false;
        } else if (isPopState) {
            promosModalStatePushed = false;
        }
    }
}

// Listen to browser Back button (popstate)
window.addEventListener("popstate", (event) => {
    const modal = document.getElementById("customizer-modal");
    if (modal && modal.classList.contains("open")) {
        closeCustomizerModal(true);
    }
    const promosModal = document.getElementById("promos-modal");
    if (promosModal && promosModal.classList.contains("open")) {
        togglePromosModal(false, true);
    }
});

// Listen to Escape key to close modals
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        const modal = document.getElementById("customizer-modal");
        if (modal && modal.classList.contains("open")) {
            closeCustomizerModal();
        }
        const promosModal = document.getElementById("promos-modal");
        if (promosModal && promosModal.classList.contains("open")) {
            togglePromosModal(false);
        }
        // Also close the cart drawer if it is open
        const drawer = document.getElementById("cart-drawer-overlay");
        if (drawer && drawer.classList.contains("open")) {
            toggleCartDrawer(false);
        }
    }
});

// Customize events
function selectSizeOption(card, sizeVal, priceMod) {
    const cards = document.querySelectorAll("#cust-sizes-container .option-card");
    cards.forEach(c => c.classList.remove("selected"));
    
    card.classList.add("selected");
    card.querySelector("input").checked = true;
    
    currentCustomizerState.size = sizeVal;
    currentCustomizerState.sizePrice = priceMod;
    
    updateCustomizerTotalPrice();
}

function toggleComboOption(card, priceMod) {
    const chk = document.getElementById("chk-combo-upgrade");
    chk.checked = !chk.checked;
    
    if (chk.checked) {
        card.classList.add("selected");
    } else {
        card.classList.remove("selected");
    }
    
    currentCustomizerState.combo = chk.checked;
    currentCustomizerState.comboPrice = priceMod;
    
    updateCustomizerTotalPrice();
}

function toggleExtraOption(card, extraVal, priceMod) {
    const chk = card.querySelector("input");
    chk.checked = !chk.checked;
    
    if (chk.checked) {
        card.classList.add("selected");
        currentCustomizerState.extras.push({ name: extraVal, price: priceMod });
    } else {
        card.classList.remove("selected");
        currentCustomizerState.extras = currentCustomizerState.extras.filter(e => e.name !== extraVal);
    }
    
    updateCustomizerTotalPrice();
}

function updateCustQuantity(delta) {
    let q = currentCustomizerState.quantity + delta;
    if (q < 1) q = 1;
    currentCustomizerState.quantity = q;
    document.getElementById("cust-quantity").textContent = q;
    updateCustomizerTotalPrice();
}

function updateCustomizerTotalPrice() {
    if (!activeCustomizerProduct) return;
    
    const base = activeCustomizerProduct.price;
    const sizeAdd = activeCustomizerProduct.allowSizes ? currentCustomizerState.sizePrice : 0;
    const comboAdd = (activeCustomizerProduct.allowCombos && currentCustomizerState.combo) ? currentCustomizerState.comboPrice : 0;
    const extrasAdd = activeCustomizerProduct.allowExtras 
        ? currentCustomizerState.extras.reduce((sum, item) => sum + item.price, 0)
        : 0;
        
    const itemTotal = (base + sizeAdd + comboAdd + extrasAdd) * currentCustomizerState.quantity;
    document.getElementById("cust-total-display").textContent = "$" + itemTotal.toLocaleString('es-AR');
}

// Add Item from Customizer to Cart
function addProductToCart() {
    if (!activeCustomizerProduct) return;
    
    const product = activeCustomizerProduct;
    const quantity = currentCustomizerState.quantity;
    
    let customizedName = product.name;
    const detailsList = [];
    
    if (product.allowSizes) {
        const sizeName = currentCustomizerState.size.charAt(0).toUpperCase() + currentCustomizerState.size.slice(1);
        detailsList.push(`Tamaño: ${sizeName}`);
    }
    
    if (product.allowCombos && currentCustomizerState.combo) {
        customizedName += " + Combo 🍟🥤";
        detailsList.push("Combo");
    }
    
    if (product.allowExtras && currentCustomizerState.extras.length > 0) {
        const extrasStr = currentCustomizerState.extras.map(e => e.name).join(", ");
        detailsList.push(`Extras: ${extrasStr}`);
    }
    
    const base = product.price;
    const sizeAdd = product.allowSizes ? currentCustomizerState.sizePrice : 0;
    const comboAdd = (product.allowCombos && currentCustomizerState.combo) ? currentCustomizerState.comboPrice : 0;
    const extrasAdd = product.allowExtras ? currentCustomizerState.extras.reduce((sum, item) => sum + item.price, 0) : 0;
    
    const singlePrice = base + sizeAdd + comboAdd + extrasAdd;
    const subtotal = singlePrice * quantity;
    
    const cartItemId = Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    const cartItem = {
        id: cartItemId,
        productId: product.id,
        name: customizedName,
        quantity: quantity,
        basePrice: singlePrice,
        subtotal: subtotal,
        details: {
            size: product.allowSizes ? currentCustomizerState.size : 'regular',
            combo: product.allowCombos ? currentCustomizerState.combo : false,
            extras: [...currentCustomizerState.extras]
        }
    };
    
    cart.push(cartItem);
    saveCart();
    renderCart();
    
    closeCustomizerModal();
    showToast(`¡${quantity}x ${product.name} agregado al carrito!`, "success");
}

// ================= SHOPPING CART DRAWER LOGIC =================

function toggleCartDrawer(open) {
    const drawer = document.getElementById("cart-drawer-overlay");
    if (!drawer) return;
    
    if (open) {
        drawer.classList.add("open");
    } else {
        drawer.classList.remove("open");
    }
}

function removeCartItem(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    renderCart();
    showToast("Producto eliminado del pedido", "info");
}

// Render Cart Drawer Content
function renderCart() {
    const listEl = document.getElementById("cart-items-list");
    const emptyEl = document.getElementById("cart-empty-message");
    if (!listEl || !emptyEl) return;
    
    const items = cart;
    const countEl = document.getElementById("cart-item-count");
    if (countEl) countEl.textContent = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const itemNodes = listEl.querySelectorAll(".cart-item");
    itemNodes.forEach(node => node.remove());
    
    if (items.length === 0) {
        emptyEl.classList.remove("hidden");
        document.getElementById("cart-subtotal").textContent = "$0";
        document.getElementById("cart-discounts").textContent = "-$0";
        document.getElementById("cart-total").textContent = "$0";
        document.getElementById("row-discounts").style.display = "none";
        return;
    }
    
    emptyEl.classList.add("hidden");
    
    let subtotalSum = 0;
    
    items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const imgUrl = product ? product.imageUrl : "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60";
        
        const detailsText = [];
        if (item.details.size && item.details.size !== 'regular') {
            detailsText.push(`Tamaño: ${item.details.size}`);
        }
        if (item.details.combo) {
            detailsText.push("Menú Combo (+ Papas + Bebida)");
        }
        if (item.details.extras && item.details.extras.length > 0) {
            detailsText.push("Extras: " + item.details.extras.map(e => e.name).join(", "));
        }
        
        const detailsHtml = detailsText.length > 0 
            ? `<div class="cart-item-details">${detailsText.join(" | ")}</div>` 
            : "";
            
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <img src="${imgUrl}" class="cart-item-img" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60'">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name} <span style="color: var(--primary-pink); font-size: 0.85rem;">x${item.quantity}</span></div>
                ${detailsHtml}
                <div class="cart-item-footer">
                    <span class="cart-item-price">$${item.subtotal.toLocaleString('es-AR')}</span>
                    <button class="btn-remove-item" onclick="removeCartItem('${item.id}')">
                        <i class="fa-solid fa-trash-can"></i> Quitar
                    </button>
                </div>
            </div>
        `;
        listEl.appendChild(div);
        
        subtotalSum += item.subtotal;
    });
    
    // AUTOMATIC DISCOUNTS CALCULATION ENGINE
    let discountSum = 0;
    
    const prodCounts = {};
    cart.forEach(item => {
        const originalProduct = products.find(p => p.id === item.productId);
        if (originalProduct && originalProduct.allowPromo && originalProduct.promo2xPrice) {
            if ((item.details.size === 'chico' || item.details.size === 'regular') && !item.details.combo && item.details.extras.length === 0) {
                if (!prodCounts[item.productId]) {
                    prodCounts[item.productId] = 0;
                }
                prodCounts[item.productId] += item.quantity;
            }
        }
    });
    
    Object.keys(prodCounts).forEach(prodId => {
        const id = parseInt(prodId);
        const qty = prodCounts[id];
        const originalProduct = products.find(p => p.id === id);
        
        if (qty >= 2) {
            const pairs = Math.floor(qty / 2);
            const normalPairCost = originalProduct.price * 2;
            const promoPairCost = originalProduct.promo2xPrice;
            const savingsPerPair = normalPairCost - promoPairCost;
            
            discountSum += (pairs * savingsPerPair);
        }
    });
    
    document.getElementById("cart-subtotal").textContent = "$" + subtotalSum.toLocaleString('es-AR');
    
    if (discountSum > 0) {
        document.getElementById("row-discounts").style.display = "flex";
        document.getElementById("cart-discounts").textContent = "-$" + discountSum.toLocaleString('es-AR');
    } else {
        document.getElementById("row-discounts").style.display = "none";
    }
    
    const finalTotal = subtotalSum - discountSum;
    document.getElementById("cart-total").textContent = "$" + finalTotal.toLocaleString('es-AR');
}

function saveCart() {
    localStorage.setItem("chic_cart", JSON.stringify(cart));
}

// CHECKOUT VIA WHATSAPP REDIRECT
function checkoutOrder() {
    if (cart.length === 0) {
        showToast("Tu carrito está vacío", "error");
        return;
    }
    
    const name = document.getElementById("cust-delivery-name").value.trim();
    const address = document.getElementById("cust-delivery-address").value.trim();
    
    if (!name || !address) {
        showToast("Por favor completa tu Nombre y Dirección de Entrega.", "warn");
        return;
    }
    
    let text = `\u{1F354} *PEDIDO CHIC BURGER* \u{1F354}\n`;
    text += `_Un Viaje de Sabor para Compartir_\n`;
    text += `===============================\n`;
    text += `\u{1F464} *Cliente:* ${name}\n`;
    text += `\u{1F4CD} *Dirección de Entrega:* ${address}\n`;
    text += `===============================\n\n`;
    text += `\u{1F4E6} *Detalle del Pedido:*\n`;
    
    let subtotalSum = 0;
    cart.forEach(item => {
        text += `• *${item.quantity}x ${item.name}*\n`;
        
        const subDetails = [];
        if (item.details.size && item.details.size !== 'regular') {
            subDetails.push(`Tamaño: ${item.details.size}`);
        }
        if (item.details.combo) {
            subDetails.push("Menú Combo \u{1F35F}\u{1F964}");
        }
        if (item.details.extras && item.details.extras.length > 0) {
            subDetails.push("Extras: " + item.details.extras.map(e => e.name).join(", "));
        }
        
        if (subDetails.length > 0) {
            text += `  _(${subDetails.join(" | ")})_\n`;
        }
        
        text += `  _Subtotal: $${item.subtotal.toLocaleString('es-AR')}_\n\n`;
        subtotalSum += item.subtotal;
    });
    
    let discountSum = 0;
    const prodCounts = {};
    cart.forEach(item => {
        const originalProduct = products.find(p => p.id === item.productId);
        if (originalProduct && originalProduct.allowPromo && originalProduct.promo2xPrice) {
            if ((item.details.size === 'chico' || item.details.size === 'regular') && !item.details.combo && item.details.extras.length === 0) {
                if (!prodCounts[item.productId]) prodCounts[item.productId] = 0;
                prodCounts[item.productId] += item.quantity;
            }
        }
    });
    
    Object.keys(prodCounts).forEach(prodId => {
        const id = parseInt(prodId);
        const qty = prodCounts[id];
        const originalProduct = products.find(p => p.id === id);
        if (qty >= 2) {
            const pairs = Math.floor(qty / 2);
            const savingsPerPair = (originalProduct.price * 2) - originalProduct.promo2xPrice;
            discountSum += (pairs * savingsPerPair);
        }
    });
    
    text += `===============================\n`;
    text += `\u{1F4B5} *Subtotal:* $${subtotalSum.toLocaleString('es-AR')}\n`;
    if (discountSum > 0) {
        text += `\u{1F3F7}\u{FE0F} *Descuentos Aplicados:* -$${discountSum.toLocaleString('es-AR')}\n`;
    }
    const finalTotal = subtotalSum - discountSum;
    text += `\u{1F4B0} *TOTAL A PAGAR:* $${finalTotal.toLocaleString('es-AR')}\n\n`;
    text += `\u{1F6F5} _Rápido, Rico y Hecho con Amor_ \u{2764}\u{FE0F}`;
    
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5492665131424&text=${encodedText}`;
    
    cart = [];
    saveCart();
    renderCart();
    toggleCartDrawer(false);
    
    showToast("Redirigiendo a WhatsApp...", "success");
    window.open(whatsappUrl, '_blank');
}

// ================= COORDINA EL INVENTARIO Y EL EDITOR EN DOS COLUMNAS =================

function renderInventoryList() {
    const searchVal = document.getElementById("inventory-search").value.toLowerCase();
    const container = document.getElementById("inventory-items-container");
    if (!container) return;
    container.innerHTML = "";
    
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchVal));
    
    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: #888; font-size: 0.8rem; padding: 2rem;">No se encontraron productos.</div>`;
        return;
    }
    
    filtered.forEach(p => {
        const div = document.createElement("div");
        div.className = `inventory-item-row ${selectedEditingProductId === p.id ? 'selected-item' : ''}`;
        div.onclick = () => selectProductForEditing(p.id);
        
        div.innerHTML = `
            <img src="${p.imageUrl}" class="inventory-item-thumb" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60'">
            <div class="inventory-item-info">
                <div class="inventory-item-name">${p.name}</div>
                <div class="inventory-item-desc">$${p.price.toLocaleString('es-AR')} | ${p.category}</div>
            </div>
            <span class="badge-status ${p.active ? 'active' : 'inactive'}">
                ${p.active ? 'Activo' : 'Pausado'}
            </span>
        `;
        container.appendChild(div);
    });
}

function selectProductForEditing(productId) {
    selectedEditingProductId = productId;
    
    renderInventoryList();
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Show editor card
    document.getElementById("editor-placeholder-card").classList.add("hidden");
    const editorCard = document.getElementById("editor-active-card");
    editorCard.classList.remove("hidden");
    
    // Bind form elements
    document.getElementById("edit-prod-id").value = product.id;
    document.getElementById("edit-prod-name").value = product.name;
    document.getElementById("edit-prod-category").value = product.category;
    document.getElementById("edit-prod-price").value = product.price;
    document.getElementById("edit-prod-desc").value = product.description || "";
    
    // Bind Features Toggles and Checkboxes
    document.getElementById("edit-allow-sizes").checked = !!product.allowSizes;
    document.getElementById("edit-price-mediano").value = product.priceMediano || 1500;
    document.getElementById("edit-price-grande").value = product.priceGrande || 3000;
    
    document.getElementById("edit-allow-combos").checked = !!product.allowCombos;
    document.getElementById("edit-price-combo").value = product.priceCombo || 3500;
    
    document.getElementById("edit-allow-extras").checked = !!product.allowExtras;
    document.getElementById("edit-price-extra-papas").value = product.priceExtraPapas || 1200;
    document.getElementById("edit-price-extra-queso").value = product.priceExtraQueso || 800;
    document.getElementById("edit-price-extra-bebida").value = product.priceExtraBebida || 1500;
    
    document.getElementById("edit-allow-promo").checked = !!product.allowPromo;
    document.getElementById("edit-price-promo").value = product.promo2xPrice || "";
    
    toggleFeatureInputs('sizes');
    toggleFeatureInputs('combos');
    toggleFeatureInputs('extras');
    toggleFeatureInputs('promo');
    
    document.getElementById("editing-product-label").textContent = `Editando: ${product.name}`;
    const btnActive = document.getElementById("btn-toggle-product-active");
    btnActive.innerHTML = product.active 
        ? `<i class="fa-solid fa-eye-slash"></i> Pausar Venta`
        : `<i class="fa-solid fa-eye"></i> Activar Venta`;
        
    // Load image directly to the preview element
    const previewImg = document.getElementById("live-flyer-preview-img");
    if (previewImg) {
        previewImg.src = product.imageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60";
    }
    
    updateLivePreviewText();
}

function createNewProductTemplate() {
    selectedEditingProductId = null;
    renderInventoryList();
    
    document.getElementById("editor-placeholder-card").classList.add("hidden");
    const editorCard = document.getElementById("editor-active-card");
    editorCard.classList.remove("hidden");
    
    document.getElementById("edit-prod-id").value = "";
    document.getElementById("edit-prod-name").value = "Nueva Hamburguesa";
    document.getElementById("edit-prod-category").value = "hamburguesas";
    document.getElementById("edit-prod-price").value = "7500";
    document.getElementById("edit-prod-desc").value = "Ingredientes ricos...";
    
    document.getElementById("edit-allow-sizes").checked = true;
    document.getElementById("edit-price-mediano").value = 1500;
    document.getElementById("edit-price-grande").value = 3000;
    
    document.getElementById("edit-allow-combos").checked = true;
    document.getElementById("edit-price-combo").value = 3500;
    
    document.getElementById("edit-allow-extras").checked = true;
    document.getElementById("edit-price-extra-papas").value = 1200;
    document.getElementById("edit-price-extra-queso").value = 800;
    document.getElementById("edit-price-extra-bebida").value = 1500;
    
    document.getElementById("edit-allow-promo").checked = false;
    document.getElementById("edit-price-promo").value = "";
    
    toggleFeatureInputs('sizes');
    toggleFeatureInputs('combos');
    toggleFeatureInputs('extras');
    toggleFeatureInputs('promo');
    
    document.getElementById("editing-product-label").textContent = "Creando Nuevo Producto";
    document.getElementById("btn-toggle-product-active").innerHTML = `<i class="fa-solid fa-eye"></i> Activar Venta`;
    
    const previewImg = document.getElementById("live-flyer-preview-img");
    if (previewImg) {
        previewImg.src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60";
    }
    
    updateLivePreviewText();
}

function closeProductEditor() {
    const ph = document.getElementById("editor-placeholder-card");
    const ac = document.getElementById("editor-active-card");
    if (ph) ph.classList.remove("hidden");
    if (ac) ac.classList.add("hidden");
    selectedEditingProductId = null;
}

// Collapses inputs depending on checkboxes
function toggleFeatureInputs(feature) {
    const chk = document.getElementById(`edit-allow-${feature}`);
    const block = document.getElementById(`inputs-${feature}-block`);
    if (!chk || !block) return;
    
    if (chk.checked) {
        block.classList.remove("hidden");
    } else {
        block.classList.add("hidden");
    }
}

// Live text rendering to sync editing card
function updateLivePreviewText() {
    const nameEl = document.getElementById("edit-prod-name");
    if (!nameEl) return; // not on editor page
    
    const name = nameEl.value;
    const price = parseInt(document.getElementById("edit-prod-price").value) || 0;
    const desc = document.getElementById("edit-prod-desc").value;
    
    const allowPromo = document.getElementById("edit-allow-promo").checked;
    const promoPrice = parseInt(document.getElementById("edit-price-promo").value) || 0;
    
    document.getElementById("live-flyer-name").textContent = name || "Sin nombre";
    document.getElementById("live-flyer-price").textContent = "$" + price.toLocaleString('es-AR');
    document.getElementById("live-flyer-desc").textContent = desc || "Sin ingredientes.";
    
    const badge = document.getElementById("live-flyer-badge-discount");
    if (allowPromo && promoPrice > 0) {
        badge.classList.remove("hidden");
        badge.textContent = `Llevando 2x $${promoPrice.toLocaleString('es-AR')}`;
    } else {
        badge.classList.add("hidden");
    }
}

// CRUD Save Logic calling POST /api/products (Nile DB)
async function saveProductChanges(event) {
    event.preventDefault();
    
    const idVal = document.getElementById("edit-prod-id").value;
    const name = document.getElementById("edit-prod-name").value.trim();
    const category = document.getElementById("edit-prod-category").value;
    const price = parseInt(document.getElementById("edit-prod-price").value);
    const desc = document.getElementById("edit-prod-desc").value.trim();
    
    const allowSizes = document.getElementById("edit-allow-sizes").checked;
    const priceMediano = parseInt(document.getElementById("edit-price-mediano").value) || 1500;
    const priceGrande = parseInt(document.getElementById("edit-price-grande").value) || 3000;
    
    const allowCombos = document.getElementById("edit-allow-combos").checked;
    const priceCombo = parseInt(document.getElementById("edit-price-combo").value) || 3500;
    
    const allowExtras = document.getElementById("edit-allow-extras").checked;
    const priceExtraPapas = parseInt(document.getElementById("edit-price-extra-papas").value) || 1200;
    const priceExtraQueso = parseInt(document.getElementById("edit-price-extra-queso").value) || 800;
    const priceExtraBebida = parseInt(document.getElementById("edit-price-extra-bebida").value) || 1500;
    
    const allowPromo = document.getElementById("edit-allow-promo").checked;
    const promo2xPrice = parseInt(document.getElementById("edit-price-promo").value) || 0;
    
    // Read the image directly from the preview image element src (which is base64 or URL)
    const previewImg = document.getElementById("live-flyer-preview-img");
    const finalImageUrl = previewImg ? previewImg.src : "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60";
    
    const id = idVal ? parseInt(idVal) : Date.now();
    const active = idVal ? (products.find(p => p.id === id)?.active !== false) : true;
    
    const payload = {
        id,
        name,
        category,
        price,
        description: desc,
        imageUrl: finalImageUrl,
        active,
        allowSizes,
        priceMediano,
        priceGrande,
        allowCombos,
        priceCombo,
        allowExtras,
        priceExtraPapas,
        priceExtraQueso,
        priceExtraBebida,
        allowPromo,
        promo2xPrice
    };
    
    showToast("Guardando tarjeta en Nile DB...", "info");
    
    try {
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error("Upsert request failed");
        const result = await response.json();
        
        showToast("¡Tarjeta guardada en Nile DB con éxito!", "success");
        selectedEditingProductId = id;
        
        // Reload products from server and re-render
        await fetchProducts();
    } catch (err) {
        console.error("Error saving to database:", err);
        showToast("Error al guardar en el servidor. Guardado localmente.", "error");
        
        // Local Fallback if server is not reachable
        if (idVal) {
            const idx = products.findIndex(p => p.id === id);
            if (idx !== -1) products[idx] = payload;
        } else {
            products.push(payload);
        }
        localStorage.setItem("chic_products", JSON.stringify(products));
        renderInventoryList();
    }
}

// Toggle product Active state calling POST /api/products/toggle/:id
async function toggleActiveEditingProduct() {
    if (!selectedEditingProductId) return;
    
    showToast("Actualizando estado en Nile DB...", "info");
    
    try {
        const response = await fetch(`${API_URL}/api/products/toggle/${selectedEditingProductId}`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error("Toggle request failed");
        const result = await response.json();
        
        showToast(`Producto ${result.active ? 'activado' : 'pausado'} con éxito`, "success");
        await fetchProducts();
        
        const btnActive = document.getElementById("btn-toggle-product-active");
        btnActive.innerHTML = result.active 
            ? `<i class="fa-solid fa-eye-slash"></i> Pausar Venta`
            : `<i class="fa-solid fa-eye"></i> Activar Venta`;
    } catch (err) {
        console.error("Error toggling product status:", err);
        showToast("Error en el servidor. Modificado de forma local.", "error");
        
        const idx = products.findIndex(p => p.id === selectedEditingProductId);
        if (idx !== -1) {
            products[idx].active = !products[idx].active;
            localStorage.setItem("chic_products", JSON.stringify(products));
            renderInventoryList();
            
            const btnActive = document.getElementById("btn-toggle-product-active");
            btnActive.innerHTML = products[idx].active 
                ? `<i class="fa-solid fa-eye-slash"></i> Pausar Venta`
                : `<i class="fa-solid fa-eye"></i> Activar Venta`;
        }
    }
}

// Delete product calling DELETE /api/products/:id
async function deleteEditingProduct() {
    if (!selectedEditingProductId) return;
    
    if (!confirm("¿Seguro que deseas eliminar definitivamente este producto de la base de datos de Nile?")) {
        return;
    }
    
    showToast("Borrando producto de Nile DB...", "info");
    
    try {
        const response = await fetch(`${API_URL}/api/products/${selectedEditingProductId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error("Delete request failed");
        
        showToast("Producto eliminado de la base de datos", "success");
        selectedEditingProductId = null;
        await fetchProducts();
        closeProductEditor();
    } catch (err) {
        console.error("Error deleting product:", err);
        showToast("Error en el servidor. Borrado de forma local.", "error");
        
        products = products.filter(p => p.id !== selectedEditingProductId);
        localStorage.setItem("chic_products", JSON.stringify(products));
        selectedEditingProductId = null;
        renderInventoryList();
        closeProductEditor();
    }
}

// ================= TOAST NOTIFICATION UTILITY =================

function showToast(message, type = 'success') {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = "toast";
    
    let icon = "fa-circle-check";
    if (type === 'error') {
        icon = "fa-circle-exclamation";
        toast.style.background = "#FF6B8B";
    } else if (type === 'warn') {
        icon = "fa-triangle-exclamation";
        toast.style.background = "#FFEAA7";
        toast.style.color = "#2C1114";
    } else if (type === 'info') {
        icon = "fa-circle-info";
        toast.style.background = "#5C1D24";
    }
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ================= DIRECT IMAGE UPLOADER & DRAG/DROP (NO FILTERS / NO IA) =================

function handleImageUpload(event) {
    const file = event.target.files ? event.target.files[0] : (event.dataTransfer ? event.dataTransfer.files[0] : null);
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast("Error: Selecciona un archivo de imagen válido", "error");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImg = document.getElementById("live-flyer-preview-img");
        if (previewImg) {
            previewImg.src = e.target.result;
        }
        showToast("Imagen cargada con éxito", "success");
    };
    reader.readAsDataURL(file);
}

function setupDragAndDrop() {
    const dropzone = document.getElementById("image-dropzone");
    if (!dropzone) return;
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        handleImageUpload(e);
    });
}

// Spawns floating mini burgers and hearts on the catalog screen background (adapting to current theme)
function initDynamicBackground() {
    const container = document.createElement("div");
    container.className = "dynamic-bg-container";
    document.body.appendChild(container);

    // We always use burgers, hearts, and sparkles for a sweet, branding-consistent look
    const emojis = ["🍔", "💖", "💕", "✨"];
    
    function spawnParticle() {
        if (document.hidden) return;
        
        const particle = document.createElement("div");
        particle.className = "floating-particle";
        
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        particle.textContent = emoji;
        
        const startX = Math.random() * 100;
        const duration = 6 + Math.random() * 6;
        const fontSize = 14 + Math.random() * 14;
        const drift = (Math.random() - 0.5) * 15;
        
        particle.style.left = startX + "%";
        particle.style.fontSize = fontSize + "px";
        particle.style.animationDuration = duration + "s";
        particle.style.setProperty("--drift-val", drift + "vw");
        
        container.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }
    
    // Initial burst
    for (let i = 0; i < 8; i++) {
        setTimeout(spawnParticle, Math.random() * 6000);
    }
    
    // Spawn loop
    window.dynamicBgInterval = setInterval(spawnParticle, 1200);
}

// Fetch active theme configuration from the database settings
async function loadTheme() {
    try {
        const response = await fetch(`${API_URL}/api/settings/theme`);
        if (response.ok) {
            const data = await response.json();
            if (data.theme) {
                applyTheme(data.theme);
            }
        }
    } catch (err) {
        console.error("Error loading theme from database:", err);
    }
}

// Apply theme classes and restart particle background
function applyTheme(theme) {
    document.body.classList.remove('theme-plastic-pink', 'theme-neon-dark', 'theme-candy-mint');
    document.body.classList.add(theme);
    localStorage.setItem("chic_theme", theme);
    
    // Sync admin dropdown selector if present
    const themeSelect = document.getElementById("admin-theme-select");
    if (themeSelect) {
        themeSelect.value = theme;
    }
    
    // Re-initialize background particles if client view is active
    if (document.getElementById("view-client")) {
        const oldContainer = document.querySelector(".dynamic-bg-container");
        if (oldContainer) oldContainer.remove();
        
        if (window.dynamicBgInterval) clearInterval(window.dynamicBgInterval);
        initDynamicBackground();
    }
}

// Save active theme to backend database and apply locally
async function saveTheme(theme) {
    applyTheme(theme);
    try {
        const response = await fetch(`${API_URL}/api/settings/theme`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme })
        });
        if (response.ok) {
            showToast("Tema actualizado en la base de datos", "success");
        } else {
            showToast("No se pudo guardar en el servidor", "error");
        }
    } catch (err) {
        console.error("Error saving theme to database:", err);
        showToast("Error de conexión al guardar tema", "error");
    }
}
