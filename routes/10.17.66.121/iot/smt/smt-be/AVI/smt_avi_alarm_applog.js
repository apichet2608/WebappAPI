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
    select
	distinct machine
    from
	smt.smt_avi_alarm_applog
        `;
  
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_type", async (req, res) => {
  try {
    const { machine } = req.query;
  
    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
	distinct "type"
    from
	smt.smt_avi_alarm_applog
        `;
  
    if (machine !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
        AND machine = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
        WHERE machine = $1
        `;
      }
      queryParams.push(machine);
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plot", async (req, res) => {
  const hours = parseInt(req.query.hours); // Assuming the parameter for hours is "hours" in the query string
  const {machine ,type}= req.query;

  if (isNaN(hours)) {
    return res.status(400).send("Hours are required");
  }

  try {
    let query = `
      SELECT *
      FROM smt.smt_avi_alarm_applog
      WHERE alarm_time::timestamp >= NOW() - INTERVAL '${hours} hour'
    `;
    const queryParams = [];

     if (machine !== "ALL") {
      if (queryParams.length > 0) {
        query += `
        AND machine = $${queryParams.length + 1}
        `;
      } else {
        query += `
        AND machine = $${queryParams.length + 1}
        `;
      }
      queryParams.push(machine);
    }
     if (type !== "ALL") {
      if (queryParams.length > 0) {
        query += `
        AND type = $${queryParams.length + 1}
        `;
      } else {
        query += `
         AND type = $${queryParams.length + 1}
        `;
      }
      queryParams.push(type);
    }

    query += `order by alarm_time desc`;
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
