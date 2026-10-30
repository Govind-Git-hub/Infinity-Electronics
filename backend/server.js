require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();

connectDB();



app.use(helmet());
app.disable('x-powered-by'); // or helmet handles related headers
app.use(compression());

const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Allow non-browser tools (Postman) — no Origin header
            if (!origin) {
                return callback(null, true);
            }

            // Dev: allow any origin (phone on LAN, etc.)
            if (isDev) {
                return callback(null, true);
            }

            // Prod: only listed FRONTEND_URL values
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // return callback(new Error('Not allowed by CORS'));
            return callback(null, false);
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '2mb' }));

// trust proxy : only when your production deployment actually uses a reverse proxy such as Nginx.
if (process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
}

// rate limiters
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,                 // per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, try again later.' },
});
app.use('/api', globalLimiter);

app.get('/', (req, res) => {
    res.send('Infinity Electronics API is running');
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts, try again later.',
    },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`
    );
});