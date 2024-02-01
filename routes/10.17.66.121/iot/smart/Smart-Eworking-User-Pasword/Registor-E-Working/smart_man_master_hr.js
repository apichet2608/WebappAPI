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

const query = (text, params) => pool.query(text, params);

//distinct_proc_grp

router.get("/distinct_id_code", async (req, res) => {
  try {
    const {} = req.query;
    let query = `
    select
	distinct id_code 
from
	smart.smart_man_master_hr
order by id_code asc`;

    const queryParams = [];

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Usernamesurname", async (req, res) => {
  try {
    const { id_code } = req.query;
    let query = `
    select
	id_code,
	"name",
	surname,
	cost_center,
	car_infor,
	stop_car,
	id
from
	smart.smart_man_master_hr
    `;

    const queryParams = [];

    if (id_code && id_code !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `WHERE`;
      }
      query += ` id_code = $${queryParams.length + 1}
      `;
      queryParams.push(id_code);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
