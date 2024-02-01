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

//* Working Record Create API
// router.post("/working_record_insert", async (req, res) => {
//   try {
//     const { create_at, job_id, mc_code, work_status } = req.body;

//     const insertQuery = `INSERT INTO smart.smart_pte_pm_record
//     (create_at, job_id, mc_code, work_status)
//   VALUES
//     ($1, $2, $3, $4)
//   `;

//     const queryParam = [create_at, job_id, mc_code, work_status];

//     console.log("Query Parameters:", queryParam);

//     const result = await pool.query(insertQuery, queryParam);

//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.post("/working_record_insert", async (req, res) => {
  try {
    const { create_at, job_id, mc_code, work_status, dri } = req.body;

    const insertQuery = `INSERT INTO smart.smart_pte_pm_record
    (create_at, job_id, mc_code, work_status, dri)
  VALUES
    ($1, $2, $3, $4, $5)
  `;

    const queryParam = [create_at, job_id, mc_code, work_status, dri];

    console.log("Query Parameters:", queryParam);

    const result = await pool.query(insertQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//* Working Record Update dri_date API
router.put("/working_record_update_dri_date/:job_id", async (req, res) => {
  try {
    const { job_id } = req.params;
    const { dri_date } = req.body;

    const updateQuery = `
      UPDATE smart.smart_pte_pm_record 
      SET dri_date = $1
      WHERE job_id = $2
      RETURNING *;`;

    const queryParams = [dri_date, job_id];

    console.log("Query Parameters:", queryParams);

    const result = await pool.query(updateQuery, queryParams);

    const updatedRecord = result.rows[0]; // Assuming it's a single record update

    res.status(200).json({
      message: "Record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//* Working Record Read API
router.get("/working_record_read", async (req, res) => {
  try {
    const { job_id } = req.query;

    let sqlQuery = `
        SELECT 
          *
        FROM 
          smart.smart_pte_pm_record
      `;

    // Check if job_id is provided and not "ALL"
    if (job_id && job_id !== "ALL") {
      sqlQuery += ` WHERE job_id = $1`;
    }

    sqlQuery += ` ORDER BY create_at DESC`;

    // Use an array to hold parameters and provide it to pool.query
    const queryParams = job_id && job_id !== "ALL" ? [job_id] : [];

    const result = await pool.query(sqlQuery, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

//* Working Record Update API for Check
router.put("/working_record_check/:job_id", async (req, res) => {
  try {
    const { job_id } = req.params;
    const { work_status, approve1, approve1_date } = req.body;

    const updateQuery = `
      UPDATE smart.smart_pte_pm_record
      SET
        work_status = $1,
        approve1 = $2,
        approve1_date = $3
      WHERE
        job_id = $4
      RETURNING *;`;

    const queryParams = [work_status, approve1, approve1_date, job_id];

    // Log the query parameters for debugging purposes
    console.log("Query Parameters:", queryParams);

    const result = await pool.query(updateQuery, queryParams);

    const updatedRecord = result.rows[0]; // Assuming it's a single record update

    res.status(200).json({
      message: "Record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//* Working Record Update API for Approve
router.put("/working_record_approve/:job_id", async (req, res) => {
  try {
    const { job_id } = req.params;
    const { work_status, approve2, approve2_date } = req.body;

    const updateQuery = `
      UPDATE smart.smart_pte_pm_record
      SET
        work_status = $1,
        approve2 = $2,
        approve2_date = $3
      WHERE
        job_id = $4
      RETURNING *;`;

    const queryParams = [work_status, approve2, approve2_date, job_id];

    // Log the query parameters for debugging purposes
    console.log("Query Parameters:", queryParams);

    const result = await pool.query(updateQuery, queryParams);

    const updatedRecord = result.rows[0]; // Assuming it's a single record update

    res.status(200).json({
      message: "Record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//* Working Record Delete API
router.delete("/working_record_delete", async (req, res) => {
  try {
    const { id } = req.query;

    const deleteQuery = `
        DELETE FROM smart.smart_pte_pm_record
        WHERE id = $1`;

    // Log the query parameters for debugging purposes
    console.log("Query Parameters:", [id]);

    const result = await pool.query(deleteQuery, [id]);

    // Check if any rows were affected by the DELETE operation
    if (result.rowCount === 0) {
      // No rows were deleted, respond accordingly
      res.status(404).json({ message: "Record not found" });
    } else {
      // Rows were deleted, respond with a success message
      res.json({ message: "Record deleted successfully" });
    }
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//* Working Record Update to Delete Except ID API
router.put("/working_record_update_to_delete_except_id", async (req, res) => {
  try {
    // Ensure that the request body is correctly parsed (use express.json() middleware)
    const { id } = req.query; // Extract 'id' from the route parameters

    const updateQuery = `
      UPDATE smart.smart_pte_pm_record
      SET
        work_status = 'Delete'
      WHERE
        id = $1
      RETURNING *;`;

    const queryParams = [id];

    // Log the query parameters for debugging purposes
    console.log("Query Parameters:", queryParams);

    const result = await pool.query(updateQuery, queryParams);

    const updatedRecord = result.rows[0]; // Assuming it's a single record update

    res.status(200).json({
      message: "Record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/master_working_record", async (req, res) => {
  try {
    const {
      mc_code,
      record_no,
      work_mc_status,
      record_time,
      result_status,
      job_id,
    } = req.query;

    // Base query string
    let queryString = `
      SELECT 
        a.mc_code,
        a.master_id,
        a.id,
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
        c.abnormal_fix_date,
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
                                              AND c.job_id = $1
    `;

    // Conditions array to store WHERE conditions
    const conditions = [];

    // Parameters for the query
    const queryParams = [job_id];

    // If mc_code is provided, add it to the conditions array
    if (mc_code && mc_code !== "ALL") {
      conditions.push(`a.mc_code = $${queryParams.length + 1}`);
      queryParams.push(mc_code);
    }

    // If record_no is provided, add it to the conditions array
    if (record_no && record_no !== "ALL") {
      conditions.push(`b.record_no = $${queryParams.length + 1}`);
      queryParams.push(record_no);
    }

    // If work_mc_status is provided, add it to the conditions array
    if (work_mc_status && work_mc_status !== "ALL") {
      conditions.push(`b.work_mc_status = $${queryParams.length + 1}`);
      queryParams.push(work_mc_status);
    }

    // If record_time is provided, add it to the conditions array
    if (record_time && record_time !== "ALL") {
      conditions.push(`c.record_time = $${queryParams.length + 1}`);
      queryParams.push(record_time);
    }

    // If result_status is provided, add it to the conditions array
    if (result_status && result_status !== "ALL") {
      conditions.push(`c.result_status = $${queryParams.length + 1}`);
      queryParams.push(result_status);
    }

    // If there are conditions, add WHERE clause to the query
    if (conditions.length > 0) {
      queryString += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add ORDER BY clause to the query
    queryString += ` ORDER BY 
      c.record_status ASC,
      c.record_time ASC,
      b.order_sq ASC`;

    // Execute the query
    const result = await query(queryString, queryParams);

    // Send the result
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//* Worikng Record Dialog Record Insert API
router.post("/working_record_dialog_insert_record", async (req, res) => {
  try {
    const {
      record_time,
      job_id,
      mc_code,
      order_sq,
      record_no,
      result_number,
      result_text,
      result_status,
      abnormal_details,
      abnormal_fix_date,
      fix_details,
      part_code,
      part_code_desc,
      order_no,
      record_status,
    } = req.body;

    const insertQuery = `
      INSERT INTO smart.smart_pte_pm_record_details 
        (record_time, job_id, mc_code, order_sq, record_no, result_number, result_text, result_status, abnormal_details, abnormal_fix_date, fix_details, part_code, part_code_desc, order_no, record_status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;`;

    const queryParam = [
      record_time,
      job_id,
      mc_code,
      order_sq,
      record_no,
      result_number,
      result_text,
      result_status,
      abnormal_details,
      abnormal_fix_date,
      fix_details,
      part_code,
      part_code_desc,
      order_no,
      record_status,
    ];

    console.log("Query Parameters:", queryParam);

    const result = await pool.query(insertQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//* Worikng Record Dialog Record Update API
router.put(
  "/working_record_dialog_update_record/:job_id/:order_sq/:record_no",
  async (req, res) => {
    try {
      const { job_id, order_sq, record_no } = req.params;
      const {
        record_time,
        result_number,
        result_text,
        result_status,
        abnormal_details,
        abnormal_fix_date,
        fix_details,
        part_code,
        part_code_desc,
        order_no,
        record_status,
      } = req.body;

      const updateQuery = `
    UPDATE smart.smart_pte_pm_record_details 
    SET
      record_time = $1,
      result_number = $2,
      result_text = $3,
      result_status = $4,
      abnormal_details = $5,
      abnormal_fix_date = $6,
      fix_details = $7,
      part_code = $8,
      part_code_desc = $9,
      order_no = $10,
      record_status = $11
    WHERE
      job_id = $12
      AND order_sq = $13
      AND record_no = $14
    RETURNING *;`;

      const queryParams = [
        record_time,
        result_number,
        result_text,
        result_status,
        abnormal_details,
        abnormal_fix_date,
        fix_details,
        part_code,
        part_code_desc,
        order_no,
        record_status,
        job_id,
        order_sq,
        record_no,
      ];

      // Log the query parameters for debugging purposes
      console.log("Query Parameters:", queryParams);

      const result = await pool.query(updateQuery, queryParams);

      const updatedRecord = result.rows[0]; // Assuming it's a single record update

      res.status(200).json({
        message: "Record updated successfully",
        data: updatedRecord,
      });
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

//* Worikng Record Dialog Record History Insert API
router.post(
  "/working_record_dialog_insert_record_history",
  async (req, res) => {
    try {
      const {
        job_id,
        mc_code,
        order_sq,
        record_no,
        result_number,
        result_text,
        result_status,
        abnormal_details,
        abnormal_fix_date,
        fix_details,
        part_code,
        part_code_desc,
        order_no,
      } = req.body;

      const insertQuery = `
      INSERT INTO smart.smart_pte_pm_record_history 
        (job_id, mc_code, order_sq, record_no, result_number, result_text, result_status, abnormal_details, abnormal_fix_date, fix_details, part_code, part_code_desc, order_no)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
      `;

      const queryParam = [
        job_id,
        mc_code,
        order_sq,
        record_no,
        result_number,
        result_text,
        result_status,
        abnormal_details,
        abnormal_fix_date,
        fix_details,
        part_code,
        part_code_desc,
        order_no,
      ];

      console.log("Query Parameters:", queryParam);

      const result = await pool.query(insertQuery, queryParam);

      res.json(result.rows);
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
