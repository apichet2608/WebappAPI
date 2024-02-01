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

router.get("/smart_cost_acc_code", async (req, res) => {
  try {
    let sqlQuery = `
        SELECT 
          *
        FROM 
          smart.smart_cost_acc_code
        WHERE
          account_code IN ('68040000', '68042000', '68049000', '68989920', '68984000','68044100')
        ORDER BY
          issue_date DESC;
      `;

    const result = await pool.query(sqlQuery);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

router.get("/smart_cost_acc_code_month", async (req, res) => {
  try {
    const { month_code, account_code } = req.query;

    let sqlQuery = `
      SELECT 
        SUBSTRING(scac.issue_date FROM 1 FOR 7) AS month_code,
        scac.account_code,
        scac.account_name,
        scapp.plan,
        SUM(CAST(scac.amount AS numeric)) AS actual
      FROM 
        smart.smart_cost_acc_code scac
      INNER JOIN 
        smart.smart_cost_acc_pte_plan scapp
      ON 
        SUBSTRING(scac.issue_date FROM 1 FOR 7) = scapp.month
        AND scac.account_code = scapp.item_code
      WHERE 
        scac.account_code IN ('68040000', '68042000', '68049000', '68989920', '68984000','68044100')
    `;

    const queryParams = [];

    if (month_code && month_code !== "ALL") {
      sqlQuery += `AND SUBSTRING(scac.issue_date FROM 1 FOR 7) = $1 `;
      queryParams.push(month_code);
    }

    if (account_code && account_code !== "ALL") {
      sqlQuery += `AND scac.account_code = $${queryParams.length + 1} `;
      queryParams.push(account_code);
    }

    sqlQuery += `
      GROUP BY 
        SUBSTRING(scac.issue_date FROM 1 FOR 7),
        scac.account_code,
        scac.account_name,
        scapp.plan
      ORDER BY 
        month_code DESC, 
        scac.account_code;
    `;

    const result = await pool.query(sqlQuery, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

router.get("/smart_cost_acc_code_day", async (req, res) => {
  try {
    const { account_code } = req.query;

    let sqlQuery = `
        SELECT 
          issue_date, 
          account_code, 
          account_name,
          SUM(CAST(amount AS numeric)) AS actual
        FROM
          smart.smart_cost_acc_code
        WHERE
          account_code IN ('68040000', '68042000', '68049000', '68989920', '68984000','68044100')
      `;

    const queryParam = [];

    if (account_code && account_code !== "ALL") {
      sqlQuery += `AND account_code = $1 `;
      queryParam.push(account_code);
    }

    sqlQuery += `
        GROUP BY
          issue_date, account_code, account_name  
        ORDER BY
          issue_date DESC, account_code;
      `;

    const result = await pool.query(sqlQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
