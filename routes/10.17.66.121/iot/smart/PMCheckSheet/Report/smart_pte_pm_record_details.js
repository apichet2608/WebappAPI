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

router.get("/report_table", async (req, res) => {
  try {
    const { job_id } = req.query;
    const conditions = [];
    const queryParams = [];

    if (job_id && job_id !== "") {
      conditions.push(`c.job_id = $${queryParams.length + 1}`);
      queryParams.push(job_id);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const queryString = `
      SELECT 
        a.id AS key,
        a.mc_code,
        a.master_id,
        a.qf_ref,
        a.is_ref,
        b.id AS record_master_id,
        b.master_id AS record_master_master_id,
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
        b.max,
        c.job_id ,
        c.record_time,
        c.result_number,
        c.result_text,
        c.abnormal_fix_date,
        c.fix_details,
        c.part_code,
        c.part_code_desc,
        c.order_no,
        c.abnormal_details,
        c.record_status,
        c.result_status
      FROM
        smart.smart_pte_pm_header_master a
      INNER JOIN
        smart.smart_pte_pm_record_master b ON a.master_id = b.master_id
      LEFT JOIN
        smart.smart_pte_pm_record_details c ON a.mc_code = c.mc_code
                                              AND b.order_sq = c.order_sq
                                              AND b.record_no = c.record_no
        ${whereClause}
        
        ORDER BY
        b.order_sq ASC, c.record_time ASC`;

    const result = await query(queryString, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    // Include more information about the error
    res.status(500).send(`Internal Server Error: ${err.message}`);
  }
});

module.exports = router;
