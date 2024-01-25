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

router.get("/distinct_line_machine_machine", async (req, res) => {
  try {
    const result = await pool.query(
      `
SELECT distinct line_machine
FROM smt.smt_print_alarm_log
order by line_machine desc 
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
    const { line_machine } = req.query;

    let query = `
    select
	  distinct machine 
    from
	  smt.smt_print_alarm_log`;

    const queryParams = [];

    if (line_machine && line_machine !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND line_machine = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE line_machine =  $${queryParams.length + 1}`;
      }
      queryParams.push(line_machine);
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
    const { line_machine, machine } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }

    let query = `
    select
	*
from
	smt.smt_print_alarm_log
Where date :: timestamp >= (now() - interval '${hours}' hour)`;

    const queryParams = [];

    if (line_machine && line_machine !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND line_machine = $${queryParams.length + 1}`;
      } else {
        query += ` AND line_machine =  $${queryParams.length + 1}`;
      }
      queryParams.push(line_machine);
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
      order by date desc
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
