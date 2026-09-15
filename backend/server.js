const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const root = path.resolve(__dirname, '..', 'cake');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const safeName = path.basename(file.originalname, extension).replace(/[^a-z0-9-_]/gi, '-').replace(/-+/g, '-').slice(0, 50);
      cb(null, `${Date.now()}-${safeName || 'image'}${extension}`);
    }
  }),
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)),
  limits: { files: 12, fileSize: 8 * 1024 * 1024 }
});

app.post('/api/uploads', upload.array('images', 12), (req, res) => {
  res.json({ urls: req.files.map(file => `/uploads/${file.filename}`) });
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(orders);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'orders unavailable' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, category, note } = req.body || {};
    if (!customerName || !phone) return res.status(400).json({ error: 'name and phone are required' });
    const order = await prisma.order.create({ data: {
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      category: category ? String(category).trim() : null,
      note: note ? String(note).trim() : null
    }});
    res.status(201).json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'order failed' });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const status = ['new', 'contacted', 'completed', 'cancelled'].includes(req.body.status) ? req.body.status : null;
    if (!status) return res.status(400).json({ error: 'invalid status' });
    const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status } });
    res.json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'order update failed' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'order delete failed' });
  }
});

// API: list products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    // convert stored JSON strings to arrays
    const out = products.map(p => ({
      ...p,
      categories: typeof p.categories === 'string' ? JSON.parse(p.categories || '[]') : (p.categories || []),
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || [])
    }));
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// API: sync full product list (admin posts full array)
app.post('/api/products/sync', async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    for (const it of items) {
      const data = {
        name: it.name || 'Untitled',
        description: it.description || '',
        price: it.price || '',
        originalPrice: it.originalPrice || null,
        categories: JSON.stringify(it.categories || []),
        images: JSON.stringify(it.images || []),
        mainImage: it.mainImage || null,
      };
      if (it.id) {
        // upsert by id
        await prisma.product.upsert({
          where: { id: Number(it.id) },
          update: data,
          create: { ...data, id: Number(it.id) }
        });
      } else {
        await prisma.product.create({ data });
      }
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'sync failed' });
  }
});

// Create
app.post('/api/products', async (req, res) => {
  try {
    const it = req.body;
    const created = await prisma.product.create({
      data: {
        name: it.name || 'Untitled',
        description: it.description || '',
        price: it.price || '',
        originalPrice: it.originalPrice || null,
        categories: JSON.stringify(it.categories || []),
        images: JSON.stringify(it.images || []),
        mainImage: it.mainImage || null,
      }
    });
    res.json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'create failed' });
  }
});

// Update
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const it = req.body;
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: it.name,
        description: it.description,
        price: it.price,
        originalPrice: it.originalPrice || null,
        categories: typeof it.categories === 'string' ? it.categories : JSON.stringify(it.categories || []),
        images: typeof it.images === 'string' ? it.images : JSON.stringify(it.images || []),
        mainImage: it.mainImage || null,
      }
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'update failed' });
  }
});

// Partial update (PATCH) - updates only provided fields
app.patch('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const it = req.body || {};
    const data = {};
    if ('name' in it) data.name = it.name;
    if ('description' in it) data.description = it.description;
    if ('price' in it) data.price = it.price;
    if ('originalPrice' in it) data.originalPrice = it.originalPrice;
    if ('categories' in it) data.categories = typeof it.categories === 'string' ? it.categories : JSON.stringify(it.categories || []);
    if ('images' in it) data.images = typeof it.images === 'string' ? it.images : JSON.stringify(it.images || []);
    if ('mainImage' in it) data.mainImage = it.mainImage;

    const updated = await prisma.product.update({ where: { id }, data });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'patch failed' });
  }
});

// Upsert single item: create or update by `id` if provided
app.post('/api/products/upsert', async (req, res) => {
  try {
    const it = req.body || {};
    const data = {
      name: it.name || 'Untitled',
      description: it.description || '',
      price: it.price || '',
      originalPrice: it.originalPrice || null,
      categories: JSON.stringify(it.categories || []),
      images: JSON.stringify(it.images || []),
      mainImage: it.mainImage || null,
    };

    if (it.id) {
      const id = Number(it.id);
      const up = await prisma.product.upsert({
        where: { id },
        update: data,
        create: { ...data, id }
      });
      res.json(up);
    } else {
      const created = await prisma.product.create({ data });
      res.json(created);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'upsert failed' });
  }
});

// Batch upsert — accepts array of items
app.post('/api/products/batch-upsert', async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    const results = [];
    for (const it of items) {
      const data = {
        name: it.name || 'Untitled',
        description: it.description || '',
        price: it.price || '',
        originalPrice: it.originalPrice || null,
        categories: JSON.stringify(it.categories || []),
        images: JSON.stringify(it.images || []),
        mainImage: it.mainImage || null,
      };
      if (it.id) {
        const id = Number(it.id);
        const up = await prisma.product.upsert({ where: { id }, update: data, create: { ...data, id } });
        results.push(up);
      } else {
        const c = await prisma.product.create({ data });
        results.push(c);
      }
    }
    res.json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'batch upsert failed' });
  }
});

// Delete
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'delete failed' });
  }
});

// Serve static frontend files from the application root
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(root));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
