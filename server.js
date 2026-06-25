const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads and URL encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve your frontend HTML and CSS files statically from the current directory
app.use(express.static(path.join(__dirname)));

// ==========================================
// 📦 MOCK DATABASE (Products & Categories)
// ==========================================
const products = [
    {
        id: "prod-101", // Product Code (e.g., s-101)
        code: "s-101",
        name: "Adrika Refined Sarees",
        category: "women-ethnic",
        price: 299,
        discountText: "Extra ₹50 off on 1st order",
        delivery: "Free Delivery",
        rating: 3.8,
        reviews: 4120,
        imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "prod-102",
        code: "f-102",
        name: "Trendy Fashionable Heels",
        category: "bags-footwear",
        price: 349,
        discountText: "Extra ₹40 off on 1st order",
        delivery: "Free Delivery",
        rating: 4.2,
        reviews: 850,
        imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "prod-103",
        code: "m-103",
        name: "Classic Cotton Men's Shirt",
        category: "men",
        price: 249,
        discountText: "Extra ₹30 off on 1st order",
        delivery: "Free Delivery",
        rating: 4.0,
        reviews: 1940,
        imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "prod-104",
        code: "e-104",
        name: "Modern Men's Sports Shoes",
        category: "bags-footwear",
        price: 410,
        discountText: "Extra ₹50 off on 1st order",
        delivery: "Free Delivery",
        rating: 4.1,
        reviews: 3200,
        imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "prod-105",
        code: "w-105",
        name: "Georgette Floral Western Dress",
        category: "women-western",
        price: 399,
        discountText: "Extra ₹60 off on 1st order",
        delivery: "Free Delivery",
        rating: 4.5,
        reviews: 215,
        imageUrl: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=400&q=80"
    }
];

// Mock In-Memory User Cart State
let userCart = [];

// ==========================================
// 🔌 API ENDPOINTS
// ==========================================

/**
 * 1. GET ALL PRODUCTS / FILTER BY CATEGORY / SEARCH TERM & CODES
 * Handles requests like: /api/products?search=s-101 or /api/products?category=men
 */
app.get('/api/products', (req, requireResponse) => {
    const { search, category } = req.query;
    let filteredProducts = [...products];

    // Filter by Category if provided
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category.toLowerCase());
    }

    // Process Search Queries (Handles keywords AND unique Meesho Alphanumeric Product Codes)
    if (search) {
        const query = search.trim().toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.code.toLowerCase() === query
        );
    }

    requireResponse.json({
        success: true,
        count: filteredProducts.length,
        data: filteredProducts
    });
});

/**
 * 2. GET SINGLE PRODUCT BY ID
 */
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id || p.code === req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.json({ success: true, data: product });
});

/**
 * 3. GET CART ITEMS
 */
app.get('/api/cart', (req, res) => {
    res.json({ success: true, cart: userCart, totalItems: userCart.length });
});

/**
 * 4. ADD ITEM TO CART
 */
app.post('/api/cart/add', (req, res) => {
    const { productId } = req.body;
    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).json({ success: false, message: "Invalid Product ID." });
    }

    // Check if item already exists in cart
    const existingItem = userCart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        userCart.push({ ...product, quantity: 1 });
    }

    res.json({ 
        success: true, 
        message: "Product successfully added to cart!", 
        cart: userCart,
        totalItems: userCart.reduce((acc, item) => acc + item.quantity, 0)
    });
});

/**
 * 5. CLEAR CART (Simulate successful checkout completion)
 */
app.post('/api/cart/checkout', (req, res) => {
    if (userCart.length === 0) {
        return res.status(400).json({ success: false, message: "Your cart is empty." });
    }
    userCart = []; // flush memory store
    res.json({ success: true, message: "Order placed successfully via Cash on Delivery (COD)!" });
});

// Fallback Route: Direct any unspecified page traffic to the primary index file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// 🚀 START ENGINE
// ==========================================
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Meesho Application Server Active on Port: ${PORT}`);
    console.log(`📂 Serving Front-End elements directly from working folder`);
    console.log(`🔗 Access the app at: http://localhost:${PORT}`);
    console.log(`====================================================`);
});