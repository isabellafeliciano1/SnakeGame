// Import the required modules
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const AUTH_URL = 'https://formbeta.yorktechapps.com'; // ... or the address to the instance of fbjs you wish to connect to
const THIS_URL = 'http://localhost:3000/login'; // ... or whatever the address to your application is
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY----- 
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArY7ATw0h8nGw97RGNyQu 
CjknRHvTejTfWsRX4gSCZg1WSptruk1l0LtYh3P+lA/ux2vDu50fzzub0+t97Ssl 
q2VCi+q25uEN5KUFX7hxxmwFvK/5GqsJ/NoM8LQXycnGVtaWZATaE58vLbdZ/nQK 
bPiqZ8GOKcvRbPVK9z/QMvuB6E6NOq9bRioQZeESDZP9uxiqQ7DT/1M275pFCcE3 
DYrw1aoRqQ9R9YrglsSAXuQcYphKr6O0b0OouokyUex/AyWa/GGQl8Ws1XIe2WZG 
UJV29AyzGGU1mSFJV563+N4o0cF/6tCUiy/mikPBVW08mUkPg9qjy/yd5cLChBi8 
ZwIDAQAB 
-----END PUBLIC KEY----- `


// Create a new SQLite database connection
// User database
const db = new sqlite3.Database('./data/database.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the database.');
});

const hdb = new sqlite3.Database('./data/highScore.db', (err) => {
  if (err) {
    console.error('Error making db:', err.message);
  } else {
    //Remember to get these from DBsqlite when performing a command to the db
    hdb.run(`CREATE TABLE IF NOT EXISTS scores (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Error:', err.message);
      }
    });
  }
})

// Define the route handlers
function index(req, res) {
  res.render('home')
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
  console.log(req.query.token)
  if (req.query.token) {
    let tokenData = jwt.verify(req.query.token, PUBLIC_KEY, { algorithms: ['RS256'] })
    req.session.token = tokenData
    req.session.user = tokenData.username
    res.redirect('/')
  } else {
    res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
  }
}

function logout(req, res) {
  req.session.destroy();
  res.redirect('/')

}

function highScore(req, res) {
  hdb.all("SELECT * FROM scores ORDER BY score DESC LIMIT 10", [], (err, rows) => {
    res.render('highScore', { scores: rows });
  });
}

function posthighScore(req, res) {
  var score = req.body.score;
  var name = req.session.user; // Get username from session

  if (!name) {
    name = 'anonymous';
  }

  hdb.run(`INSERT INTO scores (name, score) VALUES (?, ?)`, [name, score], (err) => {
    if (err) {
      console.error('Error inserting score:', err);
      res.status(500).send('Error saving score');
    } else {
      res.redirect('/highScore');
    }
  });
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
  highScore,
  posthighScore,
  logout
}