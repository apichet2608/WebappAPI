const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/master_record", async (req, res) => {
  try {
    const { mc_group_desc, mc_type, mc_code, record_no, work_mc_status } =
      req.query;

    // Base query string
    let queryString = `
      SELECT
        a.mc_group_code,
        a.mc_group_desc,
        a.mc_spec,
        a.mc_type,
        a.mc_sub_type,
        a.mc_code,
        a.mc_model,
        a.qf_ref,
        a.is_ref,
        a.master_id,
        a.id,
        b.id,
        b.master_id,
        b.order_sq,
        b.record_no,
        b.checklisto,
        b.inspection_point,
        b.standard_check,
        b.work_mc_status,
        b.working_tools,
        b.measurement_tools,
        b.check_data_type,
        b.std,
        b.min,
        b.max
      FROM
        smart.smart_pte_pm_header_master a
      INNER JOIN
        smart.smart_pte_pm_record_master b ON a.master_id = b.master_id
    `;

    // Conditions array to store WHERE conditions
    const conditions = [];

    // Parameters for the query
    const queryParams = [];

    // If mc_group_desc is provided, add it to the conditions array
    if (mc_group_desc && mc_group_desc !== "ALL") {
      conditions.push(`a.mc_group_desc = $${queryParams.length + 1}`);
      queryParams.push(mc_group_desc);
    }

    // If mc_type is provided, add it to the conditions array
    if (mc_type && mc_type !== "ALL") {
      conditions.push(`a.mc_type = $${queryParams.length + 1}`);
      queryParams.push(mc_type);
    }

    // If mc_code is provided, add it to the conditions array
    if (mc_code && mc_code !== "ALL") {
      conditions.push(`a.mc_code = $${queryParams.length + 1}`);
      queryParams.push(mc_code);
    }

    // If checklisto is provided, add it to the conditions array
    if (record_no && record_no !== "ALL") {
      conditions.push(`b.record_no = $${queryParams.length + 1}`);
      queryParams.push(record_no);
    }

    // If work_mc_status is provided, add it to the conditions array
    if (work_mc_status && work_mc_status !== "ALL") {
      conditions.push(`b.work_mc_status = $${queryParams.length + 1}`);
      queryParams.push(work_mc_status);
    }

    // If there are conditions, add WHERE clause to the query
    if (conditions.length > 0) {
      queryString += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add ORDER BY clause to the query
    queryString += ` ORDER BY b.order_sq ASC`;

    // Execute the query
    const result = await query(queryString, queryParams);

    // Send the result
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
