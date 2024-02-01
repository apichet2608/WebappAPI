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

router.get("/distinct-build", async (req, res) => {
  try {
    const { date } = req.query;

    const result = await query(
      `select
distinct  buiding 
from
smart.smart_machine_oee
where date_time = $1`,
      [date]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/fix-mccode", async (req, res) => {
  try {
    const { date, build, mc } = req.query;

    const result = await query(
      `select
*
from
smart.smart_machine_oee
where date_time = $1
and buiding = $2
and mc_code =$3`,
      [date, build, mc]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-process", async (req, res) => {
  try {
    const { date, build } = req.query;

    const result = await query(
      `select
distinct  process_group  
from
smart.smart_machine_oee
where date_time = $1
and buiding = $2`,
      [date, build]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-process-all", async (req, res) => {
  try {
    const { date } = req.query;

    const result = await query(
      `select
distinct  process_group  
from
smart.smart_machine_oee
where date_time = $1`,
      [date]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-all-all", async (req, res) => {
  try {
    const { date } = req.query;

    const result = await query(
      `select
*
from
smart.smart_machine_oee
where date_time = $1`,
      [date]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-all-notall", async (req, res) => {
  try {
    const { date, process } = req.query;

    const result = await query(
      `select
*
from
smart.smart_machine_oee
where date_time = $1
and process_group = $2`,
      [date, process]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-notall-all", async (req, res) => {
  try {
    const { date, build } = req.query;

    const result = await query(
      `select
*
from
smart.smart_machine_oee
where date_time = $1
and buiding = $2`,
      [date, build]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-notall-notall", async (req, res) => {
  try {
    const { date, build, process } = req.query;
    console.log(process);
    const result = await query(
      `select
*
from
smart.smart_machine_oee
where date_time = $1
and buiding = $2
and process_group = $3`,
      [date, build, process]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-all-all-plot", async (req, res) => {
  try {
    const { date, mc_code } = req.query;

    const result = await query(
      `SELECT *
      FROM smart.smart_machine_oee
      WHERE date_time >= $1::DATE - INTERVAL '90 days'
      AND date_time <= $1::DATE
      AND mc_code = $2
      order by date_time asc`,
      [date, mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-all-notall-plot", async (req, res) => {
  try {
    const { date, process, mc_code } = req.query;

    const result = await query(
      `SELECT *
      FROM smart.smart_machine_oee
      WHERE date_time >= $1::DATE - INTERVAL '90 days'
      AND date_time <= $1::DATE
      AND process_group = $2
      AND mc_code = $3
      order by date_time asc`,
      [date, process, mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-notall-all-plot", async (req, res) => {
  try {
    const { date, build, mc_code } = req.query;

    const result = await query(
      `SELECT *
      FROM smart.smart_machine_oee
      WHERE date_time >= $1::DATE - INTERVAL '90 days' 
      AND date_time <= $1::DATE
      AND buiding = $2
      AND mc_code = $3
      order by date_time asc`,
      [date, build, mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-notall-notall-plot", async (req, res) => {
  try {
    const { date, build, process, mc_code } = req.query;

    const result = await query(
      `SELECT *
      FROM smart.smart_machine_oee
      WHERE date_time >= $1::DATE - INTERVAL '90 days'
      AND date_time <= $1::DATE
      AND buiding = $2
      AND process_group = $3
      AND mc_code = $4
      order by date_time asc`,
      [date, build, process, mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
