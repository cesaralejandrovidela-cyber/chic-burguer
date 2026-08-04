// Chic Burger Backend Server - Rest API for Nile Postgres
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for all domains so Cloudflare frontend can connect securely
app.use(cors());

// Increase request size limit to handle large Base64 flyer canvas image uploads
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ limit: '12mb', extended: true }));

// Database connection using Nile PostgreSQL URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("CRITICAL ERROR: DATABASE_URL environment variable is missing.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false // Required for serverless Postgres providers (like Nile, Neon, Supabase)
    }
});

// Seed data array (matches the provided menu flyers)
const SEED_PRODUCTS = [
    {
        id: 1,
        name: "Hamburguesa Simple",
        category: "hamburguesas",
        price: 7000,
        description: "Carne vacuna casera, lechuga, tomate, jamón, queso y huevo. ¡Todas las hamburguesas van con papas!",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60",
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
        allowPromo: true,
        promo2xPrice: 12000
    },
    {
        id: 2,
        name: "Hamburguesa Simple con Cheddar",
        category: "hamburguesas",
        price: 8000,
        description: "Carne vacuna casera, queso cheddar, lechuga, tomate y huevo. ¡Todas las hamburguesas van con papas!",
        imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop&q=60",
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
        allowPromo: true,
        promo2xPrice: 14000
    },
    {
        id: 3,
        name: "Hamburguesa Doble",
        category: "hamburguesas",
        price: 8500,
        description: "Doble carne vacuna casera, lechuga, tomate, jamón, queso y huevo. ¡Todas las hamburguesas van con papas!",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60",
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
        allowPromo: true,
        promo2xPrice: 16000
    },
    {
        id: 4,
        name: "Hamburguesa Doble con Cheddar",
        category: "hamburguesas",
        price: 9000,
        description: "Doble carne vacuna casera, queso cheddar, lechuga, tomate y huevo. ¡Todas las hamburguesas van con papas!",
        imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=60",
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
        allowPromo: true,
        promo2xPrice: 17000
    },
    {
        id: 5,
        name: "Hamburguesa Triple Simple",
        category: "hamburguesas",
        price: 10000,
        description: "Triple carne vacuna casera, lechuga, tomate, jamón, queso y huevo. ¡Todas las hamburguesas van con papas!",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60",
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
        allowPromo: true,
        promo2xPrice: 18000
    },
    {
        id: 6,
        name: "Hamburguesa Triple con Cheddar",
        category: "hamburguesas",
        price: 10500,
        description: "Triple carne vacuna casera, queso cheddar, lechuga, tomate y huevo. ¡Todas las hamburguesas van con papas!",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60",
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
        allowPromo: true,
        promo2xPrice: 18500
    },
    {
        id: 7,
        name: "Lata de Coca",
        category: "bebidas",
        price: 2500,
        description: "Lata de Coca-Cola original de 354ml helada.",
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=60",
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

// Initialize DB schema & seed initial values if empty
async function initDatabase() {
    try {
        const client = await pool.connect();
        console.log("Connected to Nile PostgreSQL Database successfully.");
        
        // Create table query
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id BIGINT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(50) NOT NULL,
                price INT NOT NULL,
                description TEXT,
                image_url TEXT,
                active BOOLEAN DEFAULT TRUE,
                allow_sizes BOOLEAN DEFAULT FALSE,
                price_mediano INT DEFAULT 1500,
                price_grande INT DEFAULT 3000,
                allow_combos BOOLEAN DEFAULT FALSE,
                price_combo INT DEFAULT 3500,
                allow_extras BOOLEAN DEFAULT FALSE,
                price_extra_papas INT DEFAULT 1200,
                price_extra_queso INT DEFAULT 800,
                price_extra_bebida INT DEFAULT 1500,
                allow_promo BOOLEAN DEFAULT FALSE,
                promo_2x_price INT
            );
        `);
        console.log("PostgreSQL 'products' table verified/created.");

        // Check if database is empty to seed initial menu items
        const res = await client.query('SELECT COUNT(*) FROM products');
        const count = parseInt(res.rows[0].count);
        
        if (count === 0) {
            console.log("Database is empty. Seeding initial menu products...");
            for (const p of SEED_PRODUCTS) {
                await client.query(`
                    INSERT INTO products (
                        id, name, category, price, description, image_url, active,
                        allow_sizes, price_mediano, price_grande,
                        allow_combos, price_combo,
                        allow_extras, price_extra_papas, price_extra_queso, price_extra_bebida,
                        allow_promo, promo_2x_price
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                `, [
                    p.id, p.name, p.category, p.price, p.description, p.imageUrl, p.active,
                    p.allowSizes, p.priceMediano, p.priceGrande,
                    p.allowCombos, p.priceCombo,
                    p.allowExtras, p.priceExtraPapas, p.priceExtraQueso, p.priceExtraBebida,
                    p.allowPromo, p.promo2xPrice
                ]);
            }
            console.log("Seeding complete. Products loaded to Nile DB.");
        }
        
        client.release();
    } catch (err) {
        console.error("Database connection/init error:", err);
    }
}

// Initialize
initDatabase();

// ================= REST API ROUTES =================

// GET /api/products - Retrieve all products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY category, id');
        // Map postgres snake_case back to camelCase for the frontend app.js
        const mappedProducts = result.rows.map(row => ({
            id: parseInt(row.id),
            name: row.name,
            category: row.category,
            price: row.price,
            description: row.description,
            imageUrl: row.image_url,
            active: row.active,
            allowSizes: row.allow_sizes,
            priceMediano: row.price_mediano,
            priceGrande: row.price_grande,
            allowCombos: row.allow_combos,
            priceCombo: row.price_combo,
            allowExtras: row.allow_extras,
            priceExtraPapas: row.price_extra_papas,
            priceExtraQueso: row.price_extra_queso,
            priceExtraBebida: row.price_extra_bebida,
            allowPromo: row.allow_promo,
            promo2xPrice: row.promo_2x_price
        }));
        
        res.json(mappedProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database read error." });
    }
});

// POST /api/products - Upsert (Insert or Update) a product
app.post('/api/products', async (req, res) => {
    const p = req.body;
    
    // Simple validation
    if (!p.name || !p.category || !p.price) {
        return res.status(400).json({ error: "Missing required product fields (name, category, price)." });
    }

    try {
        const id = p.id ? parseInt(p.id) : Date.now();
        const active = p.active !== undefined ? p.active : true;
        
        const query = `
            INSERT INTO products (
                id, name, category, price, description, image_url, active,
                allow_sizes, price_mediano, price_grande,
                allow_combos, price_combo,
                allow_extras, price_extra_papas, price_extra_queso, price_extra_bebida,
                allow_promo, promo_2x_price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                category = EXCLUDED.category,
                price = EXCLUDED.price,
                description = EXCLUDED.description,
                image_url = EXCLUDED.image_url,
                active = EXCLUDED.active,
                allow_sizes = EXCLUDED.allow_sizes,
                price_mediano = EXCLUDED.price_mediano,
                price_grande = EXCLUDED.price_grande,
                allow_combos = EXCLUDED.allow_combos,
                price_combo = EXCLUDED.price_combo,
                allow_extras = EXCLUDED.allow_extras,
                price_extra_papas = EXCLUDED.price_extra_papas,
                price_extra_queso = EXCLUDED.price_extra_queso,
                price_extra_bebida = EXCLUDED.price_extra_bebida,
                allow_promo = EXCLUDED.allow_promo,
                promo_2x_price = EXCLUDED.promo_2x_price
            RETURNING *;
        `;
        
        const values = [
            id, p.name, p.category, p.price, p.description || '', p.imageUrl || '', active,
            !!p.allowSizes, p.priceMediano || 0, p.priceGrande || 0,
            !!p.allowCombos, p.priceCombo || 0,
            !!p.allowExtras, p.priceExtraPapas || 0, p.priceExtraQueso || 0, p.priceExtraBebida || 0,
            !!p.allowPromo, p.promo2xPrice || 0
        ];
        
        const result = await pool.query(query, values);
        res.status(200).json({ success: true, product: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database upsert error." });
    }
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID." });
    }
    
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ success: true, message: `Product ${id} deleted.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database delete error." });
    }
});

// POST /api/products/toggle/:id - Toggle active/paused state
app.post('/api/products/toggle/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID." });
    }
    
    try {
        const result = await pool.query('UPDATE products SET active = NOT active WHERE id = $1 RETURNING active', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found." });
        }
        res.json({ success: true, active: result.rows[0].active });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database toggle error." });
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
