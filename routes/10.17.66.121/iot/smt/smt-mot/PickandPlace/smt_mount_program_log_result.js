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

router.get("/Table_Result", async (req, res) => {
  try {
    const { line, machine, program_name } = req.query;

    let query = `
    select
	create_at,
	date_time,
	line,
	machine,
	program_name,
	part_name,
	comp_size_x,
	comp_size_y,
	comp_size_z,
	nozzle_type,
	part_ref,
	pickup_height,
	mount_height,
	pickup_speed,
	mount_speed,
	update_date,
	mount_height_lsl,
	mount_height_usl,
	pickup_speed_usl,
	mount_speed_usl,
	pickup_height_judge,
	pickup_speed_judge,
	mount_speed_judge,
	judge,
	id,
	table_name
from
	smt.smt_mount_program_log_result`;

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
    console.log(query);
    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
