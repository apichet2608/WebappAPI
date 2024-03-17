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

//!GET
router.get("/get_rej_fpc_prd_master", async (req, res) => {
  try {
    const { month, unit, product } = req.query;

    let queryStr = `
          SELECT
              id, create_at, month, unit, product, target_p_reject, model, attached_file
          FROM
              smart.smart_reject_fpc_product_master
          WHERE 1 = 1`;

    const conditions = [];
    const params = [];

    if (month && month !== "") {
      conditions.push(`month = $${params.length + 1}`);
      params.push(month);
    }

    if (unit && unit !== "") {
      conditions.push(`unit = $${params.length + 1}`);
      params.push(unit);
    }

    if (product && product !== "") {
      conditions.push(`product = $${params.length + 1}`);
      params.push(product);
    }

    if (conditions.length > 0) {
      queryStr += " AND " + conditions.join(" AND ");
    }

    queryStr += " ORDER BY month DESC, create_at DESC";

    const result = await query(queryStr, params);

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

//!CREATE
router.post("/create_rej_fpc_prd_master", async (req, res) => {
  try {
    const { month, unit, product, target_p_reject, model } = req.body;

    const queryStr = `
            INSERT INTO smart.smart_reject_fpc_product_master
                (create_at, month, unit, product, target_p_reject, model)
            VALUES
                (NOW() AT TIME ZONE 'Asia/Bangkok', $1, $2, $3, $4, $5)`;

    const result = await query(queryStr, [
      month,
      unit,
      product,
      target_p_reject,
      model,
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

//!UPDATE
router.put("/update_rej_fpc_prd_master/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { month, unit, product, target_p_reject, model } = req.body;

    const queryStr = `
            UPDATE smart.smart_reject_fpc_product_master
            SET
                create_at = NOW() AT TIME ZONE 'Asia/Bangkok',
                month = $1,
                unit = $2,
                product = $3,
                target_p_reject = $4,
                model = $5
            WHERE
                id = $6`;

    const result = await query(queryStr, [
      month,
      unit,
      product,
      target_p_reject,
      model,
      id,
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

//!DELETE
router.delete("/delete_rej_fpc_prd_master/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const queryStr = `
          DELETE FROM smart.smart_reject_fpc_product_master
          WHERE id = $1`;

    const result = await query(queryStr, [id]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
