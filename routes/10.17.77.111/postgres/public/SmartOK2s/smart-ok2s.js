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

router.get("/all", async (req, res) => {
  try {
    const { startdate, stopdate } = req.query;
    const result = await query(
      `
select
	*
from
	public.ok2s
where create_date >= $1 and create_date  <= $2 
order by id 
    `,
      [startdate, stopdate + " 23:59:59"]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/product", async (req, res) => {
  try {
    const { product, startdate, stopdate } = req.query;

    const result = await query(
      `select
	*
from
	public.ok2s
where 
	f_product  = $1 and
	create_date >= $2 and create_date  <= $3
	order by id `,
      [product, startdate, stopdate + " 23:59:59"]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/all/final", async (req, res) => {
  try {
    const { startdate, stopdate, status } = req.query;

    const result = await query(
      `select
	*
from
	public.ok2s
where 
	create_date >= $1 and create_date  <= $2 
	and final_report = $3
	order by id `,
      [startdate, stopdate + " 23:59:59", status]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/product/final", async (req, res) => {
  try {
    const { product, startdate, stopdate, status } = req.query;

    const result = await query(
      `select
	*
from
	public.ok2s
where 
	f_product  = $1 and
	create_date >= $2 and create_date  <= $3 
	and final_report = $4
	order by id `,
      [product, startdate, stopdate + " 23:59:59", status]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/all/first", async (req, res) => {
  try {
    const { startdate, stopdate, status } = req.query;

    const result = await query(
      `select
	*
from
	public.ok2s
where 
	create_date >= $1 and create_date  <= $2 
	and first_report = $3
	order by id `,
      [startdate, stopdate + " 23:59:59", status]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/product/first", async (req, res) => {
  try {
    const { product, startdate, stopdate, status } = req.query;

    const result = await query(
      `select
	*
from
	public.ok2s
where 
	f_product  = $1 and
	create_date >= $2 and create_date  <= $3 
	and first_report = $4
	order by id `,
      [product, startdate, stopdate + " 23:59:59", status]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/all/sample", async (req, res) => {
  try {
    const { startdate, stopdate, status } = req.query;

    const result = await query(
      `select
	*
from
	public.ok2s
where 
	create_date >= $1 and create_date  <= $2 
	and final_report = $3
	order by id `,
      [startdate, stopdate + " 23:59:59", status]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/product/sample", async (req, res) => {
  try {
    const { product, startdate, stopdate, status } = req.query;

    const result = await query(
      `select
	*
from
	public.ok2s
where 
	f_product  = $1 and
	create_date >= $2 and create_date  <= $3 
	and final_report = $4
	order by id `,
      [product, startdate, stopdate + " 23:59:59", status]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-f_product", async (req, res) => {
  try {
    const result = await query(`
select
	distinct  f_product 
from
	public.ok2s
order by f_product 
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// PUT route to update data
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sample_anc } = req.body;

    // Convert sample_anc to Date object
    const sampleAncDate = new Date(sample_anc);

    // Calculate first_report_date and final_report_date
    const firstReportDate = new Date(
      sampleAncDate.getTime() + 9 * 24 * 60 * 60 * 1000
    );
    const finalReportDate = new Date(
      sampleAncDate.getTime() + 42 * 24 * 60 * 60 * 1000
    );

    const result = await query(
      `UPDATE ok2s
       SET sample_anc = $1,
           first_report_date = $2,
           final_report_date = $3
       WHERE id = $4
      `,
      [sample_anc, firstReportDate, finalReportDate, id]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

module.exports = router;
