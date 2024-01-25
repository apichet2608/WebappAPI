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

router.get("/distinctFactory", async (req, res) => {
  try {
    const result = await query(
      `select distinct factory from jw_common_table.jwdb_rlse_beac`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctMccode", async (req, res) => {
  try {
    const { factory } = req.query;
    const result = await query(
      `select distinct mc_code from jw_common_table.jwdb_rlse_beac where factory = $1`,
      [factory]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/dataplot", async (req, res) => {
  try {
    const { factory, mc_code } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }
    const result = await query(
      `select
      *
    from
      jw_common_table.jwdb_rlse_beac
      
    where factory = $1
    and mc_code = $2
    and ptime :: timestamp >= (now() - interval '${hours}' hour)
    order by ptime asc`,
      [factory, mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
