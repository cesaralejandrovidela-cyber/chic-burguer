const { Pool } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("DATABASE_URL environment variable is missing.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

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

async function wipeAndSeed() {
    try {
        const client = await pool.connect();
        console.log("Connected to Nile Postgres. Wiping existing products...");
        
        // 1. Wipe all products
        await client.query("TRUNCATE TABLE products;");
        console.log("Table 'products' truncated successfully.");
        
        // 2. Insert new SEED_PRODUCTS
        console.log("Seeding new flyer menu products...");
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
            console.log(`- Seeded: ${p.name}`);
        }
        
        console.log("Wipe and seed process completed successfully.");
        client.release();
    } catch (err) {
        console.error("Wipe and seed error:", err);
    } finally {
        await pool.end();
    }
}

wipeAndSeed();
