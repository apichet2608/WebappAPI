const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.71.21",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/", async (req, res) => {
  try {
    const result = await query(`
select
	*
from
	public.jwdb_r23662_actv
  WHERE ptime >= NOW() - INTERVAL '24' hour
order by ptime  asc  
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data", async (req, res) => {
  const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

  if (isNaN(hours)) {
    return res.status(400).send("Hours are required");
  }

  try {
    const result = await pool.query(`
	select
	*
from
	public.jwdb_r23662_actv
where
	ptime >= NOW() - interval '${hours} hour'
order by
	ptime asc
	`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
