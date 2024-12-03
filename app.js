import express from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
dotenv.config()


import {
    getMembers,
    getMember,
    createMember,
    deleteMember,
    allCount,
    allAdmin,
    updateMember
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
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    res.render('partials/home', { user, layout: false });
  } else {
    res.render('test.ejs', { user });
  }
});

app.get('/dashboard', ensureAdmin, async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    try {
        const count = await allCount();
        const admin = await allAdmin();
        const users = await getMembers();

        res.render('partials/dashboard', {
            user: req.session.user,
            users: users,
            allCount: function() {
                return count;
            },
            allAdmin: function() {
                return admin;
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

app.get('/services', (req, res) => {
  const user = req.session.user;
  res.render('partials/services', { user, layout: false });
});

app.get('/account', (req, res) => {
  const user = req.session.user;
  res.render('partials/account', { user, layout: false });
});

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
    req.session.user = { 
        name: member.name,
        email: member.email 
    };
    res.redirect('/'); // Redirect to the home page after successful registration
});
app.post('/delete', async (req, res) => {
    const { id } = req.body;
    await deleteMember(id);
    res.redirect('/dashboard');
});

app.post('/login', async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await getMember(name, password);
        if (!user) {
            return res.render('log_in.ejs', { error: 'Invalid username or password' });
        }
        req.session.user = { 
            name: user.name, 
            is_admin: user.is_admin,
            email: user.email 
        };
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('log_in.ejs', { error: 'Internal Server Error' });
    }
});

app.delete('/delete/:id', ensureAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Attempting to delete user:', id); // Debug log
        
        const result = await deleteMember(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
});

app.put('/update/:id', ensureAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const result = await updateMember(id, req.body);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
});
app.get("/search", async (req, res) => {
    const query = req.query.query;
    try {
        const results = await Database.find({
            name: { $regex: query, $options: "i" }, // Adjust based on your database
        }).limit(10);
        res.json(results);
    } catch (error) {
        console.error("Error querying database:", error);
        res.status(500).json({ error: "Internal Server Error" });
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