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
router.get("/get_real_time", async (req, res) => {
  try {
    const { station_id } = req.query;

    let sql = `
      SELECT
          id,
          create_at,
          site,
          station_type,
          product,
          test_result,
          unit_serial_number,
          uut_start,
          uut_stop,
          limits_version,
          software_name,
          software_version,
          station_id,
          fixture_id,
          head_id,
          test,
          sub_test,
          sub_sub_test,
          upper_limit,
          lower_limit,
          value,
          units,
          usl,
          lsl,
          judgement,
          parameter_name
      FROM
          smt.smt_spi_real_time_data
      WHERE 1 = 1`;

    const values = [];

    if (station_id && station_id !== "") {
      sql += ` AND station_id = $${values.length + 1}`;
      values.push(station_id);
    }

    sql += ` ORDER BY create_at DESC`;

    const result = await query(sql, values);

    res.json(result.rows); // Sending response as JSON
  } catch (err) {
    console.error("Error in get_real_time:", err);
    res.status(500).json({ error: "Internal Server Error" }); // Sending a generic error message
  }
});

module.exports = router;
