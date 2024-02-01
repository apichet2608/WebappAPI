const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});

const query = (text, params) => pool.query(text, params);

router.get("/data_boxplot", async (req, res) => {
  try {
    const { proc_grp, product_name } = req.query;
    let query = `
    select
	id,
	create_at,
	id_plndt,
	id_plnhd,
	proc_grp,
	product_name,
	lot,
	field_no,
	title_name,
	actual_value,
	std_value,
	min_value,
	max_value,
	update_date
from
	smart.smart_eworking_data_lake
    `;

    const queryParams = [];
    if (proc_grp && proc_grp !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` proc_grp = $${queryParams.length + 1}
      `;
      queryParams.push(proc_grp);
    }
    if (product_name && product_name !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` product_name = $${queryParams.length + 1}
      `;
      queryParams.push(product_name);
    }
    console.log(query);
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_proc_grp", async (req, res) => {
  try {
    const {} = req.query;
    let query = `
    select
	distinct proc_grp
from
	smart.smart_eworking_data_lake
`;

    const queryParams = [];

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_product_name", async (req, res) => {
  try {
    const { proc_grp } = req.query;
    let query = `
    select
	distinct product_name
from
	smart.smart_eworking_data_lake
`;

    const queryParams = [];
    if (proc_grp && proc_grp !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` proc_grp = $${queryParams.length + 1}
      `;
      queryParams.push(proc_grp);
    }
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
