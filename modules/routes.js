// Import the required modules
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

// Create a new SQLite database connection
const db = new sqlite3.Database('./data/database.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the database.');
});

// Define the route handlers
function index(req, res) {
  res.render('index', { user: req.session.user });
}

function chat(req, res, next) {
  isAuthenticated(req, res, () => {
    res.render('chat', { user: req.session.user });
  });
}

function home(req, res) {
  res.render('home', { user: req.session.user });
}

function game(req, res) {
  res.render('game')
}

function login(req, res) {
  res.render('login');
}

function logout(req, res) {
  req.session.destroy();
  res.redirect('/')

}

// Function to handle login and registration
function postLogin(req, res) {
  if (req.body.user && req.body.pass) { //If there's a username and password
    const crypto = require('crypto');
    const { username } = req.body.user
    db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
      if (err) {
        console.error(err);
        res.send("There wan an error:\n" + err)
      } else if (!row) {

        //create new salt for this user
        const salt = crypto.randomBytes(16).toString('hex')

        //use salt to "hash" password
        crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
          if (err) {
            res.setDefaultEncoding("Error hashing password: " + err)
          } else {
            const hashedPassword = derivedKey.toString('hex')
            db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPassword, salt], (err) => {
              if (err) {
                res.send("Database errpr:\n" + err)
              } else {
                res.redirect('/home')

              }
            })
          }
        })

      } else {
        //Compare stored password with provided password
        crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
          if (err) {
            res.send("Error hashing password: " + err)
          } else {
            const hashedPassword = derivedKey.toString('hex')

            if (row.password === hashedPassword) {
              req.session.user = req.body.user
              res.redirect("/home")
            } else {
              res.send("Incorrect Password")
            }
          }
        })
      }
    })

  } else {
    res.send("You need a username and password");
  }
}

function isAuthenticated(req, res, next) {
  if (req.session.user) next()
  else res.redirect('/login')
}

// Export the route handlers
module.exports = {
  index,
  chat,
  login,
  postLogin,
  isAuthenticated,
  home,
  game,
  logout
}