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

router.get("/distinctMachine", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct machine_code
    from
      smt.smt_reflow_tamura_temp_log`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/dataplot", async (req, res) => {
  try {
    const { machine_code } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }
    const result = await query(
      `
      select
        id,
        machine_code,
        log_level,
        create_at,
        "source",
        "1t_pv_oc"  as t1_pv,
        "1b_pv_oc"  as b1_pv ,
        "2t_pv_oc"  as t2_pv,	
        "2b_pv_oc"  as b2_pv,
        "3t_pv_oc"  as t3_pv,
        "3b_pv_oc"  as b3_pv,
        "4t_pv_oc"  as t4_pv,
        "4b_pv_oc"  as b4_pv,
        "5t_pv_oc"  as t5_pv,
        "5b_pv_oc"  as b5_pv,
        "6t_pv_oc"  as t6_pv,
        "6b_pv_oc"  as b6_pv,
        "7t_pv_oc"  as t7_pv,
        "7b_pv_oc"  as b7_pv,
        "8t_pv_oc"  as t8_pv,
        "8b_pv_oc"  as b8_pv,
        zone7_o2_con_pv,
        zone7_o2_con_pv_chat,
        o2_con_pv,
        o2_con_p_chat,
        "zone",
        zone_conveyor_speed_pv,
        status_mc,
        inside_mc,
        total_input,
        count_alarm
      from
        smt.smt_reflow_tamura_temp_log
      where
        status_mc = 2
        and inside_mc != 0
        and zone7_o2_con_pv_chat > '0'
        and machine_code = $1
        and o2_con_p_chat < 1000
      and create_at >= NOW() - interval '${hours}' hour
      order by
        create_at asc
      `,
      [machine_code]
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
