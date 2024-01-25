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

router.get("/Cardsummary", async (req, res) => {
  try {
    const { year_month } = req.query;

    let queryParams = [];
    let queryStr = ``;

    if (year_month !== "ALL") {
      queryStr += `
        with MaxYearMonth as (
        select
	           MAX(year_month) AS max_year_month
        from
	           smart.smart_cost_amout_month
          WHERE year_month = $${queryParams.length + 1})
      `;
      queryParams.push(year_month);
    } else {
      queryStr += `
        with MaxYearMonth as (
    select MAX(year_month) as max_year_month
    from smart.smart_cost_amout_month
)
      `;
    }

    queryStr += `
    select
	'FG-Amount' as semi,
	year_month,
	item_type,
	SUM(sum_amount) as value
from
	smart.smart_cost_amout_month
where
year_month = (SELECT max_year_month FROM MaxYearMonth)
	and semi = 'FG'
	and item_type = 'W/H'
group by
	semi,
	year_month,
	item_type
union all
select
	'SEMI-Cost' as semi,
	year_month,
	item_type,
	SUM(sum_total_cost) as value
from
	smart.smart_cost_amout_month
where
year_month = (SELECT max_year_month FROM MaxYearMonth)	
	and semi = 'SEMI'
	and item_type = 'W/H'
group by
	semi,
	year_month,
	item_type
union all
select
	'SEMI-QTY' as semi,
	year_month,
	item_type,
	SUM(sum_qty) as value
from
	smart.smart_cost_amout_month
where
year_month = (SELECT max_year_month FROM MaxYearMonth)	
	
	and semi = 'SEMI'
	and item_type = 'W/H'
group by
	semi,
	year_month,
	item_type
union all
select
	'FG-Margin' as semi,
	year_month,
	item_type,
	SUM(sum_margin) as value
from
	smart.smart_cost_amout_month
where
year_month = (SELECT max_year_month FROM MaxYearMonth)	
	and semi = 'FG'
	and item_type = 'W/H'
group by
	semi,
	year_month,
	item_type
union all
select
	'FG-FI-Cost' as semi,
	year_month,
	item_type,
	SUM(sum_total_cost) as value
from
	smart.smart_cost_amout_month
where
	year_month = (SELECT max_year_month FROM MaxYearMonth)
	and semi = 'FG'
	and item_type = 'FI'
group by
	semi,
	year_month,
	item_type
union all
select
	'SEMI-FI-Cost' as semi,
	year_month,
	item_type,
	SUM(sum_total_cost) as value
from
	smart.smart_cost_amout_month
where
	year_month = (SELECT max_year_month FROM MaxYearMonth)
	and semi = 'SEMI'
	and item_type = 'FI'
group by
	semi,
	year_month,
	item_type
order by
	year_month desc;
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);

    console.log("today");
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table2Month", async (req, res) => {
  try {
    const { item_type } = req.query;

    let queryParams = [];
    let queryStr = ``;

    queryStr += `
    select
	    *
    from
	    smart.smart_cost_amout_month
    `;

    if (item_type !== "W/H") {
      queryStr += `
        where 
	      TO_DATE(year_month, 'YYYY-MM-DD') > (NOW() - INTERVAL '2 month')
        AND item_type = $${queryParams.length + 1}`;
      queryParams.push(item_type);
    } else {
      queryStr += `
        where 
	      TO_DATE(year_month, 'YYYY-MM-DD') > (NOW() - INTERVAL '2 month')
        AND item_type = 'W/H'`;
    }

    queryStr += `
    ORDER BY
    TO_DATE(year_month, 'YYYY-MM-DD') desc,
    semi ,
    item_location ASC`;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);

    console.log("today");
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/PlotData", async (req, res) => {
  try {
    const { item_type, semi, item_location, process } = req.query;

    let queryParams = [];
    let queryStr = `
    select
	id,
	create_at,
	item_type,
	semi,
	year_month,
	item_location,
	sum_qty,
	sum_material_cost,
	sum_labor_burden_cost,
	sum_total_cost,
	sum_amount,
	sum_margin,
	process,
	update_date
from
	smart.smart_cost_amout_month
WHERE 1=1
    `;

    if (item_type !== "ALL") {
      queryStr += `
        AND item_type = $${queryParams.length + 1}
      `;
      queryParams.push(item_type);
    }
    if (semi !== "ALL") {
      queryStr += `
        AND semi = $${queryParams.length + 1}
      `;
      queryParams.push(semi);
    }

    if (item_location !== "ALL") {
      queryStr += `
        AND item_location = $${queryParams.length + 1}
      `;
      queryParams.push(item_location);
    }

    if (process !== "ALL") {
      queryStr += `
        AND process = $${queryParams.length + 1}
      `;
      queryParams.push(process);
    }

    queryStr += `
    ORDER BY
    TO_DATE(year_month, 'YYYY-MM-DD') ASC
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);

    console.log("today");
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
