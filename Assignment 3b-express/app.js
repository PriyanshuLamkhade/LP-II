
// File: app.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Sample data - in a real app, you would use a database
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
];

// Routes

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the User Management API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      userById: '/api/users/:id',
      documentation: '/api/docs'
    }
  });
});

// GET all users
app.get('/api/users', (req, res) => {
  // Query parameter for filtering
  const role = req.query.role;
  
  if (role) {
    const filteredUsers = users.filter(user => user.role === role);
    return res.json(filteredUsers);
  }
  
  res.json(users);
});

// GET user by ID
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// POST create new user
app.post('/api/users', (req, res) => {
  const { name, email, role } = req.body;
  
  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  
  // Create new user
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email,
    role: role || 'user' // Default role is 'user'
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT update user
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, role } = req.body;
  
  // Find user index
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  // Check if email already exists (excluding current user)
  if (users.some(user => user.email === email && user.id !== id)) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  
  // Update user
  const updatedUser = {
    id,
    name,
    email,
    role: role || users[userIndex].role
  };
  
  users[userIndex] = updatedUser;
  res.json(updatedUser);
});

// PATCH partial update
app.patch('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  
  // Find user index
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // If email is being updated, check for duplicates
  if (updates.email && updates.email !== users[userIndex].email) {
    if (users.some(user => user.email === updates.email && user.id !== id)) {
      return res.status(409).json({ error: 'Email already in use' });
    }
  }
  
  // Update user (partial)
  users[userIndex] = { ...users[userIndex], ...updates };
  res.json(users[userIndex]);
});

// DELETE user
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Remove user
  const deletedUser = users[userIndex];
  users = users.filter(u => u.id !== id);
  
  res.json({ message: 'User deleted successfully', user: deletedUser });
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    apiName: 'User Management API',
    version: '1.0.0',
    endpoints: [
      { 
        path: '/api/users',
        methods: {
          GET: 'Get all users. Can filter by role using ?role=admin or ?role=user',
          POST: 'Create a new user. Required fields: name, email'
        }
      },
      {
        path: '/api/users/:id',
        parameters: {
          id: 'User ID (number)'
        },
        methods: {
          GET: 'Get a single user by ID',
          PUT: 'Update all user fields. Required: name, email',
          PATCH: 'Partially update a user',
          DELETE: 'Delete a user'
        }
      }
    ]
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

module.exports = app; // For testing purposes