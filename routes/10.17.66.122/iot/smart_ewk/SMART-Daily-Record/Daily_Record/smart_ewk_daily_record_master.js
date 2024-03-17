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

router.get("/distinct_record_code", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT record_code
      FROM smart_ewk.smart_ewk_daily_record_master
    `);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/select_main_record", async (req, res) => {
  try {
    // Extract parameters from the request query
    const { dept, proc_grp, machine, record_code } = req.query;

    // Validate the received parameters
    if (!dept || !proc_grp || !machine || !record_code) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const result = await pool.query(
      `
      SELECT 
        id,
        dept,
        proc_grp,
        mc_code as machine,
        check_sheet_code,
        check_sheet_desc,
        lock_ewk,
        ref_is,
        ref_record,
        record_code  
      FROM smart_ewk.smart_ewk_daily_record_master
      WHERE dept = $1
      AND proc_grp = $2
      AND mc_code = $3
      AND record_code = $4
      `,
      // Use the extracted parameters here
      [dept, proc_grp, machine, record_code]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
