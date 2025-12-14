const db = require("./db")
const jwt = require("jsonwebtoken")


const express = require("express")
const cors = require("cors")
const JWT_SECRET = "MY_SECRET_KEY"
const authenticateToken = require("./middleware/auth")


// 🔴 IMPORTANT: database must be required BEFORE app.listen

console.log("server.js loaded")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
 const bcrypt = require("bcrypt")

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const query = `
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `

  db.run(query, [name, email, hashedPassword], function (err) {
    if (err) {
      return res.status(400).json({ message: "User already exists" })
    }

    res.json({ message: "User registered successfully" })
  })
})

})

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})


app.post("/login", (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" })
  }

  const query = `SELECT * FROM users WHERE email = ?`

  db.get(query, [email], async (err, user) => {
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({
      message: "Login successful",
      token: token
    })
  })
})


app.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.userId
  })
})



// CREATE TASK
app.post("/tasks", authenticateToken, (req, res) => {
  const { title } = req.body

  if (!title) {
    return res.status(400).json({ message: "Task title required" })
  }

  const query = `
    INSERT INTO tasks (title, user_id)
    VALUES (?, ?)
  `

  db.run(query, [title, req.userId], function (err) {
    if (err) {
      return res.status(500).json({ message: "Failed to create task" })
    }

    res.json({ message: "Task created successfully" })
  })
})

// GET TASKS
app.get("/tasks", authenticateToken, (req, res) => {
  const query = `
    SELECT * FROM tasks WHERE user_id = ?
  `

  db.all(query, [req.userId], (err, tasks) => {
    res.json(tasks)
  })
})

// DELETE TASK
app.delete("/tasks/:id", authenticateToken, (req, res) => {
  const taskId = req.params.id

  const query = `
    DELETE FROM tasks WHERE id = ? AND user_id = ?
  `

  db.run(query, [taskId, req.userId], function (err) {
    res.json({ message: "Task deleted" })
  })
})
