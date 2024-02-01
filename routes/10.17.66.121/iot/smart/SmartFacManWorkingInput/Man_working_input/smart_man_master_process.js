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

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "fujikura",
//   database: "postgres", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
// });

const query = (text, params) => pool.query(text, params);

router.get("/distinctCPOCostCenters", async (req, res) => {
  try {
    const { cpo_unit } = req.query; // Assuming you pass cpo_unit as a query parameter

    if (!cpo_unit) {
      return res.status(400).json({ error: "cpo_unit query parameter is required" });
    }

    const queryText = `
      SELECT DISTINCT cpo_cost_center
      FROM smart.smart_man_master_process
      WHERE cpo_unit = $1
      ORDER BY cpo_cost_center ASC
    `;

    const { rows } = await pool.query(queryText, [cpo_unit]);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


router.get("/distinctProcess", async (req, res) => {
  try {
    const { cpo_cost_center } = req.query;
    let queryStr = `
    select
      distinct process
    from
      smart.smart_man_master_process
    `;

    let queryParams = [];

    if (cpo_cost_center !== "-") {
      queryStr += `
        where
        cpo_cost_center = $1
      `;
      queryParams.push(cpo_cost_center);
    }

    queryStr += `
    order by 
    process asc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


router.get("/distinctCPOUnits", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct cpo_unit
    from
      smart.smart_man_master_process
    order by cpo_unit asc   
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
