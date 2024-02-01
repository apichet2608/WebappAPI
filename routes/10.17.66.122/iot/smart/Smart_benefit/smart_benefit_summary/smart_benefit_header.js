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

// router.get("/Table_benefit_header", async (req, res) => {
//   try {
//     const result = await query(
//       `select
// 	id,
// 	create_at,
// 	aspect_id,
// 	aspects_code,
// 	aspects,
// 	items_code,
// 	items_desc,
// 	action_id,
// 	is_action,
// 	smf_line_cost_saving,
// 	none_smf_line_cost_saving
// from
// 	smart.smart_benefit_header
//     `
//     );
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/Table_benefit_header", async (req, res) => {
  try {
    const result = await query(
      `SELECT
    aspects,
    aspect_id ,
    JSONB_AGG(JSONB_BUILD_OBJECT('items_desc', items_desc, 'action_id', action_id , 'items_code' , items_code)) AS jsondb,
    ROW_NUMBER() OVER () AS id
FROM
    smart.smart_benefit_header
GROUP BY
    aspects,aspect_id
order by aspect_id ASC
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/barchartStack", async (req, res) => {
  try {
    const result = await query(
      `select
	distinct
	a.f_year ,
	h.aspect_id as no ,
	h.aspects ,
	sum (a.total_cost_before) as non_smf_cost ,
	sum (a.total_cost_after) as smf_cost ,
	sum (a.net_saving) as saving
from
	smart.smart_benefit_header h
inner join smart.smart_benefit_action a
	on h.action_id = a.action_id
group by
	a.f_year ,
	h.aspect_id ,
	h.aspects
order by
	a.f_year asc ,
	h.aspect_id asc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/Table_barchartStack", async (req, res) => {
  try {
    const result = await query(
      `select
	distinct
	a.f_year ,
	h.aspect_id as no ,
	h.aspects ,
	sum (a.total_cost_before) as non_smf_cost ,
	sum (a.total_cost_after) as smf_cost ,
	sum (a.net_saving) as saving ,
	(sum (a.net_saving)/sum (a.total_cost_before))*100 as p_saving,
  ROW_NUMBER() OVER () AS id
from
	smart.smart_benefit_header h
inner join smart.smart_benefit_action a
	on h.action_id = a.action_id
group by
	a.f_year ,
	h.aspect_id ,
	h.aspects
order by
	a.f_year asc ,
	h.aspect_id asc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
