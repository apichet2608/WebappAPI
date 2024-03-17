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

//! Get
router.get("/get_plan_mc_qty", async (req, res) => {
  try {
    const { create_at, process } = req.query;

    let queryStr = `
      SELECT 
        p.create_at at time zone 'asia/bangkok' AS create_at_bkk, 
        p.*, 
        mc.process, 
        mc.machine, 
        mc.sub_process, 
        mc.mc_grp
      FROM 
        smart.smart_product_lot_wip_pth_plan p
      LEFT JOIN 
        smart.smart_product_lot_wip_pth_mcmaster mc ON mc.machine = p.pds_mc
    `;

    const conditions = [];
    const params = [];

    if (create_at && create_at !== "") {
      conditions.push(
        `DATE(p.create_at at time zone 'utc' at time zone 'asia/bangkok') = $${
          params.length + 1
        }`
      );
      params.push(create_at);
    }

    if (process && process !== "") {
      conditions.push(`mc.process = $${params.length + 1}`);
      params.push(process);
    }

    if (conditions.length > 0) {
      queryStr += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryStr += ` ORDER BY p.create_at desc`;

    const result = await pool.query(queryStr, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
