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

router.get("/CheckTooling", async (req, res) => {
  try {
    const { proc_grp_name, scan_job_id } = req.query;

    let queryStr = `
      SELECT *
      FROM smart_ewk.smart_ewk_scan_result
      WHERE proc_grp_name = $1
      AND scan_job_id = $2
    `;

    let queryParams = [proc_grp_name, scan_job_id];

    // First query execution
    const firstQueryResult = await query(queryStr, queryParams);
    // console.log(firstQueryResult);

    if (firstQueryResult.rows.length === 0) {
      queryStr = `
        SELECT
          id,
          create_at,
          update_date,
          scan_categ,
          proc_grp_name,
          scan_time,
          scan_desc
        FROM smart_ewk.smart_ewk_scan_master_header
        WHERE proc_grp_name = $1
        AND scan_categ = 'tool'
      `;

      queryParams = [proc_grp_name];

      // Second query execution with updated query and params
      const secondQueryResult = await query(queryStr, queryParams);

      // ตรวจสอบว่ามีแถวใดบ้างที่มีค่า scan_time เป็น null
      const hasNullScanTime = secondQueryResult.rows.some(
        (row) => row.scan_time === null
      );

      // ตั้งค่า toolingStatus ตามผลลัพธ์ของการตรวจสอบ ใช้ let เพื่อที่จะสามารถเปลี่ยนค่าได้ในภายหลัง
      let toolingStatus = hasNullScanTime ? "FAIL" : "PASS";

      // ตรวจสอบว่ามีข้อมูลหรือไม่ หากไม่มีข้อมูลใด ๆ เปลี่ยน toolingStatus เป็น "FAIL"
      if (secondQueryResult.rows.length === 0) {
        toolingStatus = "FAIL";
      }

      console.log(secondQueryResult.rows); // แสดงผลลัพธ์ของ query
      res.status(200).json({
        status: "OK",
        toolingStatus: toolingStatus,
        data: secondQueryResult.rows,
      });
    } else {
      console.log(firstQueryResult.rows);
      res.status(200).json({
        status: "OK",
        toolingStatus: "PASS",
        data: firstQueryResult.rows,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/CheckMateriale", async (req, res) => {
  try {
    const { proc_grp_name, scan_job_id } = req.query;

    let queryStr = `
      SELECT *
      FROM smart_ewk.smart_ewk_scan_result
      WHERE proc_grp_name = $1
      AND scan_job_id = $2
    `;

    let queryParams = [proc_grp_name, scan_job_id];

    // First query execution
    const firstQueryResult = await query(queryStr, queryParams);
    // console.log(firstQueryResult);

    if (firstQueryResult.rows.length === 0) {
      queryStr = `
        SELECT
          id,
          create_at,
          update_date,
          scan_categ,
          proc_grp_name,
          scan_time,
          scan_desc
        FROM smart_ewk.smart_ewk_scan_master_header
        WHERE proc_grp_name = $1
        AND scan_categ = 'material'
      `;

      queryParams = [proc_grp_name];

      // Second query execution with updated query and params
      const secondQueryResult = await query(queryStr, queryParams);

      // ตรวจสอบว่ามีแถวใดบ้างที่มีค่า scan_time เป็น null
      const hasNullScanTime = secondQueryResult.rows.some(
        (row) => row.scan_time === null
      );

      // ตั้งค่า toolingStatus ตามผลลัพธ์ของการตรวจสอบ ใช้ let เพื่อที่จะสามารถเปลี่ยนค่าได้ในภายหลัง
      let materialeStatus = hasNullScanTime ? "FAIL" : "PASS";

      // ตรวจสอบว่ามีข้อมูลหรือไม่ หากไม่มีข้อมูลใด ๆ เปลี่ยน toolingStatus เป็น "FAIL"
      if (secondQueryResult.rows.length === 0) {
        materialeStatus = "FAIL";
      }

      console.log(secondQueryResult.rows); // แสดงผลลัพธ์ของ query
      res.status(200).json({
        status: "OK",
        materialeStatus: materialeStatus,
        data: secondQueryResult.rows,
      });
    } else {
      console.log(firstQueryResult.rows);
      res.status(200).json({
        status: "OK",
        toolingStatus: "PASS",
        data: firstQueryResult.rows,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;

// return res.status(200).json({
//   status: "OK",
//   message: "No data found",
//   data: [],
//   error_details: "",
// });
