console.log("db.js file loaded")

const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./database.db", err => {
  if (err) {
    console.log(err.message)
  } else {
    console.log("Connected to SQLite database")
  }
})
