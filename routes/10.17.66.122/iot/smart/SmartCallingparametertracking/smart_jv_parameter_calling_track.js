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

router.get("/distinct_jwpv_mc_code", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT jwpv_mc_code
      FROM smart.smart_jv_parameter_calling_track
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/view_table", async (req, res) => {
  try {
    const { jwpv_mc_code } = req.query;

    let queryParams = [];
    let queryStr = `
    select
    id,
    jwpv_date,
    jwpv_mc_code,
    jwpv_param_code,
    jwpv_param_name,
    jwpv_param_title,
    jwpv_param_value,
    --	jwpv_create_by,
    jwpv_create_date,
    --	jwpv_create_program,
    --	jwpv_update_by,
    --	jwpv_update_date,
    --	jwpv_update_program,
    jwpv_param_tvalue
  from
    smart.smart_jv_parameter_calling_track
    `;

    if (jwpv_mc_code !== "ALL" ) {
      queryStr += `
        WHERE 1=1
      `;
    }

    if (jwpv_mc_code !== "ALL") {
      queryStr += `
        AND jwpv_mc_code = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_mc_code);
    }

  
    queryStr += `
    order by
    jwpv_update_date desc ,
      jwpv_mc_code asc ,
      jwpv_param_code asc
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
    
    // console.log("today");
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});



module.exports = router;
