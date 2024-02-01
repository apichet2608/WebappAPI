const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.118",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinctjob_name", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct job_name
    from
      public.fpc_raoi_set_camtek
    order by
      job_name desc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctlayer_no", async (req, res) => {
  try {
    const { job_name } = req.query;
    let queryStr = `
    select
      distinct layer_no
    from
      public.fpc_raoi_set_camtek
    `;

    let queryParams = [];

    if (job_name !== "ALL") {
      queryStr += `
        where
        job_name = $1
      `;
      queryParams.push(job_name);
    }

    queryStr += `
    order by
    layer_no desc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/table", async (req, res) => {
  try {
    const { job_name, layer_no } = req.query;

    let queryStr = `
    SELECT *
    FROM public.fpc_raoi_set_camtek
    `;

    let queryParams = [];

    if (job_name !== "ALL") {
      queryStr += `
      WHERE job_name = $1
      `;
      queryParams.push(job_name);
    }

    if (layer_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
        AND layer_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
        WHERE layer_no = $1
        `;
      }
      queryParams.push(layer_no);
    }

    queryStr += `
    ORDER BY create_at DESC
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
