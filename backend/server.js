const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database('./contactlistdb.sqlite');

db.serialize(() => {
    // Create the contacts table
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        middleName TEXT,
        lastName TEXT,
        email TEXT,
        phone1 TEXT,
        phone2 TEXT,
        address TEXT,
        isDeleted INTEGER DEFAULT 0
      )
    `);
  });


  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT
      )
    `);
  });
  

// Get all contacts (with pagination)
app.get('/api/contacts', (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
  
    const query = `
      SELECT id, firstName, middleName, lastName, email, phone1, phone2, address
      FROM contacts
      WHERE isDeleted = 0
      ORDER BY firstName, lastName
      LIMIT ${pageSize} OFFSET ${offset}
    `;
  
    db.all(query, (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
        console.log(rows);
      res.json(rows);
    });
  });
// Get a specific contact by ID
app.get('/api/contacts/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT * FROM contacts
    WHERE id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json(row);
  });
});



app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    console.log("entered");
  
    // Check if the username already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, existingUser) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (existingUser) {
        // Username already exists
        res.status(400).json({ error: 'Username already taken' });
        return;
      }
  
      // Create a new user
      const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.run(query, [username, password], function (err) {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
  
        res.json({ id: this.lastID, username });
      });
    });
  });
// Add a new contact
app.post('/api/contacts', (req, res) => {
    const { firstName, middleName, lastName, email, phone1, phone2, address } = req.body;
  
    const query = `
      INSERT INTO contacts (firstName, middleName, lastName, email, phone1, phone2, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
  
    db.run(query, [firstName, middleName, lastName, email, phone1, phone2, address], function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      res.json({ id: this.lastID });
    });
  });

// Update an existing contact
app.put('/api/contacts/:id', (req, res) => {
    console.log("updating")
    const { id } = req.params;
    const { firstName, middleName, lastName, email, phone1, phone2, address } = req.body;
  
    const query = `
      UPDATE contacts
      SET firstName = ?, middleName = ?, lastName = ?, email = ?, phone1 = ?, phone2 = ?, address = ?
      WHERE id = ?
    `;
  
    db.run(query, [firstName, middleName, lastName, email, phone1, phone2, address, id], function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (this.changes === 0) {
        res.status(404).json({ error: 'Contact not found' });
        return;
      }
  
      res.json({ message: 'Contact updated successfully' });
    });
  });

// Soft delete a contact
app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE contacts
    SET isDeleted = 1
    WHERE id = ?
  `;

  db.run(query, [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json({ message: 'Contact soft deleted successfully' });
  });
});

// Search contacts by any field
app.get('/api/search', (req, res) => {
    const { query } = req.query;
  
    const searchQuery = `
      SELECT id, firstName, middleName, lastName, email, phone1, phone2, address
      FROM contacts
      WHERE isDeleted = 0
        AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phone1 LIKE ? OR phone2 LIKE ? OR address LIKE ?)
      ORDER BY firstName, lastName
    `;
  
    db.all(
      searchQuery,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`],
      (err, rows) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
  
        res.json(rows);
      }
    );
  });
  


  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username and password match a user in the database
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.get(query, [username, password], (err, user) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (user) {
        // User found, send a success response
        res.json({ success: true, message: 'Login successful', redirect: '/' });
      } else {
        // User not found or incorrect password, send an error response
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    });
  });
  


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
