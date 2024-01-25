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

router.get("/distinct_output_date", async (req, res) => {
  try {

    let queryParams = [];
    let queryStr = `
    select
	distinct output_date
from
	smart.smart_reject_fpc_by_prd_weight
order by
	output_date::timestamp desc
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
    
    console.log("today");
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/view_table", async (req, res) => {
  try {
    const { output_date } = req.query;

    let queryParams = [];
    let queryStr = `
    select
	*
from
	smart.smart_reject_fpc_by_prd_weight
    `;

    if (output_date !== "ALL" ) {
      queryStr += `
        WHERE 1=1
      `;
    }

    if (output_date !== "ALL") {
      queryStr += `
        AND output_date = $${queryParams.length + 1}
      `;
      queryParams.push(output_date);
    }

  
    queryStr += `
    order by
	output_date::timestamp DESC,
  percent_reject_by_shts DESC
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Plot_line_chart", async (req, res) => {
  try {
    const { output_date ,prd_name} = req.query;

    let queryParams = [];
   let queryStr = `
  select
    *
  from
    smart.smart_reject_fpc_by_prd_weight
  WHERE 1=1
`;

// if (output_date !== "ALL") {
//   queryStr += `
//     AND output_date = $${queryParams.length + 1}
//   `;
//   queryParams.push(output_date);
// }

if (prd_name !== "ALL") {
  queryStr += `
    AND prd_name = $${queryParams.length + 1}
  `;
  queryParams.push(prd_name);
}

queryStr += `
  order by
    output_date::timestamp ASC
`;
console.log(queryStr)

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
