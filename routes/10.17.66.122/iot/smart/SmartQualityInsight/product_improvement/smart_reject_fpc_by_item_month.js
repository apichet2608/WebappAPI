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
router.get("/get_all_by_month", async (req, res) => {
  try {
    const { month, product } = req.query;

    let sql = `SELECT * FROM smart.smart_reject_fpc_by_item_month WHERE 1 = 1`;

    const conditions = [];
    const values = [];

    if (month && month !== "ALL") {
      conditions.push(`month = $${values.length + 1}`);
      values.push(month);
    }

    if (product && product !== "ALL") {
      conditions.push(`product = $${values.length + 1}`);
      values.push(product);
    }

    if (conditions.length > 0) {
      sql += ` AND ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY item_p_reject DESC`;

    const result = await query(sql, values);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
