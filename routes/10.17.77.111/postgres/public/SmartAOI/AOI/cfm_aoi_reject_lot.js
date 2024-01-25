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


router.get("/filteredDataAoiSides", async (req, res) => {
  try {
    const product = req.query.product || "";

    const result = await query(
      `select
	distinct aoi_side
from
	public.cfm_aoi_reject_lot
where
	aoi_prd_name = $1`,
      [product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/filteredData7day", async (req, res) => {
  try {
    const { aoi_side, product } = req.query;
    const result = await query(
      `select
	*
from
	public.cfm_aoi_reject_lot
where
	aoi_side = $1
	and aoi_prd_name = $2
	and aoi_date::Timestamp  >= CURRENT_DATE - interval '7 days'`,
      [aoi_side, product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/filteredData1day", async (req, res) => {
  try {
    const { aoi_side, product } = req.query;

    const result = await query(
      `select
	*
from
	public.cfm_aoi_reject_lot
where
	aoi_side = $1
	and aoi_prd_name = $2 AND aoi_date >= CURRENT_DATE - INTERVAL '1 days'`,
      [aoi_side, product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/filteredData1m", async (req, res) => {
  try {
    const { aoi_side, product } = req.query;

    const result = await query(
      `select
	*
from
	public.cfm_aoi_reject_lot
where
	aoi_side = $1
	and aoi_prd_name = $2
      and aoi_date >= CURRENT_DATE - interval '1 months'`,
      [aoi_side, product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/filteredData3m", async (req, res) => {
  try {
    const { aoi_side, product } = req.query;

    const result = await query(
      `select
	*
from
	public.cfm_aoi_reject_lot
where
	aoi_side = $1
	and aoi_prd_name = $2
      and aoi_date >= CURRENT_DATE - interval '3 months'`,
      [aoi_side, product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});



module.exports = router;
