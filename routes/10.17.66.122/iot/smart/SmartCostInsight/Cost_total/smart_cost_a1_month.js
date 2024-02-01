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

router.get("/tablefix2month", async (req, res) => {
  try {
    const result = await pool.query(
      `
     SELECT
    id,
    factory,
    year_month,
    cost_type,
    expense_plan,
    expense_result,
    expense_total_plan,
    expense_total_act
FROM
    smart.smart_cost_a1_month
WHERE 
    TO_DATE(year_month, 'YYYY-MM-DD') > (NOW() - INTERVAL '2 month')
ORDER BY
    TO_DATE(year_month, 'YYYY-MM-DD') DESC,
    cost_type ASC;

      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Cardsummary", async (req, res) => {
  try {
    const {year_month} = req.query;

    let queryParams = [];
    let queryStr = `
    SELECT
    id,
    factory,
    year_month,
    cost_type,
    expense_plan,
    expense_result,
    expense_total_plan,
    expense_total_act
FROM
    smart.smart_cost_a1_month
WHERE 1=1
    `;

    if (year_month !== "ALL") {
      queryStr += `
        AND TO_DATE(year_month, 'YYYY-MM') = $${queryParams.length + 1}
      `;
      queryParams.push(year_month);
    }
  
  
    queryStr += `
    ORDER BY
    TO_DATE(year_month, 'YYYY-MM-DD') DESC,
    cost_type ASC;
    `;

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
    const {cost_type} = req.query;

    let queryParams = [];
    let queryStr = `
    SELECT
    id,
    factory,
    year_month,
    cost_type,
    expense_plan,
    expense_result,
    expense_total_plan,
    expense_total_act
FROM
    smart.smart_cost_a1_month
WHERE 1=1
    `;

    if (cost_type !== "ALL") {
      queryStr += `
        AND cost_type = $${queryParams.length + 1}
      `;
      queryParams.push(cost_type);
    }
  
  
    queryStr += `
    ORDER BY
    TO_DATE(year_month, 'YYYY-MM-DD') ASC,
    cost_type ASC;
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
