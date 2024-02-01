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

router.get("/print_posTable", async (req, res) => {
  try {
    const { select_machine, select_program } = req.query;

    let query = `
      SELECT * 
      FROM smt.smt_print_program_log_printposition spplc
    `;

    const queryParams = [];

    if (select_machine && select_machine !== "ALL") {
      query += ` WHERE line_machine = $1`;
      queryParams.push(select_machine);
    }

    if (select_program && select_program !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND program_name = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE program_name = $1`;
      }
      queryParams.push(select_program);
    }

    query += ` ORDER BY update_at DESC;`;

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_machine", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct line_machine
from smt.smt_print_program_log_printposition spplc  
      
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_program", async (req, res) => {
  try {
    const { select_machine } = req.query;
    let query = `
      select distinct program_name
from smt.smt_print_program_log_printposition spplc 
    `;

    if (select_machine !== "ALL") {
      query += `
        WHERE line_machine = $1
      `;
    }

    const queryParams = select_machine !== "ALL" ? [select_machine] : [];

    console.log("Executing SQL Query:", query);
    console.log("Query Parameters:", queryParams);

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
