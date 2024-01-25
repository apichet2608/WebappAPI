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

router.get("/sum-last-status", async (req, res) => {
  try {
    const { division } = req.query;
    const result = await query(
      `SELECT
      TO_CHAR(MAX(TO_DATE(year_month, 'YYYY-MM-DD')), 'YYYY-MM-DD') AS year_month,
      cost_type,
      SUM(expense_plan) AS total_expense_plan,
      SUM(expense_result) AS expense_result,
      json_agg(
        CASE
          WHEN cost_type = 'OUTPUT' THEN
            json_build_object(
              'actual_sht_qty', actual_sht_qty
            )
          ELSE
            json_build_object(
              'baht_per_sheet', baht_per_sheet,
              'baht_per_m', baht_per_m,
              'baht_per_m2', baht_per_m2
            )
        END
      ) AS baht_data,
      CASE
        WHEN cost_type = 'OUTPUT' THEN 1
        WHEN cost_type = 'LABOR' THEN 2
        WHEN cost_type = 'CONSUMABLES' THEN 3
        WHEN cost_type = 'CHEMICAL' THEN 4
        WHEN cost_type = 'TOOL' THEN 5
        WHEN cost_type = 'REPAIRING' THEN 6
        ELSE 7
      END AS order_by
    FROM
      smart.smart_cost_div_kpi
    WHERE
      NOT EXISTS (
        SELECT 1
        FROM smart.smart_cost_div_kpi AS t2
        WHERE t2.cost_type = smart.smart_cost_div_kpi.cost_type
          AND TO_DATE(t2.year_month, 'YYYY-MM-DD') > TO_DATE(smart.smart_cost_div_kpi.year_month, 'YYYY-MM-DD')
      )
      AND factory = 'A1'
      AND division = $1
    GROUP BY
      cost_type
    ORDER BY
      order_by ASC 
    `,
      [division]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/plot", async (req, res) => {
  try {
    const { division, cost_type } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
    *
  from
    smart.smart_cost_div_kpi
  where
    division = $1
    and cost_type = $2
    and factory = 'A1'
  order by
    year_month::date asc
        `;
    queryParams = [division, cost_type];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctdivision", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct division
    from
      smart.smart_cost_div_kpi`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
