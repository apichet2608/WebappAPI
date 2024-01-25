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

router.get("/distinct_aoi_prd_name", async (req, res) => {
  try {
    const { startdate, stopdate } = req.query;

    const result = await pool.query(
      `
      SELECT distinct aoi_prd_name 
      FROM fpc.fpc_cfm_aoi_reject_lot fcarl 
      WHERE aoi_date::date BETWEEN $1 AND $2
      `,
      [startdate, stopdate]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_aoi_side", async (req, res) => {
  try {
    const { aoi_prd_name, startdate, stopdate } = req.query;
    let queryStr = `
      SELECT distinct aoi_side
      FROM fpc.fpc_cfm_aoi_reject_lot fcarl
      WHERE aoi_date::date BETWEEN $1 AND $2
    `;

    let queryParams = [startdate, stopdate];

    if (aoi_prd_name !== "ALL") {
      queryStr += `
        AND aoi_prd_name = $3
      `;
      queryParams.push(aoi_prd_name);
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/AOI_lot_table", async (req, res) => {
  try {
    const { aoi_side, aoi_prd_name, startdate, stopdate } = req.query;

    let query = `
      SELECT *,
        ROUND(reject_percentage::numeric, 2) AS formatted_reject_percentage,
        TO_CHAR(aoi_date, 'YYYY-MM-DD ') AS formatted_aoi_date,
        TO_CHAR(update_date, 'YYYY-MM-DD HH24:MI') AS formatted_update_date,
        TO_CHAR(aoi_update_date, 'YYYY-MM-DD HH24:MI') AS formatted_aoi_update_date
      FROM fpc.fpc_cfm_aoi_reject_lot fcarl
      WHERE 1=1
    `;

    const queryParams = [];

    if (aoi_prd_name) {
      query += " AND aoi_prd_name = $" + (queryParams.length + 1);
      queryParams.push(aoi_prd_name);
    }

    if (aoi_side && aoi_side !== "ALL") {
      query += " AND aoi_side = $" + (queryParams.length + 1);
      queryParams.push(aoi_side);
    }

    if (startdate) {
      query += " AND aoi_date >= $" + (queryParams.length + 1);
      queryParams.push(startdate);
    }

    if (stopdate) {
      query += " AND aoi_date <= $" + (queryParams.length + 1);
      queryParams.push(stopdate);
    }

    // query +=
    //   " GROUP BY aoi_date, aoi_side, aoi_prd_name, lot_no, reject_desc ORDER BY aoi_date ASC; ";

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/AOI_Lot_stack", async (req, res) => {
  try {
    const { aoi_side, aoi_prd_name, startdate, stopdate } = req.query;

    let query = `
       SELECT
        MAX(id) AS id,
        aoi_date,
        aoi_side,
        aoi_prd_name,
        lot_no,
        MAX(reject_percentage) AS reject_percentage,
        reject_desc
      FROM
        fpc.fpc_cfm_aoi_reject_lot fcarl
      WHERE 1=1
    `;

    const queryParams = [];

    if (aoi_prd_name) {
      query += " AND aoi_prd_name = $" + (queryParams.length + 1);
      queryParams.push(aoi_prd_name);
    }

    if (aoi_side && aoi_side !== "ALL") {
      query += " AND aoi_side = $" + (queryParams.length + 1);
      queryParams.push(aoi_side);
    }

    if (startdate) {
      query += " AND aoi_date >= $" + (queryParams.length + 1);
      queryParams.push(startdate);
    }

    if (stopdate) {
      query += " AND aoi_date <= $" + (queryParams.length + 1);
      queryParams.push(stopdate);
    }

    query +=
      " GROUP BY aoi_date, aoi_side, aoi_prd_name, lot_no, reject_desc ORDER BY aoi_date ASC; ";

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
