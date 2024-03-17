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

router.get("/distinct_dept", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct dept
      from smart_ewk.smart_ewk_daily_record_master
      order by dept

      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_proc_grp", async (req, res) => {
  const { dept } = req.query; // สร้างตัวแปร dept จาก query string

  try {
    const result = await pool.query(
      `
      select distinct proc_grp
      from smart_ewk.smart_ewk_daily_record_master
      where dept = $1
      order by proc_grp
      `,
      [dept] // ใส่ค่า dept ใน parameter array
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_mc_code", async (req, res) => {
  const { dept, proc_grp } = req.query; // สร้างตัวแปร dept จาก query string

  try {
    const result = await pool.query(
      `
      select distinct mc_code as machine
      from smart_ewk.smart_ewk_daily_record_master
      where dept = $1
      and proc_grp = $2
      order by mc_code
      `,
      [dept, proc_grp] // ใส่ค่า dept ใน parameter array
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//ADD TO smart_ewk_daily_record_result_machine
router.post("/Add_realtime_parameter", async (req, res) => {
  const client = await pool.connect();

  try {
    const data = req.body;
    const firstItemHeaderId = data[0].job_id;

    const checkQuery = `
      SELECT 1
      FROM smart_ewk.smart_ewk_daily_record_result_machine
      WHERE job_id = $1
      LIMIT 1
    `;
    const checkResult = await client.query(checkQuery, [firstItemHeaderId]);

    if (checkResult.rows.length === 0) {
      for (const item of data) {
        const insertQuery = `
          INSERT INTO smart_ewk.smart_ewk_daily_record_result_machine
          (job_id, process, machine, condition, parameter_desc, usl, lsl, target, result, ptime, set, set_map_actv, unit, shift, daily_check)
          VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `;

        const values = [
          item.job_id,
          item.process,
          item.machine,
          item.condition,
          item.parameter_desc,
          item.usl,
          item.lsl,
          item.target,
          item.result,
          item.ptime,
          item.set,
          item.set_map_actv,
          item.unit,
          item.shift,
          item.daily_check,
        ];

        await client.query(insertQuery, values);
      }
    } else {
      for (const item of data) {
        const updateQuery = `
          UPDATE smart_ewk.smart_ewk_daily_record_result_machine
          SET job_id = $1, process = $2, machine = $3, condition = $4, parameter_desc = $5, usl = $6, lsl = $7, target = $8, result = $9, ptime = $10, set = $11, set_map_actv = $12, unit = $13, shift = $14, daily_check = $15
          WHERE job_id = $1 AND machine = $3 AND condition = $4 AND parameter_desc = $5
        `;
        const values = [
          item.job_id,
          item.process,
          item.machine,
          item.condition,
          item.parameter_desc,
          item.usl,
          item.lsl,
          item.target,
          item.result,
          item.ptime,
          item.set,
          item.set_map_actv,
          item.unit,
          item.shift,
          item.daily_check,
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

// Function DELETE
router.delete("/delete_realtime_parameter/:job_id", async (req, res) => {
  const client = await pool.connect();

  try {
    const jobIdToDelete = req.params.job_id;

    const deleteQuery = `
      DELETE FROM smart_ewk.smart_ewk_daily_record_result_machine
      WHERE job_id = $1
    `;

    const result = await client.query(deleteQuery, [jobIdToDelete]);

    if (result.rowCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "Data deleted successfully" });
    } else {
      res.status(404).json({
        success: false,
        message: "No records found for the given job_id",
      });
    }
  } catch (error) {
    console.error("Error during database operation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
