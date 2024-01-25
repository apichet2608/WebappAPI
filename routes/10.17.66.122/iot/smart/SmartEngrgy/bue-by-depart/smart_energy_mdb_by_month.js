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

router.get("/plot", async (req, res) => {
  try {
    const { dept, build } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    SELECT
    ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
    month_code,
    load_type,
    area,
    dept_2,
    building,
    sum(diff_energy_usage) AS diff_energy_usage,
    ${
      build !== "ALL"
        ? "concat(load_type, ',', area) AS area_load_type"
        : "concat(load_type, ',', building , ',', area) AS area_load_type"
    }
FROM 
    smart.smart_energy_mdb_by_month
WHERE
    month_code = (
        SELECT MAX(month_code)
        FROM smart.smart_energy_mdb_by_month
    )
    AND dept_2 = $1
    ${build !== "ALL" ? "AND building = $2" : ""}
GROUP BY
    month_code,
    dept_2,
    load_type,
    area,
    building
ORDER BY
    month_code ASC;
    `;
    queryParams = build !== "ALL" ? [dept, build] : [dept];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctloadtype", async (req, res) => {
  try {
    const { dept, build } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
    distinct load_type  
  from
    smart.smart_energy_mdb_by_month
  where
    dept_2 = $1
    and building = $2
        `;
    queryParams = [dept, build];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctarea", async (req, res) => {
  try {
    const { dept, build, load_type } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
    distinct  area 
  from
    smart.smart_energy_mdb_by_month
  where
    dept_2 = $1
    and building = $2
    and load_type = $3
        `;
    queryParams = [dept, build, load_type];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plotbyarea", async (req, res) => {
  try {
    const { dept, build, load_type, area } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    SELECT
  month_code,
  SUM(diff_energy_usage) AS diff_energy_usage
FROM
  smart.smart_energy_mdb_by_month
WHERE
  dept_2 = $1
  AND building = $2
  AND load_type = $3
  AND area = $4
GROUP BY
  month_code
ORDER BY
  month_code ASC;
    `;
    queryParams =
      build !== "ALL"
        ? [dept, build, load_type, area]
        : [dept, load_type, area];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
