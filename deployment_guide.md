# Guía de Despliegue Full-Stack - Catálogo Chic Burger (Nile + Render + Cloudflare)

Esta guía explica paso a paso cómo subir a Internet y publicar de forma gratuita tu catálogo, panel administrativo (en **Cloudflare Pages**), servidor backend (en **Render**) y base de datos relacional (en **Nile**).

---

## Parte 1: Base de Datos en la Nube (Nile Database)

1. Regístrate gratis en **Nile Database** ([thenile.dev](https://thenile.dev)).
2. Crea una nueva base de datos. Nómbrala `chic-burger`.
3. Ve a la sección **Settings** o **Connection Info** del panel de Nile.
4. Copia tu cadena de conexión de PostgreSQL (**Connection String** o **URI**).
   - Tendrá un formato similar a:
     `postgresql://user:password@host/dbname?sslmode=require`
5. Guarda este texto de forma segura, lo usaremos en el Paso 3.

---

## Parte 2: Servidor Backend en Render

1. Crea una cuenta gratuita en **Render** ([render.com](https://render.com)).
2. Conecta tu cuenta de GitHub a Render.
3. En el panel principal de Render, haz clic en **New +** y selecciona **Web Service** (Servicio Web).
4. Elige tu repositorio de GitHub `chic-burger`.
5. Configura el servicio web:
   - **Name:** `chic-burger-api` (o el de tu agrado).
   - **Environment:** `Node`.
   - **Root Directory:** Escribe `backend` (importante, ya que nuestro backend está en esa subcarpeta).
   - **Build Command:** `npm install`.
   - **Start Command:** `npm start`.
   - **Plan:** Selecciona el plan gratuito (**Free**).
6. Despliega la pestaña **Advanced** (Avanzado) y haz clic en **Add Environment Variable** (Agregar Variable de Entorno):
   - **Key:** `DATABASE_URL`
   - **Value:** *Pega la cadena de conexión de PostgreSQL que copiaste de Nile en la Parte 1.*
7. Haz clic en **Create Web Service**.
8. Una vez desplegado, Render te dará una URL para tu API, por ejemplo:
   `https://chic-burger-api.onrender.com`. Cópiala.

---

## Parte 3: Conectar el Frontend con Render

1. Abre el archivo local **[app.js](file:///C:/Users/CESAR-NOC/.gemini/antigravity/scratch/rotiseria-cloudflare/app.js)**.
2. En las primeras líneas de código, busca la variable `API_URL` y cambia el valor de producción por la URL que te dio Render:
   ```javascript
   const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
       ? "http://localhost:10000"
       : "https://chic-burger-api.onrender.com"; // <-- PEGA TU URL DE RENDER AQUÍ
   ```
3. Guarda los cambios.
4. Sube la actualización a tu repositorio de GitHub (`git add .`, `git commit` y `git push`).

---

## Parte 4: Desplegar el Catálogo en Cloudflare Pages

El frontend es estático y se aloja en Cloudflare de forma gratuita.

1. Inicia sesión en **Cloudflare** ([dash.cloudflare.com](https://dash.cloudflare.com)).
2. Ve a la sección **Workers & Pages** -> **Create** -> **Pages**.
3. Presiona el botón **Connect to Git** y selecciona tu repositorio `chic-burger`.
4. En los ajustes de construcción (**Build settings**):
   - **Project name:** `chic-burger` (este nombre definirá tu dominio, ej: `chic-burger.pages.dev`).
   - **Production branch:** `main`.
   - **Framework preset:** Selecciona **None** o **Static HTML**.
   - **Build command:** Deja este campo vacío.
   - **Build output directory:** Deja este campo vacío o coloca un punto `.` (esto indica la raíz, donde están index.html y catalogo.html).
5. Haz clic en **Save and Deploy**.

---

## Paso 5: ¡Tu Sistema Completo Está Listo!

Una vez finalizado:
- **Tu Catálogo de Ventas:** Estará en `https://chic-burger.pages.dev/catalogo` (los clientes podrán ver la comida y hacer pedidos).
- **Tu Consola de Gestión:** Estará en `https://chic-burger.pages.dev/` (accedes con usuario `admin` y contraseña `chicburger2026`).
- **Tus Fotos y Precios:** Se guardarán permanentemente en la base de datos PostgreSQL de Nile, incluso si el cliente borra las cookies o el caché de su dispositivo.
