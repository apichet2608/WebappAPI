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

router.get("/spc_spec_master_table", async (req, res) => {
  try {
    const { department, process_grp, product } = req.query;

    let queryString = `
        SELECT id, department, parameter_type, process_grp, param_grp, param_name, product, param_code, side, proc_order, judge_by_spec, norminal, lsl, usl, judge_by_cpk, cpk, unit, frequency, raw_data_flag, std_proc_flag, lock_flag, lock_rule, lock_process, lock_station, lock_period, ctrl_chart, spc_cal_period, spc_cal_unit
        FROM smart.smart_ipqc_parameter_spec_ctrl_master`;

    const conditions = [];
    const queryParams = [];

    if (department && department !== "") {
      conditions.push(`department = $${queryParams.length + 1}`);
      queryParams.push(department);
    }
    if (process_grp && process_grp !== "") {
      conditions.push(`process_grp = $${queryParams.length + 1}`);
      queryParams.push(process_grp);
    }
    if (product && product !== "") {
      conditions.push(`product = $${queryParams.length + 1}`);
      queryParams.push(product);
    }

    if (conditions.length > 0) {
      queryString += " WHERE " + conditions.join(" AND ");
    }

    queryString += " ORDER BY id ASC";

    const result = await query(queryString, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
