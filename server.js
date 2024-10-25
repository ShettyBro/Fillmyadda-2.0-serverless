const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Generate a secure secret key
const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};

// Replace with a secure secret key
const JWT_SECRET = generateSecretKey();

// MySQL database configuration
const dbConfig = {
    host: 'localhost', // Change this to your MySQL server host
    user: 'your-mysql-username',
    password: 'your-mysql-password',
    database: 'Filmyadda'
};

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MySQL database
let pool;
mysql.createPool(dbConfig).then(p => {
    pool = p;
    console.log('Connected to MySQL database');
}).catch(err => {
    console.error('Database Connection Error:', err);
});

// Registration route
app.post('/register', async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if (!fullname || !email || !username || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Check if the username, fullname, or email already exists
        const [existingUser] = await pool.query('SELECT * FROM Users WHERE username = ? OR fullname = ? OR email = ?', [username, fullname, email]);

        if (existingUser.length > 0) {
            return res.status(409).send('Username, fullname, or email already exists. Please use different credentials.');
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user data
        await pool.query('INSERT INTO Users (username, password, fullname, email) VALUES (?, ?, ?, ?)', [username, hashedPassword, fullname, email]);

        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).send('Error registering user');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const [userResult] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);

        if (userResult.length > 0) {
            const user = userResult[0];

            // Compare the password with the stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // Generate JWT token
                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    JWT_SECRET,
                    { expiresIn: '5h' }
                );

                return res.status(200).json({ message: 'Login successful', token });
            } else {
                return res.status(401).send('Invalid username or password');
            }
        } else {
            return res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).send('Error during login');
    }
});

// Middleware to verify token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).send('Access Denied: No Token Provided');

    try {
        const verified = jwt.verify(token.split(' ')[1], JWT_SECRET); // 'Bearer <token>'
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).send('Invalid Token');
    }
}

// Example protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});

// Route to get video details by movie ID
app.post('/getVideoDetails', async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Movie ID is required' });
    }

    try {
        const [result] = await pool.query('SELECT title, source FROM movies WHERE id = ?', [id]);

        if (result.length > 0) {
            return res.json(result[0]);
        } else {
            return res.status(404).json({ error: 'Movie not found' });
        }
    } catch (err) {
        console.error('Error fetching video details:', err);
        return res.status(500).json({ error: 'Database query error' });
    }
});

// Fetch movie details by ID
app.get('/movies/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        const [result] = await pool.query('SELECT title, source FROM movies WHERE id = ?', [movieId]);

        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (err) {
        console.error('Error fetching movie details:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
