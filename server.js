// server.js

const express = require('express');
const path = require('path');

const app = express();
// Middleware to parse JSON request bodies
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, 'src')));

// Route to handle login requests
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Placeholder logic for authentication
    if (username === 'admin' && password === 'password') {
        res.json({ success: true, message: 'Login successful!' });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// Basic route to handle API requests
app.get('/api', (req, res) => {
    res.json({ message: 'API endpoint placeholder' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
