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

router.get("/page1/plot1", async (req, res) => {
  try {
    const { division, department, cost_type, item_code, cost_center } =
      req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
    create_at,
    factory,
    division,
    department,
    cost_center,
    cost_center_name,
    item_code,
    item_desc,
    cost_type,
    year_month_date,
    expense_plan,
    expense_result,
    id,
    update_date
  from
    smart.smart_cost_item_daily_kpi
  where
    factory = 'A1'
    and year_month_date :: Date >= NOW() - interval '35 days'
    and division = $1
    and department = $2
    and cost_type = $3
    and item_code  = $4
    and cost_center =  $5
  order by
    year_month_date :: Date asc  
        `;
    queryParams = [division, department, cost_type, item_code, cost_center];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/pagetotal/plotdailybyitemcode", async (req, res) => {
  try {
    const { item_code } =
      req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
    create_at,
    factory,
    division,
    department,
    cost_center,
    cost_center_name,
    item_code,
    item_desc,
    cost_type,
    year_month_date,
    expense_plan,
    expense_result,
    id,
    update_date
  from
    smart.smart_cost_item_daily_kpi
  where
    factory = 'A1'
    and year_month_date :: Date >= NOW() - interval '35 days'
    and division = $1
    and department = $2
    and cost_type = $3
    and item_code  = $4
    and cost_center =  $5
  order by
    year_month_date :: Date asc  
        `;
    queryParams = [division, department, cost_type, item_code, cost_center];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});



module.exports = router;
