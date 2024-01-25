const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// const pool = new Pool({
//   host: "10.17.71.57",
//   port: 5432,
//   user: "postgres",
//   password: "fujikura",
//   database: "smart_factory", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
// });

const pool = new Pool({
  host: "10.17.77.111",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});
const query = (text, params) => pool.query(text, params);

router.get("/distinctaoi_prd_name", async (req, res) => {
  try {
    const result = await query(`
select
	distinct aoi_prd_name
from
	public.cfm_aoi_reject_day
order by
	aoi_prd_name
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/cfm_aoi_reject_day_7day", async (req, res) => {
  try {
    const { aoi_side, aoi_prd_name } = req.query;

    const result = await query(
      `select
	*
from
	public.cfm_aoi_reject_day
where
	aoi_side = $1
	and aoi_prd_name = $2
	and aoi_date >= CURRENT_DATE - interval '7 days'
order by aoi_date`,
      [aoi_side, aoi_prd_name]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/cfm_aoi_reject_day_1day", async (req, res) => {
  try {
    const { aoi_side, aoi_prd_name } = req.query;
    const result = await query(
      `select
	*
from
	public.cfm_aoi_reject_day
where
	aoi_side = $1
	and aoi_prd_name = $2
	and aoi_date >= CURRENT_DATE - interval '1 days'
order by aoi_date`,
      [aoi_side, aoi_prd_name]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/cfm_aoi_reject_day_30day_2", async (req, res) => {
  try {
    const { aoi_side, aoi_prd_name } = req.query;

    const result = await query(
      `select
	*
from
	public.cfm_aoi_reject_day
where
	aoi_side = $1
	and aoi_prd_name = $2
	and aoi_date >= CURRENT_DATE - interval '3 months'
order by aoi_date`,
      [aoi_side, aoi_prd_name]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/cfm_aoi_reject_day_30day", async (req, res) => {
  try {
    const { aoi_side, aoi_prd_name } = req.query;

    const result = await query(
      `select
	*
from
	public.cfm_aoi_reject_day
where
	aoi_side = $1
	and aoi_prd_name = $2
	and aoi_date >= CURRENT_DATE - interval '1 months'
order by aoi_date`,
      [aoi_side, aoi_prd_name]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/cfm_aoi_reject_day_90day", async (req, res) => {
  try {
    const { aoi_side, aoi_prd_name } = req.query;

    const result = await query(
      `select
	to_char(aoi_date,
	'YYYY-MM') as month,
	aoi_prd_name,
	aoi_side,
	aoi_rej_code,
	rej_name,
	SUM(input_pcs_distinct) as sum_input_pcs,
	SUM(rej_qty_distinct) as sum_rej_qty,
	SUM(rej_qty_distinct) / SUM(input_pcs_distinct) * 100 as month_reject_percentage
from
	(
	select
		aoi_date,
		aoi_prd_name,
		aoi_side,
		aoi_rej_code,
		rej_name,
		SUM(distinct sum_input_pcs) as input_pcs_distinct,
		SUM(distinct sum_rej_qty) as rej_qty_distinct
	from
		public.cfm_aoi_reject_day
	group by
		aoi_date,
		aoi_prd_name,
		aoi_side,
		aoi_rej_code,
		rej_name
) t
where
  aoi_side = $1
	and aoi_prd_name = $2
group by
	to_char(aoi_date,
	'YYYY-MM'),
	aoi_prd_name,
	aoi_side,
	aoi_rej_code,
	rej_name
order by
	to_char(aoi_date,
	'YYYY-MM'),
	aoi_prd_name;
`,
      [aoi_side, aoi_prd_name]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

module.exports = router;
