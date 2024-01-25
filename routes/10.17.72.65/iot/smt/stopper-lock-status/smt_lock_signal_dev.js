const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.72.65",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

router.get("/distinct_machine", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT machine
      FROM smt.smt_lock_signal_dev slsd 
      ORDER BY machine ASC;
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table_smt", async (req, res) => {
  try {
    const machine = req.query.machine;

    // Use a parameterized query to prevent SQL injection
    const result = await pool.query(
      `
      SELECT
        id,
        line,
        machine,
        description,
        signal,
        TO_CHAR(update_date, 'YYYY-MM-DD HH24:MI:SS') update_date,
        process
      FROM smt.smt_lock_signal_dev slsd
      ${machine && machine !== "ALL" ? "WHERE machine = $1" : ""}
      ORDER BY update_date DESC
      `,
      machine && machine !== "ALL" ? [machine] : [] // Pass the parameter value only when it's specified
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// correct

module.exports = router;
