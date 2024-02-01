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
FROM smt.smt_mount_program_log_header
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
	  smt.smt_mount_program_log_header`;

    const queryParams = [];

    if (line) {
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

router.get("/distinct_program_name", async (req, res) => {
  try {
    const { line, machine } = req.query;

    let query = `
    select
	  distinct program_name 
    from
	  smt.smt_mount_program_log_header`;

    const queryParams = [];

    if (line) {
      if (queryParams.length > 0) {
        query += ` AND line = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE line =  $${queryParams.length + 1}`;
      }
      queryParams.push(line);
    }
    if (machine) {
      if (queryParams.length > 0) {
        query += ` AND machine = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE machine =  $${queryParams.length + 1}`;
      }
      queryParams.push(machine);
    }

    query += `
      order by program_name desc
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
    const { line, machine, program_name } = req.query;

    let query = `
    select
	    create_at,
	    date_time,
	    line,
	    machine,
	    program_name,
	    board_size_x,
	    board_size_y,
	    board_size_z,
	    update_date,
	    id,
	    est_cycle_time
    from
	    smt.smt_mount_program_log_header`;

    const queryParams = [];

    if (line) {
      if (queryParams.length > 0) {
        query += ` AND line = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE line =  $${queryParams.length + 1}`;
      }
      queryParams.push(line);
    }
    if (machine) {
      if (queryParams.length > 0) {
        query += ` AND machine = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE machine =  $${queryParams.length + 1}`;
      }
      queryParams.push(machine);
    }
    if (program_name !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND program_name = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE program_name =  $${queryParams.length + 1}`;
      }
      queryParams.push(program_name);
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
