const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// const pool = new Pool({
//   host: "10.17.71.21",
//   port: 5432,
//   user: "postgres",
//   password: "postgres",
//   database: "data_log",
// });

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});


const query = (text, params) => pool.query(text, params);

router.get("/distinctline", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct line
    from
      smt.smt_reflow_smic_actv
    order by
      line asc`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctmachine_code", async (req, res) => {
  try {
    const { line } = req.query;
    const result = await query(
      `select distinct machine_code 
       from smt.smt_reflow_smic_actv
       where line = $1
       order by machine_code asc`,
      [line]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/dataplot", async (req, res) => {
  try {
    const { line, machine_code } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }
    const result = await query(
      `select
      *
    from
      smt.smt_reflow_smic_actv
    where
      line = $1
      and machine_code = $2
       and datetime >= NOW() - interval '${hours}' hour
       and machine_con = 'Start'
    order by
      datetime asc
      `,
      [line, machine_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/dataplot/Reflow-Tamura", async (req, res) => {
  try {
    const { machine_code } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }
    const result = await query(
      `select
      id,
      create_at,
      status_mc,
      inside_mc,
      case
        when status_mc = 2
        and inside_mc = 0 then 1.5
        when status_mc = 2
        and inside_mc != 0 then 2
        when status_mc = 3
        and inside_mc = 0 then 3
        when status_mc = 3
        and inside_mc != 0 then 4
        when status_mc = 0 then 0
        when status_mc = 1 then 1
        when status_mc = 6 then 6
        else -1
      end as result
    from
      smt.smt_reflow_tamura_temp_log
    where
      machine_code = $1
      and zone7_o2_con_pv_chat > '0'
      and create_at >= NOW() - interval '${hours}' hour
      and o2_con_p_chat < 1000
    order by
      create_at asc`,
      [machine_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
