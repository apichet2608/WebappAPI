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

router.post("/tableafterUpdate_SN", async (req, res) => {
  try {
    const sn = req.body;
    if (!sn || !Array.isArray(sn)) {
      return res.status(400).json({ error: "Invalid serial numbers format" });
    }

    const placeholders = sn.map((_, index) => `$${index + 1}`).join(",");

    const query = `
      SELECT *
      FROM fpc.fpc_fin_elt_sn_scan
      WHERE sn IN (${placeholders})
      order by is_check_date DESC
    `;

    const result = await pool.query(
      query,
      sn.map((serialNumber) => serialNumber.sn)
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.put("/update_SN", async (req, res) => {
  try {
    const { sn } = req.body;
    // Check if data has already been updated
    const checkResult = await query(
      `
      SELECT is_check_date
      FROM fpc.fpc_fin_elt_sn_scan
      WHERE sn = $1
      `,
      [sn]
    );

    if (checkResult.rows[0].is_check_date) {
      // Data has already been updated
      return res.status(200).json({ message: "Data has already been updated" });
    }

    // Perform the update
    const updateResult = await query(
      `
      UPDATE fpc.fpc_fin_elt_sn_scan
      SET is_check_date = now() AT TIME ZONE 'Asia/Bangkok'
      WHERE sn = $1
      `,
      [sn]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

router.get("/exportDataScanPass", async (req, res) => {
  try {
    const query = `
      SELECT file, sn, date_time, "result", status, id, is_check_date
      FROM fpc.fpc_fin_elt_sn_scan
      WHERE is_check_date IS NOT NULL                  
      ORDER BY is_check_date DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
