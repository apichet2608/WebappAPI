const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// const pool = new Pool({
//   host: "10.17.71.21",
//   port: 5432,
//   user: "postgres",
//   password: "postgres",
//   database: "arduino_iot_project",
// });

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});


const query = (text, params) => pool.query(text, params);

router.get("/distinctMccode", async (req, res) => {
  try {
    const result = await query(
      `select distinct mc_code from smt.smt_vacuum_seal_data`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/dataplot", async (req, res) => {
  try {
    const { mc_code } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }
    const result = await query(
      `select
      *
    from
      smt.smt_vacuum_seal_data
      
    where mc_code = $1
    and create_at :: timestamp >= (now() - interval '${hours}' hour)
    order by create_at asc`,
      [mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
