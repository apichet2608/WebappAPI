const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});

const query = (text, params) => pool.query(text, params);

router.get("/system_schedule", async (req, res) => {
  try {
    const { module, project_name, status } = req.query;

    // Base query string
    let queryString = `
      SELECT
        t.id,
        t.created_at,
        a.project_name,
        t."module",
        a.dri,
        t."interval",
        t.unit,
        t.updated_at,
        t.job_func,
        a.status,
        t.next_run
      FROM
        system.system_loging_parameter_monitoring_schedule t
      LEFT JOIN
        system.system_loging_master a ON t."module" = a."module"
    `;

    // Parameters for the query
    let queryParam = [];

    // If module is provided and is not "ALL", filter by module
    if (module && module !== "ALL") {
      queryString += ` WHERE t."module" = $1 `;
      queryParam.push(module);
    }

    // If project_name is provided, add it to the WHERE clause
    if (project_name) {
      if (queryParam.length > 0) {
        queryString += ` AND a.project_name = $${queryParam.length + 1}`;
      } else {
        queryString += ` WHERE a.project_name = $${queryParam.length + 1}`;
      }
      queryParam.push(project_name);
    }

    // If status is provided, add it to the WHERE clause
    if (status) {
      if (status.toLowerCase() === "null") {
        // Check for NULL values
        if (queryParam.length > 0) {
          queryString += ` AND a.status IS NULL`;
        } else {
          queryString += ` WHERE a.status IS NULL`;
        }
      } else {
        // Regular status value
        if (queryParam.length > 0) {
          queryString += ` AND a.status = $${queryParam.length + 1}`;
        } else {
          queryString += ` WHERE a.status = $${queryParam.length + 1}`;
        }
        queryParam.push(status);
      }
    }

    // Append ordering
    queryString += `
      ORDER BY
        t.next_run ASC,
        t.updated_at ASC;
    `;

    // Execute the query
    const result = await pool.query(queryString, queryParam);

    // Send the result
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
