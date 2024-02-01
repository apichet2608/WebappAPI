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

router.get("/distinct_machine", async (req, res) => {
  try {
  
    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select distinct machine_id
    from smt.smt_avi_set_log 
    order by machine_id desc
        `;
  
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plot", async (req, res) => {
  const hours = parseInt(req.query.hours); // Assuming the parameter for hours is "hours" in the query string
  const machine_id = req.query.machine_id;

  // if (isNaN(hours)) {
  //   return res.status(400).send("Hours are required");
  // }

  try {
    // let query = `
    //   SELECT *
    //   FROM smt.smt_avi_set_log
    //   WHERE update_date >= NOW() - INTERVAL '${hours} hour'
    // `;
     let query = `
      SELECT *
      FROM smt.smt_avi_set_log
      WHERE 1=1
    `;
    const queryParams = [];

    if (machine_id !== "ALL") {
      query += `AND machine_id = $1`;
      queryParams.push(machine_id);
    }

    query += `
    order by update_date desc`;
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
