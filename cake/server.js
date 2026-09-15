const express = require('express');
const cors = require('cors');
const path = require('path');
const root = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

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
    if ('categories' in it) data.categories = it.categories;
    if ('images' in it) data.images = it.images;
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
app.use(express.static(root));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
