import express from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
dotenv.config()


import {
    getMembers,
    getMember,
    createMember,
    deleteMember
} from './database.js'

import { ensureAdmin } from './middleware/authMiddleware.js';

const app = express()

app.use(
  session({
    secret: process.env.SECRET_KEY, // Replace with a secure key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set `true` if using HTTPS
  })
);

app.use(express.urlencoded({ extended: true })) // Use express.urlencoded() instead of express.json()
app.set("view engine","ejs")

app.get('/', (req, res) => {
  const user = req.session.user;
  res.render('test.ejs', { user, page: 'home' });
});

// app.get('/dashboard', ensureAdmin, (req, res) => {
//   const user = req.session.user;
//   res.render('dashboard.ejs', { user, page: 'dashboard' });
// });

// app.get('/services', (req, res) => {
//   const user = req.session.user;
//   res.render('services.ejs', { user, page: 'services' });
// });

// app.get('/account', (req, res) => {
//   const user = req.session.user;
//   res.render('account.ejs', { user, page: 'account' });
// });

app.get('/register', (req, res) => {
    res.render('register.ejs');
});
app.get('/login', (req, res) => {
    res.render('log_in.ejs');
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error(err);
        res.send("Error logging out");
      } else {
        res.redirect('/');
      }
    });
});

app.post('/register', async (req, res) => {
    const { name, age, gender, address, phone_number, email, password} = req.body;
    const member = await createMember(name, age, gender, address, phone_number, email, password);
    req.session.user = { name: member.name };
    res.redirect('/'); // Redirect to the home page after successful registration
});

app.post('/login', async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await getMember(name, password);
        if (!user) {
            return res.render('log_in.ejs', { error: 'Invalid username or password' });
        }
        req.session.user = { name: user.name, is_admin: user.is_admin };  // Include `is_admin` in the session
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('log_in.ejs', { error: 'Internal Server Error' });
    }
});

app.use(express.static("public"))
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(8080, () => {
    console.log('Server is running on port 8080')
})