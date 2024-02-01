const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/Table_Header", async (req, res) => {
  try {
    // const { line, machine, program_name } = req.query;

    let query = `
    select
	*
    from
	smt.smt_print_solder_lifetime`;

    const queryParams = [];

    query += `
      order by update_date :: timestamp desc
    `;

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
