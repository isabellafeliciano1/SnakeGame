// Install the required packages using npm:
const express = require('express');
const app = express(); app.set('view engine', 'ejs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const routes = require('./modules/routes');
const PORT = 3000;

// Create a session middleware with the SQLiteStore
const sessionMiddleware = session({
    store: new SQLiteStore(),
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});

// Set the view engine to EJS
app.use(session({
    secret: 'Wuthering',
    resave: false,
    saveUninitialized: false
}));

app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Define routes
app.get('/', routes.isAuthenticated, routes.index);
app.get('/chat', routes.chat);
app.get('/login', routes.login);
app.post('/login', routes.postLogin);
app.get('/home', routes.home)
app.get('/game', routes.game)
app.get('/highScore', routes.highScore)
app.post('/highScore', routes.posthighScore)
app.get('/logout', routes.logout)


// Start the server
app.listen(PORT, () => { });