const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.71.21",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinctmc_code", async (req, res) => {
  try {
    const result = await query(
      `SELECT distinct mc_code FROM public.jwdb_rphp_beac_actv  where mc_code in ('V2-47-11',
      'V2-47-12',
      'V2-47-13',
      'R2-47-22',
      'R2-47-23',
      'R2-47-25',
      'R2-47-18',
      'R2-47-17')`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-plot", async (req, res) => {
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
      public.jwdb_rphp_beac_actv
    where
      mc_code in ('V2-47-11',
          'V2-47-12',
          'V2-47-13',
          'R2-47-22',
          'R2-47-23',
          'R2-47-25',
          'R2-47-18',
          'R2-47-17')
      and mc_code = $1
      and ptime :: timestamp >= (now() - interval '${hours}' hour)
      and l_arm_measurement_x_value_pv < 200
      and l_arm_measurement_y_value_pv < 200
      and r_arm_measurement_x_value_pv < 200
      and r_arm_measurement_y_value_pv < 200
    order by
      ptime asc`,
      [mc_code]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
