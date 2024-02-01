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

router.get("/chart", async (req, res) => {
  try {
    const { product_name, lot_date } = req.query;

    let queryString = `SELECT
          id,
          create_at,
          update_date,
          lot_date,
          product_name,
          lot_no,
          total,
          grade_a,
          grade_b,
          grade_c,
          grade_d,
          p_grade_a,
          p_grade_b,
          p_grade_c,
          p_grade_d
      FROM
          fpc.fpc_fin_flas_barcode_grade`;

    const conditions = [];
    const queryParams = [];

    if (product_name && product_name !== "") {
      conditions.push(`product_name = $${queryParams.length + 1}`);
      queryParams.push(product_name);
    }

    if (lot_date && lot_date !== "") {
      conditions.push(
        `lot_date BETWEEN $${queryParams.length + 1} AND ($${
          queryParams.length + 2
        }::date + 1)::timestamp`
      );
      const [start_date, end_date] = lot_date.split(",");
      queryParams.push(start_date);
      queryParams.push(end_date);
    }

    if (conditions.length > 0) {
      queryString += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryString += " ORDER BY lot_date ASC";

    const result = await query(queryString, queryParams);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
