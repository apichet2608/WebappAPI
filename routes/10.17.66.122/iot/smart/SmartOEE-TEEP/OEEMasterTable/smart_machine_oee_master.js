const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.122",
  port: 5432,
  user: "postgres",
  password: "p45aH9c17hT11T{]",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

//*Master Table
router.get("/master_table", async (req, res) => {
  try {
    const { process } = req.query;

    let sqlQuery = `
    SELECT
        *
    FROM
        smart.smart_machine_oee_master
    WHERE 1=1
    `;

    let queryParam = [];

    if (process && process !== "ALL") {
      sqlQuery += `AND "process" = $${queryParam.length + 1} `;
      queryParam.push(process);
    }

    // ORDER BY clause
    sqlQuery += `ORDER BY "process" ASC`;

    // Execute the database query
    const result = await pool.query(sqlQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
