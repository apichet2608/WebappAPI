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

router.post("/Add_result_detail", async (req, res) => {
  const client = await pool.connect();
  await client.query("BEGIN");

  try {
    const data = req.body;
    const firstItemHeaderId = data[0].cs_code_id_header;

    const existsQuery = `
      SELECT EXISTS (
        SELECT 1 FROM smart_ewk.smart_ewk_daily_record_result_detail
        WHERE cs_code_id_header = $1
      )
    `;
    const existsResult = await client.query(existsQuery, [firstItemHeaderId]);

    if (!existsResult.rows[0].exists) {
      const insertQuery = `
        INSERT INTO smart_ewk.smart_ewk_daily_record_result_detail (
          cs_code_id_header,
          check_sheet_code, 
          dr_item, 
          dr_result, 
          dr_text_result, 
          number_flag
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;
      for (const item of data) {
        await client.query(insertQuery, [
          item.cs_code_id_header,
          item.check_sheet_code,
          item.dr_item,
          item.dr_result,
          item.dr_text_result,
          item.number_flag,
        ]);
      }
    } else {
      const updateQuery = `
        UPDATE smart_ewk.smart_ewk_daily_record_result_detail
        SET dr_result = $3, dr_text_result = $4, number_flag = $5
        WHERE cs_code_id_header = $1 AND check_sheet_code = $2 AND dr_item = $6
      `;
      for (const item of data) {
        await client.query(updateQuery, [
          item.cs_code_id_header,
          item.check_sheet_code,
          item.dr_result,
          item.dr_text_result,
          item.number_flag,
          item.dr_item, // Make sure to adjust this if dr_item is not part of your unique identifier
        ]);
      }
    }

    await client.query("COMMIT"); // Commit transaction
    res
      .status(200)
      .json({ success: true, message: "Data processed successfully" });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    console.error("Error during database operation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
});

router.get("/check_job_id_header", async (req, res) => {
  const { job_id, check_sheet_code } = req.query;
  try {
    const result = await pool.query(
      `
      SELECT 
        id,
        check_sheet_code
      FROM smart_ewk.smart_ewk_daily_record_jobid_header
      WHERE job_id = $1
      AND check_sheet_code = $2
      `,
      [job_id, check_sheet_code]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
