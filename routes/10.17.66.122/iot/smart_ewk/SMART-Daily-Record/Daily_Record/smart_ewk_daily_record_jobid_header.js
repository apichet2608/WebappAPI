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

// router.post("/Add_job_id_header", async (req, res) => {
//   const client = await pool.connect();

//   try {
//     const data = req.body;
//     const firstItemHeaderId = data[0].job_id;

//     const checkQuery = `
//       SELECT 1
//       FROM smart_ewk.smart_ewk_daily_record_jobid_header
//       WHERE job_id = $1
//       LIMIT 1
//     `;
//     const checkResult = await client.query(checkQuery, [firstItemHeaderId]);

//     if (checkResult.rows.length === 0) {
//       for (const item of data) {
//         const insertQuery = `
//           INSERT INTO smart_ewk.smart_ewk_daily_record_jobid_header
//           (
//             job_id,
//             work_status,
// 	        check_by,
// 	        check_date,
// 	        approve_by,
// 	        approve_date,
// 	        dr_status,
// 	        dr_item,
// 	        dr_method,
// 	        dr_standard,
// 	        dr_seq,
// 	        lsl,
// 	        usl,
// 	        target,
// 	        number_flag,
//             check_sheet_code
//           )
//           VALUES
//           ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
//         `;

//         const values = [
//           item.job_id,
//           item.work_status,
//           item.check_by,
//           item.check_date,
//           item.approve_by,
//           item.approve_date,
//           item.dr_status,
//           item.dr_item,
//           item.dr_method,
//           item.dr_standard,
//           item.dr_seq,
//           item.lsl,
//           item.usl,
//           item.target,
//           item.number_flag,
//           item.check_sheet_code,
//         ];

//         await client.query(insertQuery, values);
//       }
//     } else {
//       for (const item of data) {
//         const updateQuery = `
//           UPDATE smart_ewk.smart_ewk_daily_record_jobid_header
//           SET job_id = $1,
//           work_status = $2,
//           check_by = $3,
//           check_date = $4,
//           approve_by = $5,
//           approve_date = $6,
//           dr_status = $7,
//           dr_item = $8,
//           dr_method = $9,
//           dr_seq = $10,
//           lsl = $11,
//           usl = $12,
//           target = $13,
//           number_flag = $14,
//           daily_check = $15,
//           check_sheet_code = $16
//           WHERE job_id = $1 AND check_sheet_code = $16
//         `;
//         const values = [
//           item.job_id,
//           item.work_status,
//           item.check_by,
//           item.check_date,
//           item.approve_by,
//           item.approve_date,
//           item.dr_status,
//           item.dr_item,
//           item.dr_method,
//           item.dr_standard,
//           item.dr_seq,
//           item.lsl,
//           item.usl,
//           item.target,
//           item.number_flag,
//           item.check_sheet_code,
//         ];
//         await client.query(updateQuery, values);
//       }
//     }
//     res.status(200).json({
//       success: true,
//       message: "Data inserted or updated successfully",
//     });
//   } catch (error) {
//     console.error("Error during database operation:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   } finally {
//     client.release();
//   }
// });

router.get("/check_job_id", async (req, res) => {
  const { machine, shift } = req.query; // ดึงค่า machine และ shift จาก query parameters

  try {
    const result = await pool.query(
      `
      SELECT DISTINCT job_id
      FROM smart_ewk.smart_ewk_daily_record_result_machine
      WHERE machine = $1
      AND shift = $2
      `,
      [machine, shift] // ส่งค่า machine และ shift เป็น parameter ใน query
    );

    // ส่ง JSON response กลับไปยัง client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

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
	          check_sheet_code,
	          check_sheet_desc,
	          dept,
	          proc_grp,
	          machine,
	          record_code,
	          lock_ewk,
	          ref_is,
	          ref_record
          )
          VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `;

        const values = [
          item.job_id,
          item.work_status,
          item.check_by,
          item.check_date,
          item.approve_by,
          item.approve_date,
          item.check_sheet_code,
          item.check_sheet_desc,
          item.dept,
          item.proc_grp,
          item.machine,
          item.record_code,
          item.lock_ewk,
          item.ref_is,
          item.ref_record,
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
          check_sheet_code = $7,
	        check_sheet_desc= $8,
	        dept= $9,
	        proc_grp= $10,
	        machine= $11,
	        record_code= $12,
	        lock_ewk= $13,
	        ref_is= $14,
	        ref_record= $15
          WHERE job_id = $1 AND check_sheet_code = $7
        `;
        const values = [
          item.job_id,
          item.work_status,
          item.check_by,
          item.check_date,
          item.approve_by,
          item.approve_date,
          item.check_sheet_code,
          item.check_sheet_desc,
          item.dept,
          item.proc_grp,
          item.machine,
          item.record_code,
          item.lock_ewk,
          item.ref_is,
          item.ref_record,
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

router.get("/Table_main_header", async (req, res) => {
  try {
    const { dept, proc_grp, machine, record_code } = req.query;

    const result = await pool.query(
      `
      SELECT 
        id,
        job_id,
        TO_CHAR(create_at, 'YYYY-MM-DD HH:MM') AS create_at,  
        dept,
        proc_grp,
        machine,
        work_status,
        check_by,
        check_date,
        approve_by,
        approve_date,
        check_sheet_code,
        check_sheet_desc,
        record_code,
        lock_ewk,
        ref_is,
        ref_record
      FROM smart_ewk.smart_ewk_daily_record_jobid_header
      WHERE dept = $1
        AND proc_grp = $2
        AND machine = $3
        AND record_code = $4
      `,
      [dept, proc_grp, machine, record_code]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/get_header_main", async (req, res) => {
  const { job_id, check_sheet_code } = req.query;

  try {
    if (!job_id || !check_sheet_code) {
      return res
        .status(400)
        .json({ error: "Missing job_id or check_sheet_code parameters" });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM smart_ewk.smart_ewk_daily_record_jobid_header
      WHERE job_id = $1
      AND check_sheet_code = $2
      `,
      // Use the parameters in the query
      [job_id, check_sheet_code]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//Edit Header_main
router.put("/:id", async (req, res) => {
  try {
    const { check_sheet_code } = req.params;
    const {
      dept,
      proc_grp,
      machine,
      work_status,
      record_code,
      check_by,
      check_date,
      approve_by,
      approve_date,
      check_sheet_desc,
      lock_ewk,
      ref_is,
      ref_record,
    } = req.body;

    const results = await query(
      `
      UPDATE smart_ewk.smart_ewk_daily_record_jobid_header
      SET
        dept = $1,
        proc_grp = $2,
        machine = $3,
        work_status = $4,
        record_code = $5,
        check_by = $6,
        check_date = $7,
        approve_by = $8,
        approve_date = $9,
        check_sheet_desc = $10,
        lock_ewk = $11,
        ref_is = $12,
        ref_record = $13
      WHERE
        id = $14
      `,
      [
        dept,
        proc_grp,
        machine,
        work_status,
        record_code,
        check_by,
        check_date,
        approve_by,
        approve_date,
        check_sheet_desc,
        lock_ewk,
        ref_is,
        ref_record,
        check_sheet_code, // assuming id is the check_sheet_code
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

module.exports = router;
