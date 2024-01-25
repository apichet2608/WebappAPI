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

router.get("/distinctbuilding", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct building
    from
      smart.smart_energy_mdb_by_day
    order by building asc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctdept2", async (req, res) => {
  try {
    const { building } = req.query;

    const queryStr = `
    select
	distinct dept_2
from
	smart.smart_energy_mdb_by_day
where
	building = $1
order by
	dept_2 asc
    `;
    const queryParams = [building];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctload_type", async (req, res) => {
  try {
    const { building, dept_2 } = req.query;

    const queryStr = `
    select
	distinct load_type
from
	smart.smart_energy_mdb_by_day
where
	building = $1
and dept_2  = $2
order by
	load_type asc
    `;
    const queryParams = [building, dept_2];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctarea", async (req, res) => {
  try {
    const { building, dept_2, load_type } = req.query;

    const queryStr = `
    select
	distinct area 
from
	smart.smart_energy_mdb_by_day
where
    building = $1
  and dept_2  = $2
  and load_type = $3
  order by area  asc
    `;
    const queryParams = [building, dept_2, load_type];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctmdb_code", async (req, res) => {
  try {
    const { building, dept_2, load_type, area } = req.query;

    const queryStr = `
    select
	distinct mdb_code 
from
	smart.smart_energy_mdb_by_day
where
    building = $1
  and dept_2  = $2
  and load_type = $3
  and area = $4
  order by mdb_code  asc
    `;
    const queryParams = [building, dept_2, load_type, area];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plotbyarea", async (req, res) => {
  try {
    const { building, dept_2, load_type, area } = req.query;

    const queryStr = `
    select
    ROW_NUMBER() OVER () AS id,
    area,
    "date",
    SUM(diff_energy_usage) as result
    from
    smart.smart_energy_mdb_by_day
    where
    building = $1
    and dept_2  = $2
    and load_type = $3
    and area = $4
    AND "date"::timestamp with time zone >= NOW() - INTERVAL '90 days'
    group by   area,
    "date"
    order by "date"  asc
    `;
    const queryParams = [building, dept_2, load_type, area];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plotbymdb_code", async (req, res) => {
  try {
    const { building, dept_2, load_type, area, mdb_code } = req.query;

    const queryStr = `
    select
    row_number() over () as id,
    area,
    "date",
    SUM(diff_energy_usage) as result
  from
    smart.smart_energy_mdb_by_day
  where
    building = $1
    and dept_2 = $2
    and load_type = $3
    and area = $4
    and mdb_code = $5
    and "date"::timestamp with time zone >= NOW() - INTERVAL '90 days'
  group by
    area,
    "date"
  order by
    "date" asc
    `;
    const queryParams = [building, dept_2, load_type, area, mdb_code];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;

