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

//distinct_proc_grp

router.get("/distinct_proc_grp", async (req, res) => {
  try {
    const {} = req.query;
    let query = `
    select
	distinct proc_grp
from
	smart.smart_product_lot_station_yield
    `;

    const queryParams = [];

    query += `
      order by
	proc_grp asc;
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/plotYield", async (req, res) => {
  try {
    const { proc_grp } = req.query;
    let query = `
    with subquery as (
	select
		distinct
		t.lot_no ,
		t.proc_grp ,
		max (t.lot_input_qty) as first_input_qty ,
		sum (t.proc_scrap_qty) as scrap_qty ,
		max (t.proc_input_qty) as input_qty ,
		proc_output_date
	from
		smart.smart_product_lot_station_yield t
	where
		t.proc_input_qty is not null
		and t.qa_input_flg is null
	group by
		t.lot_no ,
		t.proc_grp ,
		t.proc_output_date
),
subquery2 as (
	select
		to_char (q1.proc_output_date, 'yyyy-mm-dd') as date ,
		q1.proc_grp ,
		sum (q1.scrap_qty) as sum_scrap ,
		sum (q1.input_qty) as sum_input
	from
		subquery q1
	group by
		to_char (q1.proc_output_date, 'yyyy-mm-dd') ,
		q1.proc_grp
)	
select
	q2.date ,
	q2.proc_grp as process ,
	((q2.sum_input - q2.sum_scrap)/q2.sum_input)*100 as station_yield
from
	subquery2 q2
    `;

    const queryParams = [];

    if (proc_grp && proc_grp !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` q2.proc_grp = $${queryParams.length + 1}
      `;
      queryParams.push(proc_grp);
    }

    query += `
      order by
	date asc;
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/TableLeft", async (req, res) => {
  try {
    const { proc_grp } = req.query;
    let query = `
    with subquery as (
	select
		distinct
		t.lot_no ,
		t.proc_grp ,
		max (t.lot_input_qty) as first_input_qty ,
		sum (t.proc_scrap_qty) as scrap_qty ,
		max (t.proc_input_qty) as input_qty ,
		proc_output_date
	from
		smart.smart_product_lot_station_yield t
	where
		t.proc_input_qty is not null
		and t.qa_input_flg is null
	group by
		t.lot_no ,
		t.proc_grp ,
		t.proc_output_date
),
subquery2 as (
	select
		to_char (q1.proc_output_date, 'yyyy-mm-dd') as date ,
		q1.proc_grp ,
		sum (q1.scrap_qty) as sum_scrap ,
		sum (q1.input_qty) as sum_input
	from
		subquery q1
	group by
		to_char (q1.proc_output_date, 'yyyy-mm-dd') ,
		q1.proc_grp
),	
subquery3 as (
	select
		q2.date ,
		q2.proc_grp as process ,
		((q2.sum_input - q2.sum_scrap)/q2.sum_input)*100 as station_yield
	from
		subquery2 q2
)
select
ROW_NUMBER() OVER () AS id,
	*
from
	subquery3 q3
    `;

    const queryParams = [];

    if (proc_grp && proc_grp !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` q3.process = $${queryParams.length + 1}
      `;
      queryParams.push(proc_grp);
    }

    query += `
      order by
	q3.station_yield asc;
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/TableRight", async (req, res) => {
  try {
    const { proc_grp, proc_output_date } = req.query;
    let query = `
    select
	row_number() over () as id,
	to_char (t.proc_output_date,
	'yyyy-mm-dd hh24:mi:ss') as output_date ,
	t.product_name,
	t.lot_no,
	t.process,
	t.station_yield,
	t.proc_scrap_qty,
	t.remark,
	t.input_scrap_sht_qty,
	t.input_scrap_pc_qty,
	t.proc_input_qty
from
	smart.smart_product_lot_station_yield t
where
	t.qa_input_flg is null
    `;

    const queryParams = [];

    if (proc_output_date && proc_output_date !== "ALL") {
      if (queryParams.length === 0) {
        query += `AND`;
      } else {
        query += `AND`;
      }
      query += ` to_char(t.proc_output_date,'yyyy-mm-dd') = $${
        queryParams.length + 1
      }
      `;
      queryParams.push(proc_output_date);
    }

    if (proc_grp && proc_grp !== "ALL") {
      if (queryParams.length === 0) {
        query += `AND`;
      } else {
        query += `AND`;
      }
      query += ` t.proc_grp = $${queryParams.length + 1}
      `;
      queryParams.push(proc_grp);
    }

    query += `
      order by
	t.lot_no asc ,
	t.proc_seq asc ,
	output_date asc
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
