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

router.get("/getdataVerify", async (req, res) => {
  try {
    const { jwpv_job_type, jwpv_mc_code, proc_grp_name } = req.query;
    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
	  *
    from
	  smart.smart_jv_parameter_calling
    where
    jwpv_job_type = $1
    and
    jwpv_mc_code =$2
    and 
    jwpv_proc_group = $3
    order by jwpv_param_code ASC
        `;
    queryParams = [jwpv_job_type, jwpv_mc_code, proc_grp_name];
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
