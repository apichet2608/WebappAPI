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

router.get("/count-status", async (req, res) => {
  try {
    const result = await query(`
    with aggregated_data as (
        select
            month_code,
            building,
            SUM(diff_energy) as total_diff_energy,
            SUM(energy_price) as total_energy_price
        from
            smart.smart_energy_mdb_daily
        where
            not exists (
            select
                1
            from
                smart.smart_energy_mdb_daily as t2
            where
                t2.building = smart.smart_energy_mdb_daily.building
                and t2.month_code > smart.smart_energy_mdb_daily.month_code
                  )
        group by
            month_code,
            building
          )
        select
            month_code,
            building,
            SUM(total_diff_energy) as total_diff_energy,
            SUM(total_energy_price) as total_energy_price
        from
            aggregated_data
        group by
            month_code,
            building
        union all
        select
            month_code,
            'total' as building,
            SUM(total_diff_energy) as total_diff_energy,
            SUM(total_energy_price) as total_energy_price
        from
            aggregated_data
        group by
            month_code
        order by
            month_code,
            building;    
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plot-by-build", async (req, res) => {
  try {
    const { build } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
	t.month_code ,
	round (sum (t.diff_energy)::numeric,2) as sum_energy_usage ,
	round (sum (t.energy_price)::numeric,2) as sum_energy_price  
from
	smart.smart_energy_mdb_daily t
group by
	t.month_code
order by
	t.month_code asc
        `;
    } else {
      queryStr = `
      select
	t.building ,
	t.month_code ,
	round (sum (t.diff_energy)::numeric,2) as sum_energy_usage ,
	round (sum (t.energy_price)::numeric,2) as sum_energy_price  
from
	smart.smart_energy_mdb_daily t
where
        t.building = $1
group by
	t.building ,
	t.month_code
order by
	t.building asc ,
	t.month_code asc
        `;
      queryParams = [build];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plot-top10", async (req, res) => {
  try {
    const { build } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      CONCAT(mdb_code, '-', building) AS area,
	month_code,
	building,
	SUM(energy_price) as energy_price
from
	smart.smart_energy_mdb_daily
where
	month_code = (SELECT MAX(month_code) FROM smart.smart_energy_mdb_daily)
group by
	area,
	month_code,
	building
order by
	month_code desc,
	energy_price desc
limit 10
        `;
    } else {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      CONCAT(mdb_code, '-', building) AS area,
	month_code,
	building,
	SUM(energy_price) as energy_price
from
	smart.smart_energy_mdb_daily
where
	month_code = (SELECT MAX(month_code) FROM smart.smart_energy_mdb_daily)
and building = $1
group by
	area,
	month_code,
	building
order by
	month_code desc,
	energy_price desc
limit 10
        `;
      queryParams = [build];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
