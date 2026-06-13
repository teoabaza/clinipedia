const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Single-user auth: credentials come from environment variables.
// To add more users in future, replace this with a users table.
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const validUsername = username === process.env.ADMIN_USERNAME;
  const validPassword = await bcrypt.compare(password, await bcrypt.hash(process.env.ADMIN_PASSWORD, 10))
    .then(() => password === process.env.ADMIN_PASSWORD);

  if (!validUsername || !validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

router.get('/verify', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    res.json({ username: payload.username });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
