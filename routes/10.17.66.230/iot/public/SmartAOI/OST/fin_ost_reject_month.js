const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.230",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);


router.get("/fix-product-month-select", async (req, res) => {
  try {
    const { product, month } = req.query;

    const result = await query(
      `select
      osi_prd_name,
      osr_rej_name,
      month,
      ost_input,
      ost_rej_qty,
      ost_percent_rej
    from
      public.fin_ost_reject_month
    where
      osi_prd_name = $1
      and month = $2
    order by
      month`,
      [product, month]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


router.get("/fix-product-month", async (req, res) => {
  try {
    const { product } = req.query;

    const result = await query(
      `select
      month,
      osi_prd_name,
      osr_rej_name,
      ost_input,
      ost_rej_qty,
      ost_percent_rej
    from
      public.fin_ost_reject_month
    where osi_prd_name = $1
    order by month asc`,
      [product]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


module.exports = router;
