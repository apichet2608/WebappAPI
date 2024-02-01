const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.111",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/fix-process-product-day-select", async (req, res) => {
  try {
    const { process, product, date } = req.query;

    const result = await query(
      `select
      id,
      station_process,
      sendresultdetails_product,
      "date" ,
      uut_attributes_defect_desc,
      defect_count
    from
      public.foxsystem_json_backup_header_defect_day
    where
      station_process = $1
      and sendresultdetails_product = $2
      and "date" like $3
      and uut_attributes_defect_desc != 'NA'
    order by
      id`,
      [process, product, date]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/fix-process-product-month-select", async (req, res) => {
  try {
    const { process, product, month } = req.query;

    const result = await query(
      `select
      id,
      station_process,
      sendresultdetails_product,
      "month" ,
      uut_attributes_defect_desc,
      defect_count
    from
      public.foxsystem_json_backup_header_defect_month
    where
      station_process = $1
      and sendresultdetails_product = $2
      and "month" like $3
      and uut_attributes_defect_desc != 'NA'
    order by
      id`,
      [process, product, month]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/fix-process-product-week-select", async (req, res) => {
  try {
    const { process, product, week } = req.query;

    const result = await query(
      `select
      id,
      station_process,
      sendresultdetails_product,
      "week" ,
      uut_attributes_defect_desc,
      defect_count
    from
      public.foxsystem_json_backup_header_defect_week
    where
      station_process = $1
      and sendresultdetails_product = $2
      and "week" like $3
      and uut_attributes_defect_desc != 'NA'
    order by
      id`,
      [process, product, week]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/fix-process-product-day", async (req, res) => {
  try {
    const { process, product } = req.query;

    const result = await query(
      `select
      id,
      station_process,
      sendresultdetails_product,
      "date" ,
      uut_attributes_defect_desc,
      defect_count
    from
      public.foxsystem_json_backup_header_defect_day
    where
      station_process = $1
      and sendresultdetails_product = $2
      and uut_attributes_defect_desc != 'NA'
    order by
      id`,
      [process, product]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/fix-process-product-week", async (req, res) => {
  try {
    const { process, product } = req.query;

    const result = await query(
      `select
      id,
      station_process,
      sendresultdetails_product,
      week,
      uut_attributes_defect_desc,
      defect_count
    from
      public.foxsystem_json_backup_header_defect_week fjbhdw 
    where
      station_process = $1
      and sendresultdetails_product = $2
      and uut_attributes_defect_desc != 'NA'
    order by
      id`,
      [process, product]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/fix-process-product-month", async (req, res) => {
  try {
    const { process, product } = req.query;

    const result = await query(
      `select
      id,
      station_process,
      sendresultdetails_product,
      "month",
      uut_attributes_defect_desc,
      defect_count
    from
      public.foxsystem_json_backup_header_defect_month
    where
      station_process = $1
      and sendresultdetails_product = $2
      and uut_attributes_defect_desc != 'NA'
    order by
      id`,
      [process, product]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-station-process", async (req, res) => {
  try {
    const result = await query(`
    select
    distinct station_process
  from
    foxsystem_json_backup_header_defect_day fjbhdd
  order by
    station_process
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-sendresultdetails-product", async (req, res) => {
  try {
    const result = await query(`
    select
    distinct sendresultdetails_product
  from
    foxsystem_json_backup_header_defect_day fjbhdd
  order by
    sendresultdetails_product
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
