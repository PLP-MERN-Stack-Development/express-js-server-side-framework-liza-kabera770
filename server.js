// server.js
const express = require("express");
const app = express();

// ====== MIDDLEWARES ======

// Logger middleware
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
});

// JSON body parser
app.use(express.json());

// Authentication middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["apikey"];
  if (!apiKey || apiKey !== "12345") {
    return res.status(401).json({ error: "Unauthorized - API key required" });
  }
  next();
};

// ====== CUSTOM ERROR CLASSES ======
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.status = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

// ====== PRODUCT DATA ======
let products = [
  { id: 1, name: "Laptop", description: "A powerful laptop", price: 1200, category: "Electronics", instock: true },
  { id: 2, name: "Shoes", description: "Comfortable running shoes", price: 80, category: "Fashion", instock: false },
  { id: 3, name: "Phone", description: "Smartphone with 5G", price: 900, category: "Electronics", instock: true }
];

// ====== BASIC ROUTE ======
app.get("/", (req, res) => {
  res.send("Hello World from Express API");
});

// ====== TASK 2: RESTful API ROUTES (Protected by API Key) ======
app.get("/api/products", apiKeyAuth, (req, res) => {
  let result = [...products];

  // Filtering
  if (req.query.category) {
    result = result.filter(p => p.category.toLowerCase() === req.query.category.toLowerCase());
  }

  // Search
  if (req.query.search) {
    result = result.filter(p => p.name.toLowerCase().includes(req.query.search.toLowerCase()));
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || result.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = result.slice(start, end);

  res.json({ page, limit, total: result.length, data: paginated });
});

// Get product by ID
app.get("/api/products/:id", apiKeyAuth, (req, res, next) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return next(new NotFoundError("Product not found"));
  res.json(product);
});

// Create product
app.post("/api/products", apiKeyAuth, (req, res, next) => {
  const { name, description, price, category, instock } = req.body;
  if (!name || !price) return next(new ValidationError("Name and price are required"));

  const newProduct = {
    id: products.length + 1,
    name,
    description,
    price,
    category,
    instock
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update product
app.put("/api/products/:id", apiKeyAuth, (req, res, next) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return next(new NotFoundError("Product not found"));

  const { name, description, price, category, instock } = req.body;
  if (!name || !price) return next(new ValidationError("Name and price are required"));

  product.name = name;
  product.description = description;
  product.price = price;
  product.category = category;
  product.instock = instock;

  res.json(product);
});

// Delete product
app.delete("/api/products/:id", apiKeyAuth, (req, res, next) => {
  const index = products.findIndex(p => p.id == req.params.id);
  if (index === -1) return next(new NotFoundError("Product not found"));

  const deleted = products.splice(index, 1);
  res.json({ message: "Product deleted", deleted });
});

// ====== PRODUCT STATISTICS ======
app.get("/api/products/stats", apiKeyAuth, (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json({ totalProducts: products.length, stats });
});

// ====== GLOBAL ERROR HANDLER ======
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// ====== START SERVER ======
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});