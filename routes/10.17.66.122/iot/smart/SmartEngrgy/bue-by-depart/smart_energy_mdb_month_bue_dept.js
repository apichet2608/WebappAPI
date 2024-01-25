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

router.get("/distinctDept", async (req, res) => {
  try {
    const result = await query(`
    select
	distinct dept_2
from
	smart.smart_energy_mdb_month_bue_dept
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plot", async (req, res) => {
  try {
    const { dept } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
      select
	*
from
	smart.smart_energy_mdb_month_bue_dept
where 
	dept_2  = $1
 order by year_month::date asc
        `;
    queryParams = [dept];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
