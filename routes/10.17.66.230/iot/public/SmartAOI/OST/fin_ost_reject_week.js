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


router.get("/fix-product-week-select", async (req, res) => {
  try {
    const { product, week } = req.query;

    const result = await query(
      `select
      osi_prd_name,
      osr_rej_name,
      week,
      ost_input,
      ost_rej_qty,
      ost_percent_rej
    from
      public.fin_ost_reject_week
    where
      osi_prd_name = $1
      and week LIKE $2
    order by
    week`,
      [product, week]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/fix-product-week", async (req, res) => {
  try {
    const { product } = req.query;

    const result = await query(
      `select
      week,
      osi_prd_name,
      osr_rej_name,
      ost_input,
      ost_rej_qty,
      ost_percent_rej
    from
      public.fin_ost_reject_week
    where osi_prd_name = $1
    order by week asc`,
      [product]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
