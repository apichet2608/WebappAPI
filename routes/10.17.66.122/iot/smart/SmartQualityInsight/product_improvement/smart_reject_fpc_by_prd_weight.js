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

//! Get
router.get("/get_chart_by_weight", async (req, res) => {
  try {
    const { month, product } = req.query;

    let sql = `
        WITH cte AS (
          SELECT 
            TO_CHAR(t.output_date, 'yyyy-mm') AS month,
            SPLIT_PART(t.prd_name, '-', 1) || '-' || SPLIT_PART(t.prd_name, '-', 2) AS product,
            SUM(t.total_input_qty) AS t_total,
            SUM(t.total_reject_qty) AS t_rej
          FROM 
            smart.smart_reject_fpc_by_prd_weight t
          GROUP BY
            TO_CHAR(t.output_date, 'yyyy-mm'),
            SPLIT_PART(t.prd_name, '-', 1) || '-' || SPLIT_PART(t.prd_name, '-', 2)
        ) 
        SELECT 
          sq.month,
          sq.product,
          sq.t_total,
          sq.t_rej,
          (sq.t_rej / sq.t_total) * 100 AS p_rej,
          m.target_p_reject,
          m.unit
        FROM 
          cte sq
        INNER JOIN 
          smart.smart_reject_fpc_product_master m
        ON 
          sq.month = m.month
          AND sq.product = m.product
          AND m.unit = 'TOTAL'
        `;

    const conditions = [];
    const values = [];

    if (month && month !== "ALL") {
      conditions.push(`m.month = $${values.length + 1}`);
      values.push(month);
    }

    if (product && product !== "ALL") {
      conditions.push(`m.product = $${values.length + 1}`);
      values.push(product);
    }

    if (conditions.length > 0) {
      sql += ` AND ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY 
        sq.product ASC,
        sq.month ASC`;

    const result = await query(sql, values);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
