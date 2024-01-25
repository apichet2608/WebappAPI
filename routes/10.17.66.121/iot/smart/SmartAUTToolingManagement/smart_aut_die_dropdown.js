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

router.get("/distinct_jobType", async (req, res) => {
  try {
    const result = await pool.query(
      `
        select distinct job_type 
from smart.smart_aut_die_dropdown sadd 
WHERE job_type IS NOT NULL
        
        `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_pmShot", async (req, res) => {
  try {
    const result = await pool.query(
      `
       SELECT MAX(pm_shot) AS pm_shot
FROM (
    SELECT pm_shot, CAST(REPLACE(pm_shot, 'K', '') AS INTEGER) AS numeric_pm_shot
    FROM smart.smart_aut_die_dropdown sadd 
    WHERE pm_shot IS NOT NULL
) AS subquery
GROUP BY numeric_pm_shot
ORDER BY numeric_pm_shot ASC;
        `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_defectInfo", async (req, res) => {
  try {
    const result = await pool.query(
      `
        select distinct defect_info 
from smart.smart_aut_die_dropdown sadd 
 WHERE defect_info IS NOT NULL
        
        `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_repairStandard", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT DISTINCT repair_standard
            FROM smart.smart_aut_die_dropdown sadd
            WHERE repair_standard IS NOT NULL
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_location", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT DISTINCT location
            FROM smart.smart_aut_die_dropdown sadd
            WHERE location IS NOT NULL
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
