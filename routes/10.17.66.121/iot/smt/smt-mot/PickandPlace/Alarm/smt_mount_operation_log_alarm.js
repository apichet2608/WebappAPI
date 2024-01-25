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

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "postgres",
//   database: "postgres",
// });

const query = (text, params) => pool.query(text, params);

router.get("/distinct_line", async (req, res) => {
  try {
    const result = await pool.query(
      `
SELECT distinct line
FROM smt.smt_mount_operation_log_alarm
order by line desc 
        `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_machine", async (req, res) => {
  try {
    const { line } = req.query;

    let query = `
    select
	  distinct machine 
    from
	  smt.smt_mount_operation_log_alarm`;

    const queryParams = [];

    if (line && line !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND line = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE line =  $${queryParams.length + 1}`;
      }
      queryParams.push(line);
    }

    query += `
      order by machine desc
    `;

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table_Header", async (req, res) => {
  try {
    const { line, machine } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }

    let query = `
    select
	*
from
	smt.smt_mount_operation_log_alarm
Where date_time :: timestamp >= (now() - interval '${hours}' hour)`;

    const queryParams = [];

    if (line && line !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND line = $${queryParams.length + 1}`;
      } else {
        query += ` AND line =  $${queryParams.length + 1}`;
      }
      queryParams.push(line);
    }
    if (machine && machine !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND machine = $${queryParams.length + 1}`;
      } else {
        query += ` AND machine =  $${queryParams.length + 1}`;
      }
      queryParams.push(machine);
    }

    query += `
      order by date_time desc
    `;

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
