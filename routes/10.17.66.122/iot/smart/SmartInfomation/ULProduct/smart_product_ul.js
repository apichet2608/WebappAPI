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

//*Main Table
router.get("/main_table", async (req, res) => {
  try {
    const { lob, application, flex_name, x_code } = req.query;

    const conditions = [];
    const queryParams = [];

    if (lob && lob !== "") {
      conditions.push(`lob = $${queryParams.length + 1}`);
      queryParams.push(lob);
    }
    if (application && application !== "") {
      conditions.push(`application = $${queryParams.length + 1}`);
      queryParams.push(application);
    }
    if (flex_name && flex_name !== "") {
      conditions.push(`flex_name = $${queryParams.length + 1}`);
      queryParams.push(flex_name);
    }
    if (x_code && x_code !== "") {
      conditions.push(`x_code = $${queryParams.length + 1}`);
      queryParams.push(x_code);
    }

    // Check if any conditions are provided before adding the WHERE clause
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const queryString = `
            SELECT * FROM smart.smart_product_ul
            ${whereClause}`;

    const result = await query(queryString, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//*Main Card
router.get("/main_card", async (req, res) => {
  try {
    const { lob, application, flex_name, x_code } = req.query;

    let queryString = `
      SELECT
        COUNT(t.x_code) AS total,
        SUM(CASE WHEN t.ul_certification_date IS NOT NULL THEN 1 ELSE 0 END) AS done,
        SUM(CASE WHEN t.ul_certification_date IS NULL THEN 1 ELSE 0 END) AS in_progress,
        ROUND((SUM(CASE WHEN t.ul_certification_date IS NOT NULL THEN 1 ELSE 0 END) * 100) / COUNT(t.x_code)::NUMERIC, 2) AS percent_done
      FROM
        smart.smart_product_ul t`;

    const conditions = [];
    const queryParams = [];

    if (lob && lob !== "") {
      conditions.push(`lob = $${queryParams.length + 1}`);
      queryParams.push(lob);
    }

    if (application && application !== "") {
      conditions.push(`application = $${queryParams.length + 1}`);
      queryParams.push(application);
    }

    if (flex_name && flex_name !== "") {
      conditions.push(`flex_name = $${queryParams.length + 1}`);
      queryParams.push(flex_name);
    }

    if (x_code && x_code !== "") {
      conditions.push(`x_code = $${queryParams.length + 1}`);
      queryParams.push(x_code);
    }

    if (conditions.length > 0) {
      queryString += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = await query(queryString, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing SQL query:", err.message);
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
