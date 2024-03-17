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

router.post("/Add_job_id_header", async (req, res) => {
  const client = await pool.connect();

  try {
    const data = req.body;
    const firstItemHeaderId = data[0].job_id;

    const checkQuery = `
      SELECT 1
      FROM smart_ewk.smart_ewk_daily_record_jobid_header
      WHERE job_id = $1
      LIMIT 1
    `;
    const checkResult = await client.query(checkQuery, [firstItemHeaderId]);

    if (checkResult.rows.length === 0) {
      for (const item of data) {
        const insertQuery = `
          INSERT INTO smart_ewk.smart_ewk_daily_record_jobid_header
          (
            job_id,
            work_status,
	        check_by,
	        check_date,
	        approve_by,
	        approve_date,
	        dr_status,
	        dr_item,
	        dr_method,
	        dr_standard,
	        dr_seq,
	        lsl,
	        usl,
	        target,
	        number_flag,
            check_sheet_code
          )
          VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `;

        const values = [
          item.job_id,
          item.work_status,
          item.check_by,
          item.check_date,
          item.approve_by,
          item.approve_date,
          item.dr_status,
          item.dr_item,
          item.dr_method,
          item.dr_standard,
          item.dr_seq,
          item.lsl,
          item.usl,
          item.target,
          item.number_flag,
          item.check_sheet_code,
        ];

        await client.query(insertQuery, values);
      }
    } else {
      for (const item of data) {
        const updateQuery = `
          UPDATE smart_ewk.smart_ewk_daily_record_jobid_header
          SET job_id = $1, 
          work_status = $2, 
          check_by = $3, 
          check_date = $4, 
          approve_by = $5, 
          approve_date = $6, 
          dr_status = $7, 
          dr_item = $8, 
          dr_method = $9, 
          dr_seq = $10, 
          lsl = $11, 
          usl = $12, 
          target = $13, 
          number_flag = $14, 
          daily_check = $15, 
          check_sheet_code = $16
          WHERE job_id = $1 AND check_sheet_code = $16
        `;
        const values = [
          item.job_id,
          item.work_status,
          item.check_by,
          item.check_date,
          item.approve_by,
          item.approve_date,
          item.dr_status,
          item.dr_item,
          item.dr_method,
          item.dr_standard,
          item.dr_seq,
          item.lsl,
          item.usl,
          item.target,
          item.number_flag,
          item.check_sheet_code,
        ];
        await client.query(updateQuery, values);
      }
    }
    res.status(200).json({
      success: true,
      message: "Data inserted or updated successfully",
    });
  } catch (error) {
    console.error("Error during database operation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
});

router.get("/get_master_detail", async (req, res) => {
  try {
    const { check_sheet_code } = req.query;

    if (!check_sheet_code) {
      return res
        .status(400)
        .json({ error: "Missing check_sheet_code parameter" });
    }

    const result = await pool.query(
      `
      select 
        id,
        create_at,
        check_sheet_code,
        dr_seq,
        dr_status,
        number_flag,
        dr_item,
        dr_method,
        dr_standard,
        dr_feq,
        usl,
        lsl,
        target
      from smart_ewk.smart_ewk_daily_record_master_detail
      where check_sheet_code = $1
      `,
      [check_sheet_code]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
