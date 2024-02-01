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

//* Main API
router.get("/smart_reject_fpc_product_item", async (req, res) => {
  try {
    const { month, product, unit } = req.query;
    const queryParams = [];

    let sqlQuery = `
      SELECT 
        bm.month,
        bm.product,
        bm.unit,
        (bm.reject_m_pc / bm.input_m_pc) * 100 AS unit_p_reject,
        m.target_p_reject,
        m.attached_file
      FROM  
      (
        SELECT 
          DISTINCT
          TO_CHAR(bd.output_date, 'yyyy-mm') AS month,
          bd.product,
          bd.unit,
          SUM(bd.input_pc) OVER (PARTITION BY TO_CHAR(bd.output_date, 'yyyy-mm'), bd.product, bd.unit) AS input_m_pc,
          SUM(bd.reject_pc) OVER (PARTITION BY TO_CHAR(bd.output_date, 'yyyy-mm'), bd.product, bd.unit) AS reject_m_pc 
        FROM 
        (
          SELECT 
            t.output_date,
            SPLIT_PART(t.prd_name, '-', 1) || '-' || SPLIT_PART(t.prd_name, '-', 2) AS product,
            t.unit,
            MAX(t.total_input_qty) AS input_pc,
            SUM(t.reject_qty) AS reject_pc
          FROM  
            smart.smart_reject_fpc_product_item t
          GROUP BY
            t.output_date,
            SPLIT_PART(t.prd_name, '-', 1) || '-' || SPLIT_PART(t.prd_name, '-', 2),
            t.unit 
        ) bd 
        ORDER BY 
          month DESC
      ) bm
      INNER JOIN 
        smart.smart_reject_fpc_product_master m
      ON
        bm.month = m.month 
        AND bm.unit = m.unit
        AND bm.product = m.product 
    `;

    if (product && product !== "ALL") {
      queryParams.push(product);
      sqlQuery += ` WHERE bm.product = $${queryParams.length}`;
    }

    if (unit && unit !== "ALL") {
      queryParams.push(unit);
      sqlQuery += `${
        product && product !== "ALL" ? " AND" : " WHERE"
      } bm.unit = $${queryParams.length}`;
    }

    if (month && month !== "ALL") {
      queryParams.push(month);
      sqlQuery += `${
        (product && product !== "ALL") || (unit && unit !== "ALL")
          ? " AND"
          : " WHERE"
      } bm.month = $${queryParams.length}`;
    }

    sqlQuery += `
      ORDER BY 
        bm.month DESC,
        bm.product ASC,
        CASE 
          WHEN bm.unit = 'PTH' THEN 1
          WHEN bm.unit = 'CFM' THEN 2
          WHEN bm.unit = 'CVC' THEN 3
          WHEN bm.unit = 'LPI' THEN 4
          WHEN bm.unit = 'SFT' THEN 5
          WHEN bm.unit = 'FIN' THEN 6
        END
    `;

    const result = await pool.query(sqlQuery, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

//* Pareto and Subtable API
router.get("/smart_reject_fpc_product_item_pareto", async (req, res) => {
  try {
    const { month, product, unit, reject_name } = req.query;

    const queryParams = [];

    let sqlQuery = `
      WITH by_date_cte AS (	
        SELECT
          t.output_date,
          SPLIT_PART(t.prd_name, '-', 1) || '-' || SPLIT_PART(t.prd_name, '-', 2) AS product,
          t.unit,
          t.reject_code || ' ' || t.reject_desc AS reject_name,
          MAX(t.total_input_qty) AS input_pc,
          SUM(t.reject_qty) AS reject_pc
        FROM 	
          smart.smart_reject_fpc_product_item t
        GROUP BY
          t.output_date,
          SPLIT_PART(t.prd_name, '-', 1) || '-' || SPLIT_PART(t.prd_name, '-', 2),
          t.unit,
          t.reject_code || ' ' || t.reject_desc
      ),
      by_month_cte AS (
        SELECT
          DISTINCT
          TO_CHAR(bd.output_date, 'yyyy-mm') AS month,
          bd.product,
          bd.unit,
          bd.reject_name,
          SUM(bd.input_pc) OVER (PARTITION BY TO_CHAR(bd.output_date, 'yyyy-mm'), bd.product, bd.unit, bd.reject_name) AS input_m_pc,
          SUM(bd.reject_pc) OVER (PARTITION BY TO_CHAR(bd.output_date, 'yyyy-mm'), bd.product, bd.unit, bd.reject_name) AS reject_m_pc
        FROM
          by_date_cte bd
      )
      SELECT	
        bm.month,
        bm.product,
        bm.unit,
        bm.reject_name,
        (bm.reject_m_pc / bm.input_m_pc) * 100 AS unit_p_reject
      FROM by_month_cte bm
      INNER JOIN
        smart.smart_reject_fpc_product_master m
        ON
          bm.month = m.month
          AND bm.unit = m.unit
          AND bm.product = m.product
    `;

    if (product && product !== "ALL") {
      queryParams.push(product);
      sqlQuery += ` WHERE bm.product = $${queryParams.length}`;
    }

    if (unit && unit !== "ALL") {
      queryParams.push(unit);
      sqlQuery += `${
        product && product !== "ALL" ? " AND" : " WHERE"
      } bm.unit = $${queryParams.length}`;
    }

    if (month && month !== "ALL") {
      queryParams.push(month);
      sqlQuery += `${
        (product && product !== "ALL") || (unit && unit !== "ALL")
          ? " AND"
          : " WHERE"
      } bm.month = $${queryParams.length}`;
    }

    if (reject_name && reject_name !== "ALL") {
      queryParams.push(reject_name);
      sqlQuery += `${
        (product && product !== "ALL") ||
        (unit && unit !== "ALL") ||
        (month && month !== "ALL")
          ? " AND"
          : " WHERE"
      } bm.reject_name = $${queryParams.length}`;
    }

    sqlQuery += `
      ORDER BY 
        bm.month DESC,
        bm.product ASC,
        CASE 
          WHEN bm.unit = 'PTH' THEN 1
          WHEN bm.unit = 'CFM' THEN 2
          WHEN bm.unit = 'CVC' THEN 3
          WHEN bm.unit = 'LPI' THEN 4
          WHEN bm.unit = 'SFT' THEN 5
          WHEN bm.unit = 'FIN' THEN 6
        END,
        unit_p_reject DESC
    `;

    const result = await pool.query(sqlQuery, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

//* Day API
router.get("/smart_reject_fpc_product_item_day", async (req, res) => {
  try {
    const { output_date, reject_desc, unit, prd_name } = req.query;

    const queryParams = [];

    let sqlQuery = `
      SELECT
        to_char(output_date, 'yyyy-mm-dd') AS output_date,
        prd_name,
        unit,
        reject_desc,
        percent_rej
      FROM
        smart.smart_reject_fpc_product_item
      WHERE
        (to_char(output_date, 'yyyy-mm') = $1 OR $1 IS NULL)
        AND (split_part(prd_name,'-',1) || '-' || split_part(prd_name, '-', 2) = $2 OR $2 IS NULL)
        AND (unit = $3 OR $3 IS NULL)
        AND (reject_desc = $4 OR $4 IS NULL)
      ORDER BY
        output_date DESC
    `;

    queryParams.push(output_date, prd_name, unit, reject_desc);

    const result = await pool.query(sqlQuery, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
