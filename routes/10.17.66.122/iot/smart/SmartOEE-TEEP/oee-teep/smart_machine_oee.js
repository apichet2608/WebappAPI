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

router.get("/distinct-build", async (req, res) => {
  try {
    const { date } = req.query;

    const result = await query(
      `select
distinct  buiding 
from
smart.smart_machine_oee
where date_time = $1`,
      [date]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/fix-mccode", async (req, res) => {
  try {
    const { date, build, mc } = req.query;

    const result = await query(
      `select
*
from
smart.smart_machine_oee
where date_time = $1
and buiding = $2
and mc_code =$3`,
      [date, build, mc]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-process", async (req, res) => {
  try {
    const { date, build } = req.query;
    let queryParams = [];
    let queryStr = `
    select
distinct  process_group  
from
smart.smart_machine_oee
where date_time = $1
    `;
    queryParams.push(date);

    if (build !== "ALL") {
      queryStr += `
    AND buiding = $${queryParams.length + 1}
  `;
      queryParams.push(build);
    }
    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/data-table", async (req, res) => {
  try {
    const { date, build, process } = req.query;
    let queryParams = [];
    let queryStr = `
    select
*
from
smart.smart_machine_oee
where date_time = $1
    `;
    queryParams.push(date);

    if (build !== "ALL") {
      queryStr += `
    AND buiding = $${queryParams.length + 1}
  `;
      queryParams.push(build);
    }
    if (process !== "ALL") {
      queryStr += `
    AND process_group = $${queryParams.length + 1}
  `;
      queryParams.push(process);
    }

    queryStr += `order by process_group, 
                 percent_oee desc`;
    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/data-plot", async (req, res) => {
  try {
    const { date, build, process, mc_code } = req.query;
    let queryParams = [];
    let queryStr = `
    SELECT *
      FROM smart.smart_machine_oee
      WHERE date_time >= $1::DATE - INTERVAL '90 days'
      AND date_time <= $1::DATE
    `;
    queryParams.push(date);

    if (build !== "ALL") {
      queryStr += `
    AND buiding = $${queryParams.length + 1}
  `;
      queryParams.push(build);
    }
    if (process !== "ALL") {
      queryStr += `
    AND process_group = $${queryParams.length + 1}
  `;
      queryParams.push(process);
    }
    if (mc_code !== "ALL") {
      queryStr += `
    AND mc_code = $${queryParams.length + 1}
  `;
      queryParams.push(mc_code);
    }
    queryStr += `order by date_time asc`;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/data-plot-by-month", async (req, res) => {
  try {
    const { date, build } = req.query;
    let queryParams = [];
    let queryStr = `
    select
	building,
	"month",
	process_group,
	p_avialable,
	p_run,
	p_on,
	p_off
from
	smart.smart_machine_oee_by_month
where month = $1
    `;
    queryParams.push(date);

    if (build !== "ALL") {
      queryStr += `
    AND building = $${queryParams.length + 1}
  `;
      queryParams.push(build);
    }

    queryStr += `order by p_on ASC`;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
