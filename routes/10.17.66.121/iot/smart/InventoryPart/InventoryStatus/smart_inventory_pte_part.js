const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

//TODO: READ
router.get("/main_read", async (req, res) => {
  try {
    const { sipmc_item_code, sipmc_loc, stockFilter } = req.query;

    let queryString = `
      SELECT
        sipp.id,
        sipp.create_date,
        sipp.buyer,
        sipp.item_desc,
        sipmc.loc AS sipmc_loc,
        sipp.unit,
        sipp.vend_code,
        sipp.vend_desc,
        sipp.leadtime,
        sipp.qty_1_est,
        sipmc."item_code" AS sipmc_item_code,
        sipmc.min_order,
        sipmc.max_order,
        sipp.stock,
        sipp.scrap,
        sipp.vend_stock,
        sipp.po_balance,
        sipp.po_vend,
        sipp.qty_1_issue,
        sipp.sum_nvl_zaiko,
        sipp.sum_nvl_all_qty,
        sipp.balance
      FROM
        smart.smart_inventory_pte_part sipp
      LEFT JOIN
        smart.smart_inventory_pte_minmax_control sipmc
      ON
        sipp.loc = sipmc.loc AND sipp.item_code = sipmc."item_code"
    `;

    const conditions = [];
    const queryParams = [];

    if (sipmc_item_code && sipmc_item_code !== "") {
      conditions.push(`sipmc."item_code" = $${queryParams.length + 1}`);
      queryParams.push(sipmc_item_code);
    }

    if (sipmc_loc && sipmc_loc !== "") {
      conditions.push(`sipmc.loc = $${queryParams.length + 1}`);
      queryParams.push(sipmc_loc);
    }

    if (stockFilter) {
      switch (stockFilter) {
        case "less":
          conditions.push("sipp.stock < sipmc.min_order");
          break;
        case "in":
          conditions.push("sipmc.min_order IS NOT NULL");
          conditions.push("sipmc.max_order IS NOT NULL");
          conditions.push(
            "sipp.stock BETWEEN sipmc.min_order AND sipmc.max_order"
          );
          break;
        case "over":
          conditions.push("sipp.stock > COALESCE(sipmc.max_order)");
          break;
        case "na":
          conditions.push(
            "(sipmc.min_order IS NULL OR sipmc.max_order IS NULL)"
          );
          break;
        default:
          break;
      }
    }

    if (conditions.length > 0) {
      queryString += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryString += ` ORDER BY sipp.create_date DESC`;

    const result = await pool.query(queryString, queryParams);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});

//*Count order stock API
router.get("/count_order_stock", async (req, res) => {
  try {
    const { sipmc_item_code, sipmc_loc } = req.query;

    let queryString = `
      SELECT
        COUNT(CASE WHEN sipp.stock < sipmc.min_order THEN 1 END) AS less_stock,
        COUNT(CASE WHEN sipp.stock BETWEEN sipmc.min_order AND sipmc.max_order THEN 1 END) AS in_stock,
        COUNT(CASE WHEN sipp.stock > sipmc.max_order THEN 1 END) AS over_stock,
        COUNT(CASE WHEN sipmc.min_order IS NULL OR sipmc.max_order IS NULL THEN 1 END) AS null_min_or_max
      FROM
        smart.smart_inventory_pte_part sipp
      LEFT JOIN
        smart.smart_inventory_pte_minmax_control sipmc
      ON
        sipp.loc = sipmc.loc AND sipp.item_code = sipmc."item_code"
    `;

    const conditions = [];
    const queryParams = [];

    if (sipmc_item_code && sipmc_item_code !== "") {
      conditions.push(`sipmc."item_code" = $${queryParams.length + 1}`);
      queryParams.push(sipmc_item_code);
    }

    if (sipmc_loc && sipmc_loc !== "") {
      conditions.push(`sipmc.loc = $${queryParams.length + 1}`);
      queryParams.push(sipmc_loc);
    }

    if (conditions.length > 0) {
      queryString += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = await pool.query(queryString, queryParams);

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
