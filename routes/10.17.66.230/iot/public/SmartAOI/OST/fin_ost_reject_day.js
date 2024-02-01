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

router.get("/fix-product-day", async (req, res) => {
  try {
    const { product } = req.query;

    const result = await query(
      `select
      osi_date,
      osi_prd_name,
      osr_rej_name,
      ost_input,
      ost_rej_qty,
      ost_percent_rej
    from
      public.fin_ost_reject_day
    where osi_prd_name = $1
    order by osi_date asc`,
      [product]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/fix-product-day-select", async (req, res) => {
  try {
    const { product, date } = req.query;

    const result = await query(
      `select
      osi_date,
      osi_prd_name,
      osr_rej_name,
      ost_input,
      ost_rej_qty,
      ost_percent_rej
    from
      public.fin_ost_reject_day
    where osi_prd_name = $1
    and osi_date = $2
    order by osi_date asc`,
      [product, date]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-product", async (req, res) => {
  try {
    const result = await query(`
    select
	distinct  osi_prd_name
from
	public.fin_ost_reject_day;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-reject", async (req, res) => {
  try {
    const { product, startdate, stopdate } = req.query;

    const result = await query(
      `select
      distinct  osr_rej_name
      from
      public.fin_ost_reject_day
      where osi_prd_name = $1
      AND osi_date >= $2
      AND osi_date <= $3
      order by osr_rej_name asc
      `,
      [product, startdate, stopdate]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/reject-plot", async (req, res) => {
  try {
    const { startdate, stopdate, product, reject } = req.query;

    const result = await query(
      `SELECT
      osi_date,
      osi_prd_name,
      osr_rej_name,
      ost_input,
      ost_rej_qty,
      ost_percent_rej
  FROM
      public.fin_ost_reject_day
  WHERE
      osi_date >= $1
      AND osi_date <= $2
      and osi_prd_name = $3
      and osr_rej_name = $4
  order by osi_date asc`,
      [startdate, stopdate, product, reject]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
