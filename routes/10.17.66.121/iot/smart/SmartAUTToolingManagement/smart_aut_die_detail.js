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

router.get("/TableAUT", async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT
      mst.tool_code,
      mst.application,
      mst.product_name,
      dtl.id,
      dtl.tool_code || '_' || dtl.id AS tool_code_id,
      dtl.job_id,
      dtl.job_type,
      dtl.status,
      dtl.factory,
      dtl.location,
      dtl.pm_shot,
      dtl.defect_info,
      dtl.defect_description,
      dtl.q_check_need,
      dtl.request_by,
      dtl.process_request,
      dtl.reciever,
      dtl.die_room_recieve,
      dtl.planer,
      dtl.plan,
      dtl.start,
      dtl.q_check_by_prd,
      dtl.q_check_time,
      dtl.stop,
      dtl.tt_dri,
      dtl.repair_standard,
      dtl.repair_detail,
      dtl.q_check_result,
      dtl.die_land_bf_mm,
      dtl.grind_um,
      dtl.die_land_af_mm,
      dtl.upper_punch_bf_mm,
      dtl.grind_upper_punch_um,
      dtl.upper_punch_af_mm,
      dtl.buy_off_report,
      dtl.hold_reason,
      TO_CHAR(dtl.process_request, 'YYYY-MM-DD HH24:MI') as process_request,
      TO_CHAR(dtl.die_room_recieve, 'YYYY-MM-DD HH24:MI') as die_room_recieve,
      TO_CHAR(dtl.plan, 'YYYY-MM-DD HH24:MI') as plan,
      TO_CHAR(dtl.start, 'YYYY-MM-DD HH24:MI') as start,
      TO_CHAR(dtl.q_check_time, 'YYYY-MM-DD HH24:MI') as q_check_time,
      TO_CHAR(dtl.stop, 'YYYY-MM-DD HH24:MI') as stop
    FROM
      smart.smart_aut_die_master AS mst
    INNER JOIN
      smart.smart_aut_die_detail AS dtl
    ON
      mst.tool_code = dtl.tool_code
    WHERE
      dtl.status <> 'Finished'
    ORDER BY
      CASE
        WHEN dtl.status = 'Qualify' THEN 1
        WHEN dtl.status = 'Not Qualify' THEN 2
        WHEN dtl.status = 'Start' THEN 3
        WHEN dtl.status = 'Plan' THEN 4
        WHEN dtl.status = 'Receive' THEN 5
        WHEN dtl.status = 'Booking' THEN 6
        ELSE 7  
      END;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/distinct_toolCode", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        distinct  mst.tool_code,
        dtl.tool_code as detail_tool
      FROM
        smart.smart_aut_die_master AS mst
      Left JOIN
        smart.smart_aut_die_detail AS dtl
      ON
         mst.tool_code = dtl.tool_code
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.put("/add_data", async (req, res) => {
  console.log("PUT request received at /add_data");
  console.log("Request body:", req.body);

  try {
    // Validate the presence of required fields in the request body
    const requiredFields = [
      "tool_code",
      "status",
      "factory",
      "location",
      "job_type",
      "pm_shot",
      "defect_info",
      "defect_description",
      "q_check_need",
      "request_by",
      "process_request",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ error: `Missing required field: ${field}` });
      }
    }

    const {
      tool_code,
      status,
      factory,
      location,
      job_type,
      pm_shot,
      defect_info,
      defect_description,
      q_check_need,
      request_by,
      process_request,
    } = req.body;

    // Use parameterized query to prevent SQL injection
    const insertQuery = `
    WITH inserted_data AS (
      INSERT INTO smart.smart_aut_die_detail (
        tool_code,
        status,
        factory,
        location,
        job_type,
        pm_shot,
        defect_info,
        defect_description,
        q_check_need,
        request_by,
        process_request,
        job_id  
      )
      VALUES (
        $1::character varying,
        $2::character varying,
        $3::character varying,
        $4::character varying,
        $5::character varying,
        $6::character varying,
        $7::character varying,
        $8::character varying,
        $9::character varying,
        $10::character varying,
        $11::timestamp with time zone,
        $1 || '_' || nextval('smart.smart_aut_die_detail_id_seq')::text
      )
      RETURNING *
    )
    SELECT 
      mst.tool_code,
      dtl.id,
      dtl.job_id,
      dtl.factory,
      dtl.status,
      dtl.location,
      dtl.job_type,
      dtl.pm_shot,
      dtl.defect_info,
      dtl.defect_description,
      dtl.q_check_need,
      dtl.request_by,
      dtl.process_request
    FROM 
      smart.smart_aut_die_master AS mst
    INNER JOIN 
      inserted_data AS dtl
    ON 
      mst.tool_code = dtl.tool_code;
    `;

    const result = await query(insertQuery, [
      tool_code,
      status,
      factory,
      location,
      job_type,
      pm_shot,
      defect_info,
      defect_description,
      q_check_need,
      request_by,
      process_request,
    ]);

    res.status(200).json({ message: "Success", data: result.rows });
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

router.put("/request", async (req, res) => {
  try {
    const {
      tool_code,
      status,
      factory,
      location,
      job_type,
      pm_shot,
      defect_info,
      defect_description,
      q_check_need,
      request_by,
      process_request,
      job_id, // Add the missing job_id variable
    } = req.body;

    // Validate the presence of required fields in the request body
    if (!tool_code || !job_id || status === undefined) {
      return res
        .status(400)
        .json({ error: "Missing required fields: tool_code, job_id, status" });
    }

    const updateQuery = `
      UPDATE smart.smart_aut_die_detail
      SET
        tool_code = $1,
        status = $2,
        factory = $3,
        location = $4,
        job_type = $5,
        pm_shot = $6,
        defect_info = $7,
        defect_description = $8,
        q_check_need = $9,
        request_by = $10,
        process_request = $11
      WHERE
        job_id = $12
      RETURNING
        job_id, status;
    `;

    const result = await query(updateQuery, [
      tool_code,
      status,
      factory,
      location,
      job_type,
      pm_shot,
      defect_info,
      defect_description,
      q_check_need,
      request_by,
      process_request,
      job_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({ message: "Success", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({
      error: `An error occurred while updating data: ${error.message}`,
    });
  }
});

router.put("/die_room", async (req, res) => {
  try {
    const { reciever, status, die_room_recieve, job_id } = req.body;

    // Validate the presence of required fields in the request body
    if (!reciever || !job_id || status === undefined) {
      return res
        .status(400)
        .json({ error: "Missing required fields: reciever, job_id, status" });
    }

    const updateQuery = `
      UPDATE smart.smart_aut_die_detail
      SET
        status = $1,
        reciever = $2,
        die_room_recieve = $3
      WHERE
        job_id = $4
      RETURNING
        job_id, reciever, die_room_recieve, status;
    `;

    const result = await query(updateQuery, [
      status,
      reciever,
      die_room_recieve,
      job_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({ message: "Success", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({
      error: `An error occurred while updating data: ${error.message}`,
    });
  }
});

router.put("/plan", async (req, res) => {
  try {
    const { planer, status, plan, job_id } = req.body;

    // Validate the presence of required fields in the request body
    if (!planer || !job_id || status === undefined) {
      return res
        .status(400)
        .json({ error: "Missing required fields:  job_id, status" });
    }

    const updateQuery = `
      UPDATE smart.smart_aut_die_detail
      SET
        status = $1,
        planer = $2,
        plan = $3
      WHERE
        job_id = $4
      RETURNING
       job_id, planer, plan, status;
    `;

    const result = await query(updateQuery, [status, planer, plan, job_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({ message: "Success", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({
      error: `An error occurred while updating data: ${error.message}`,
    });
  }
});

router.put("/start", async (req, res) => {
  try {
    const {
      start,
      tt_dri,
      repair_standard,
      repair_detail,
      q_check_result,
      die_land_bf_mm,
      grind_um,
      die_land_af_mm,
      upper_punch_bf_mm,
      grind_upper_punch_um,
      upper_punch_af_mm,
      buy_off_report,
      hold_reason,
      status,
      job_id,
    } = req.body;

    const updateQuery = `
      UPDATE smart.smart_aut_die_detail
      SET
        start = $1,
        tt_dri = $2,
        "repair_standard" = $3,
        repair_detail = $4,
        q_check_result = $5,
        die_land_bf_mm = $6,
        grind_um = $7,
        die_land_af_mm = $8,
        upper_punch_bf_mm = $9,
        grind_upper_punch_um = $10,
        upper_punch_af_mm = $11,
        buy_off_report = $12,
        hold_reason = $13,
        status = $14
      WHERE
        job_id = $15
      RETURNING
        job_id, status, start, tt_dri, repair_standard, repair_detail, q_check_result, die_land_bf_mm, grind_um, die_land_af_mm, upper_punch_bf_mm,grind_upper_punch_um, upper_punch_af_mm, buy_off_report, hold_reason;
    `;

    const result = await query(updateQuery, [
      start,
      tt_dri,
      repair_standard,
      repair_detail,
      q_check_result,
      die_land_bf_mm,
      grind_um,
      die_land_af_mm,
      upper_punch_bf_mm,
      grind_upper_punch_um,
      upper_punch_af_mm,
      buy_off_report,
      hold_reason,
      status, // Add the missing status parameter here
      job_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({ message: "Success", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({
      error: `An error occurred while updating data: ${error.message}`,
    });
  }
});

router.put("/q_check_time", async (req, res) => {
  try {
    const { q_check_by_prd, status, q_check_time, job_id } = req.body;

    // Validate the presence of required fields in the request body
    if (!q_check_time || !job_id || status === undefined) {
      return res.status(400).json({
        error: "Missing required fields: q_check_by_prd, job_id, status",
      });
    }

    const updateQuery = `
      UPDATE smart.smart_aut_die_detail
      SET
        status = $1,
        q_check_by_prd = $2,
        q_check_time = $3
      WHERE
        job_id = $4
      RETURNING
        job_id, status, q_check_by_prd, q_check_time;
    `;

    const result = await query(updateQuery, [
      status,
      q_check_by_prd,
      q_check_time,
      job_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({ message: "Success", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({
      error: `An error occurred while updating data: ${error.message}`,
    });
  }
});

router.put("/stop", async (req, res) => {
  try {
    const { status, stop, job_id } = req.body;

    // Validate the presence of required fields in the request body
    if (!stop || !job_id || status === undefined) {
      return res
        .status(400)
        .json({ error: "Missing required fields: stop, job_id, status" });
    }

    const updateQuery = `
      UPDATE smart.smart_aut_die_detail
      SET
        status = $1,
        stop = $2
      WHERE
        job_id = $3
      RETURNING
        job_id, status, stop;
    `;

    const result = await query(updateQuery, [status, stop, job_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({ message: "Success", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({
      error: `An error occurred while updating data: ${error.message}`,
    });
  }
});

router.get("/Table_Finished", async (req, res) => {
  try {
    const result = await pool.query(
      `
       SELECT
    dlt.id,
    mrt.product_name,
    dlt.tool_code,
    dlt.status,
    dlt."location" ,
    dlt.job_type ,
    dlt.pm_shot ,
    dlt.request_by ,
    dlt.tt_dri ,
    dlt.repair_standard ,
    dlt.repair_min ,
    dlt.waiting_min ,
    dlt.lead_time_min ,
    dlt.plan ,
    dlt.die_land_af_mm ,
    dlt.upper_punch_af_mm ,
    dlt.stop 
FROM smart.smart_aut_die_detail AS dlt
INNER JOIN smart.smart_aut_die_master AS mrt
ON dlt.tool_code = mrt.tool_code
WHERE
  dlt.status = 'Finished'
order by stop desc ;
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/allData", async (req, res) => {
  try {
    const { tool_code, id } = req.query;

    const query = `
      SELECT *
      FROM smart.smart_aut_die_detail
      WHERE tool_code = $1 AND id = $2
    `;
    const result = await pool.query(query, [tool_code, id]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//CHART
router.get("/MixChart", async (req, res) => {
  try {
    const chartData = await pool.query(`
      SELECT
        status,
        TO_CHAR(stop, 'YYYY-MM') AS month,
        ROUND(AVG(lead_time_min / 60), 2) AS avg_lead_time_hr,
        ROUND(AVG(waiting_min / 60), 2) AS avg_waiting_hr,
        ROUND(AVG(repair_min / 60), 2) AS avg_repair_hr
      FROM
        smart.smart_aut_die_detail sadd
      WHERE
        status = 'Finished'
      GROUP BY
        status, TO_CHAR(stop, 'YYYY-MM')
      ORDER BY
        month;
    `);

    // Send the JSON response back to the client
    res.json(chartData.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//CHART JOB_Hr
router.get("/Job_HrChart", async (req, res) => {
  try {
    const chartData = await pool.query(`
      SELECT
        TO_CHAR(t.stop, 'yyyy-mm') AS month,
        COUNT(t.job_id) AS count_job,
        SUM(t.lead_time_min / 60) AS sum_leadtime,
        ROUND((COUNT(t.job_id)) / (SUM(t.lead_time_min / 60))::numeric, 3) AS job_hr
      FROM
        smart.smart_aut_die_detail t
      WHERE
        t.status = 'Finished'
      GROUP BY
        TO_CHAR(t.stop, 'yyyy-mm')
      ORDER BY
        month;
    `);

    // Send the JSON response back to the client
    res.json(chartData.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//CHART JOB_TYPE
router.get("/Job_TypeChart", async (req, res) => {
  try {
    const chartData = await pool.query(`
      SELECT
    ROW_NUMBER() OVER () AS id,
    TO_CHAR(stop, 'YYYY-MM') AS month,
    SUM(CASE WHEN job_type = 'PM' THEN 1 ELSE 0 END) AS count_PM,
    SUM(CASE WHEN job_type = 'PM inline' THEN 1 ELSE 0 END) AS count_PM_inline,
    SUM(CASE WHEN job_type = 'Half PM' THEN 1 ELSE 0 END) AS count_Half_PM,
    SUM(CASE WHEN job_type = 'Repair' THEN 1 ELSE 0 END) AS count_Repair
FROM
    smart.smart_aut_die_detail
WHERE 
    status = 'Finished'
GROUP BY
    TO_CHAR(stop, 'YYYY-MM')
ORDER BY 
    TO_CHAR(stop, 'YYYY-MM');
    `);
    res.json(chartData.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//EDIT MAIN
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tool_code,
      status,
      factory,
      location,
      job_type,
      pm_shot,
      defect_info,
      defect_description,
      q_check_need,
      request_by,
      process_request,
      reciever,
      die_room_recieve,
      planer,
      plan,
      tt_dri,
      repair_standard,
      repair_detail,
      q_check_result,
      die_land_bf_mm,
      die_land_af_mm,
      grind_um,
      upper_punch_bf_mm,
      grind_upper_punch_um,
      upper_punch_af_mm,
      buy_off_report,
      hold_reason,
      start,
      q_check_time,
      stop,
    } = req.body;

    const results = await query(
      `
UPDATE smart.smart_aut_die_detail
   SET
    tool_code = $1,
    status = $2,
    factory = $3,
    location = $4,
    job_type = $5,
    pm_shot = $6,
    defect_info = $7,
    defect_description = $8,
    q_check_need = $9,
    request_by = $10,
    process_request = $11,
    reciever = $12,
    die_room_recieve = $13,
    planer = $14,
    plan = $15,
    tt_dri = $16,
    repair_standard = $17,
    repair_detail = $18,
    q_check_result = $19,
    die_land_bf_mm = $20,
    die_land_af_mm = $21,
    grind_um = $22,
    upper_punch_bf_mm = $23,
    grind_upper_punch_um = $24,
    upper_punch_af_mm = $25,
    buy_off_report = $26,
    hold_reason = $27,
    start = $28,
    q_check_time = $29,
    stop = $30
   WHERE
    id = $31
  `,
      [
        tool_code,
        status,
        factory,
        location,
        job_type,
        pm_shot,
        defect_info,
        defect_description,
        q_check_need,
        request_by,
        process_request,
        reciever,
        die_room_recieve,
        planer,
        plan,
        tt_dri,
        repair_standard,
        repair_detail,
        q_check_result,
        die_land_bf_mm,
        die_land_af_mm,
        grind_um,
        upper_punch_bf_mm,
        grind_upper_punch_um,
        upper_punch_af_mm,
        buy_off_report,
        hold_reason,
        start,
        q_check_time,
        stop,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const results = await query(
      `DELETE FROM smart.smart_aut_die_detail
       WHERE id = $1;
      `,
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

module.exports = router;
