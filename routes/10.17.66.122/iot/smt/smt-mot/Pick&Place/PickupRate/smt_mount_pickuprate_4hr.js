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

//! Get
//* Table
router.get("/get_sum_error_table", async (req, res) => {
  try {
    const { program_name, mc_code, line, startDate, endDate } = req.query;

    let sql = `
      WITH cte AS (
        SELECT
            t.id,
            t.line,
            t.mc_code,
            t.program_name,
            t.interval_start_time,
            t.interval_stop_time,
            SUM(t.pickup_error) AS count_pickup_error,
            SUM(t.recog_error) AS count_recog_error,
            SUM(t.pickup_error) + SUM(t.recog_error) AS count_error,
            SUM(t.total) AS input,
            ROUND((SUM(t.pickup_error) / SUM(t.total) * 1000000)::numeric, 0) AS pickup_error_ppm,
            ROUND((SUM(t.recog_error) / SUM(t.total) * 1000000)::numeric, 0) AS recog_error_ppm,
            note
        FROM
            smt.smt_mount_pickuprate_4hr t
        GROUP BY
            t.id,
            t.interval_start_time,
            t.interval_stop_time,
            t.line,
            t.mc_code,
            t.program_name,
            note
    )
    SELECT
        sq1.id,
        sq1.interval_start_time,
        sq1.interval_stop_time,
        sq1.line,
        sq1.mc_code,
        sq1.program_name,
        sq1.pickup_error_ppm,
        sq1.recog_error_ppm,
        sq1.pickup_error_ppm + sq1.recog_error_ppm AS sum_ppm,
        sq1.count_pickup_error,
        sq1.count_recog_error,
        sq1.count_error,
        sq1.input,
        CASE
            WHEN sq1.pickup_error_ppm + sq1.recog_error_ppm >= 1000 THEN 'alarm'
            WHEN sq1.pickup_error_ppm + sq1.recog_error_ppm > 900 THEN 'warning'
        END AS status,
        sq1.note
    FROM
        cte sq1
    WHERE
        1 = 1`;

    const condition = [];
    const values = [];

    if (program_name && program_name !== "") {
      condition.push(`sq1.program_name = $${values.length + 1}`);
      values.push(program_name);
    }
    if (mc_code && mc_code !== "") {
      condition.push(`sq1.mc_code = $${values.length + 1}`);
      values.push(mc_code);
    }
    if (line && line !== "") {
      condition.push(`sq1.line = $${values.length + 1}`);
      values.push(line);
    }

    if (startDate && endDate) {
      condition.push(
        `DATE(sq1.interval_stop_time) BETWEEN $${values.length + 1} AND $${
          values.length + 2
        }`
      );
      values.push(startDate);
      values.push(endDate);
    }

    if (condition.length > 0) {
      sql += ` AND ${condition.join(" AND ")}`;
    }

    sql += `
    ORDER BY
        status ASC, interval_stop_time DESC;
    `;

    const result = await pool.query(sql, values);
    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//* Chart
router.get("/get_sum_error_chart", async (req, res) => {
  try {
    const { program_name, mc_code, line, startDate, endDate } = req.query;

    let sql = `
      WITH cte AS (
        SELECT
            t.id,
            t.line,
            t.mc_code,
            t.program_name,
            t.interval_start_time,
            t.interval_stop_time,
            SUM(t.pickup_error) AS count_pickup_error,
            SUM(t.recog_error) AS count_recog_error,
            SUM(t.pickup_error) + SUM(t.recog_error) AS count_error,
            SUM(t.total) AS input,
            ROUND((SUM(t.pickup_error) / SUM(t.total) * 1000000)::numeric, 0) AS pickup_error_ppm,
            ROUND((SUM(t.recog_error) / SUM(t.total) * 1000000)::numeric, 0) AS recog_error_ppm,
            note
        FROM
            smt.smt_mount_pickuprate_4hr t
        GROUP BY
            t.id,
            t.interval_start_time,
            t.interval_stop_time,
            t.line,
            t.mc_code,
            t.program_name,
            note
    )
    SELECT
        sq1.id,
        sq1.interval_start_time,
        sq1.interval_stop_time,
        sq1.line,
        sq1.mc_code,
        sq1.program_name,
        sq1.pickup_error_ppm,
        sq1.recog_error_ppm,
        sq1.pickup_error_ppm + sq1.recog_error_ppm AS sum_ppm,
        sq1.count_pickup_error,
        sq1.count_recog_error,
        sq1.count_error,
        sq1.input,
        CASE
            WHEN sq1.pickup_error_ppm + sq1.recog_error_ppm >= 1000 THEN 'alarm'
            WHEN sq1.pickup_error_ppm + sq1.recog_error_ppm > 900 THEN 'warning'
        END AS status,
        sq1.note
    FROM
        cte sq1
    WHERE
        1 = 1`;

    const condition = [];
    const values = [];

    if (program_name && program_name !== "") {
      condition.push(`sq1.program_name = $${values.length + 1}`);
      values.push(program_name);
    }
    if (mc_code && mc_code !== "") {
      condition.push(`sq1.mc_code = $${values.length + 1}`);
      values.push(mc_code);
    }
    if (line && line !== "") {
      condition.push(`sq1.line = $${values.length + 1}`);
      values.push(line);
    }

    if (startDate && endDate) {
      condition.push(
        `DATE(sq1.interval_stop_time) BETWEEN $${values.length + 1} AND $${
          values.length + 2
        }`
      );
      values.push(startDate);
      values.push(endDate);
    }

    if (condition.length > 0) {
      sql += ` AND ${condition.join(" AND ")}`;
    }

    sql += `
    ORDER BY
        interval_stop_time ASC;
    `;

    const result = await pool.query(sql, values);
    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//! Put
router.put("/put_note", async (req, res) => {
  try {
    const { id, note } = req.body;

    const sql = `
    UPDATE smt.smt_mount_pickuprate_4hr
    SET note = $2
    WHERE id = $1;
    `;

    const values = [id, note];

    await pool.query(sql, values);
    res.json({ message: "Update success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
