const express = require('express');
const app = express(); app.set('view engine', 'ejs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const routes = require('./modules/routes');
const PORT = 3000;

const sessionMiddleware = session({
    store: new SQLiteStore(),
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
    cookie: {secure:false} 
});

app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', routes.index);
app.get('/chat', routes.chat);
app.get('/login', routes.login);
app.post('/login', routes.postLogin);
app.get('/home', routes.home)


app.listen(PORT, () => {});


