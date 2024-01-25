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

// router.get("/sum-last-status", async (req, res) => {
//   try {
//     const { division, department } = req.query;
//     const result = await query(
    //   `SELECT
    //   TO_CHAR(MAX(TO_DATE(year_month, 'YYYY-MM-DD')), 'YYYY-MM-DD') AS year_month,
    //   cost_type,
    //   SUM(expense_plan) AS total_expense_plan,
    //   SUM(expense_result) AS expense_result,
    //   json_agg(
    //     CASE
    //       WHEN cost_type = 'OUTPUT' THEN
    //         json_build_object(
    //           'actual_sht_qty', actual_sht_qty
    //         )
    //       ELSE
    //         json_build_object(
    //           'baht_per_sheet', baht_per_sheet,
    //           'baht_per_m', baht_per_m,
    //           'baht_per_m2', baht_per_m2
    //         )
    //     END
    //   ) AS baht_data,
    //   CASE
    //     WHEN cost_type = 'OUTPUT' THEN 1
    //     WHEN cost_type = 'LABOR' THEN 2
    //     WHEN cost_type = 'CONSUMABLES' THEN 3
    //     WHEN cost_type = 'CHEMICAL' THEN 4
    //     WHEN cost_type = 'TOOL' THEN 5
    //     WHEN cost_type = 'REPAIRING' THEN 6
    //     ELSE 7
    //   END AS order_by
    // FROM
    //   smart.smart_cost_kpi
    // WHERE
    //   NOT EXISTS (
    //     SELECT 1
    //     FROM smart.smart_cost_kpi AS t2
    //     WHERE t2.cost_type = smart.smart_cost_kpi.cost_type
    //       AND TO_DATE(t2.year_month, 'YYYY-MM-DD') > TO_DATE(smart.smart_cost_kpi.year_month, 'YYYY-MM-DD')
    //   )
    //   AND factory = 'A1'
    //   AND division = $1
    //   AND department = $2
    // GROUP BY
    //   cost_type
    // ORDER BY
    //   order_by ASC;        
//     `,
//       [division, department]
//     );
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });
router.get("/sum-last-status", async (req, res) => {
  try {
    const { division, department, year_month } = req.query;

    const result = await query(
      `SELECT
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
        smart.smart_cost_kpi
      WHERE
        factory = 'A1'
        AND division = $1
        AND department = $2
        ${year_month !== "" ? "AND year_month = $3" : ""}
      GROUP BY
        cost_type
      ORDER BY
        order_by ASC;`,
      [division, department, year_month]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/plot", async (req, res) => {
  try {
    const { division, department, cost_type } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (department === "ALL") {
      queryStr = `
      select
      *
    from
      smart.smart_cost_kpi
    where
      division = $1
      and cost_type = $2
      and factory = 'A1'
    order by
      year_month::date asc
        `;
      queryParams = [division, cost_type];
    } else {
      queryStr = `
      select
	*
from
	smart.smart_cost_kpi
where
	division = $1
	and department = $2
	and cost_type = $3
	and factory = 'A1'
order by
	year_month::date asc
        `;
      queryParams = [division, department, cost_type];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/plot2", async (req, res) => {
  try {
    const { division, department, cost_type,year_month } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (department === "ALL") {
      queryStr = `
     SELECT
  item_code::text,
  year_month,
  item_desc ,
  SUM(expense_result) AS total_expense_result
FROM
  smart.smart_cost_item_month_kpi
WHERE
  factory = 'A1'
  AND division = $1
  AND department = $2
  AND cost_type = $3
  AND year_month = $4
GROUP BY
  item_code,
  year_month,
  item_desc
ORDER BY
  total_expense_result DESC
LIMIT 20
        `;
      queryParams = [division, cost_type,year_month];
    } else {
      queryStr = `
      SELECT
  item_code::text,
  year_month,
  item_desc ,
  SUM(expense_result) AS total_expense_result
FROM
  smart.smart_cost_item_month_kpi
WHERE
  factory = 'A1'
  AND division = $1
  AND department = $2
  AND cost_type = $3
  AND year_month = $4
GROUP BY
  item_code,
  year_month,
  item_desc
ORDER BY
  total_expense_result DESC
LIMIT 20
        `;
      queryParams = [division, department, cost_type,year_month];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/table2", async (req, res) => {
  try {
    const { division, department, cost_type,year_month } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (department === "ALL") {
      queryStr = `
      SELECT
  ROW_NUMBER() OVER () AS id,
  item_code,
  cost_center,
  item_desc ,
  SUM(expense_plan) AS expense_plan,
  SUM(expense_result) AS expense_result
FROM
  smart.smart_cost_item_month_kpi
WHERE
  factory = 'A1'
  AND division = $1
  AND department = $2
  AND cost_type = $3
  AND year_month = $4
GROUP BY
  item_code,
  cost_center,
  item_desc
ORDER BY
  expense_result DESC;
        `;
      queryParams = [division, cost_type,year_month];
    } else {
      queryStr = `
      SELECT
  ROW_NUMBER() OVER () AS id,
  item_code,
  cost_center,
  item_desc ,
  SUM(expense_plan) AS expense_plan,
  SUM(expense_result) AS expense_result
FROM
  smart.smart_cost_item_month_kpi
WHERE
  factory = 'A1'
  AND division = $1
  AND department = $2
  AND cost_type = $3
  AND year_month = $4
GROUP BY
  item_code,
  cost_center,
  item_desc
ORDER BY
  expense_result DESC;    
        `;
      queryParams = [division, department, cost_type,year_month];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/table2CSV", async (req, res) => {
  try {
    const { division, department, cost_type } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (department === "ALL") {
      queryStr = `
      SELECT
  ROW_NUMBER() OVER () AS id,
  year_month,
  item_code,
  cost_center,
  item_desc ,
  SUM(expense_plan) AS expense_plan,
  SUM(expense_result) AS expense_result
FROM
  smart.smart_cost_item_month_kpi
WHERE
  factory = 'A1'
  AND division = $1
  AND department = $2
  AND cost_type = $3
GROUP BY
  item_code,
  cost_center,
  item_desc,
  year_month
ORDER BY
  year_month::Date desc,
  expense_result desc
        `;
      queryParams = [division, cost_type];
    } else {
      queryStr = `
      SELECT
  ROW_NUMBER() OVER () AS id,
  year_month,
  item_code,
  cost_center,
  item_desc ,
  SUM(expense_plan) AS expense_plan,
  SUM(expense_result) AS expense_result
FROM
  smart.smart_cost_item_month_kpi
WHERE
  factory = 'A1'
  AND division = $1
  AND department = $2
  AND cost_type = $3
GROUP BY
  item_code,
  cost_center,
  item_desc,
  year_month
ORDER BY
  year_month::Date desc,
  expense_result desc 
        `;
      queryParams = [division, department, cost_type];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/plot3", async (req, res) => {
  try {
    const { division, department, cost_type, item_code, cost_center } =
      req.query;

    let queryStr = "";
    let queryParams = [];

    if (department === "ALL") {
      queryStr = `
      SELECT
      CONCAT('ITEM - ', item_code) AS item_code,
      year_month,
      cost_center ,
      SUM(expense_plan) AS total_expense_plan,
      SUM(expense_result) AS total_expense_result
    FROM
      smart.smart_cost_item_month_kpi
    WHERE
      factory = 'A1'
      AND division = $1
      AND department = $2
      AND cost_type = $3
      and item_code = $4
      and cost_center = $5
    GROUP BY
      item_code,
      year_month,
      cost_center
    ORDER BY
      year_month asc;
        `;
      queryParams = [division, cost_type];
    } else {
      queryStr = `
      SELECT
      CONCAT('ITEM - ', item_code) AS item_code,
      year_month,
      cost_center ,
      SUM(expense_plan) AS total_expense_plan,
      SUM(expense_result) AS total_expense_result
    FROM
      smart.smart_cost_item_month_kpi
    WHERE
      factory = 'A1'
      AND division = $1
      AND department = $2
      AND cost_type = $3
      and item_code = $4
      and cost_center = $5
    GROUP BY
      item_code,
      year_month,
      cost_center
    ORDER BY
      year_month asc;
        `;
      queryParams = [division, department, cost_type, item_code, cost_center];
    }

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
      smart.smart_cost_kpi`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctdepartment", async (req, res) => {
  try {
    const { division } = req.query;
    const result = await query(
      `select
      distinct department
    from
      smart.smart_cost_kpi
    where division = $1 and 
    factory = 'A1'`,
      [division]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
