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

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "postgres",
//   database: "postgres",
// });

const query = (text, params) => pool.query(text, params);

router.get("/distinct_building", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT item_building
      FROM smart.smart_machine_connect_list
      ORDER BY item_building ASC
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_process", async (req, res) => {
  try {
    const { select_building } = req.query;
    let query = `
      SELECT DISTINCT item_sub_process
      FROM smart.smart_machine_connect_list
    `;
    if (select_building !== "ALL") {
      query += `
        WHERE item_building = $1
      `;
    }
    query += `
      ORDER BY item_sub_process ASC;
    `;
    const queryParams = select_building !== "ALL" ? [select_building] : [];
    console.log("Executing SQL Query:", query); // Add this line for debugging
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_machine", async (req, res) => {
  try {
    const { select_building, select_process } = req.query;
    let query = `
      SELECT DISTINCT item_code
      FROM smart.smart_machine_connect_list
    `;

    if (select_building !== "ALL") {
      query += `
        WHERE item_building = $1
      `;
    }

    if (select_process !== "ALL") {
      if (select_building !== "ALL") {
        query += ` AND `;
      } else {
        query += ` WHERE `;
      }
      query += `
        item_sub_process = $2
      `;
    }

    query += `
      ORDER BY item_code ASC;
    `;

    const queryParams = [];

    if (select_building !== "ALL") {
      queryParams.push(select_building);
    }

    if (select_process !== "ALL") {
      queryParams.push(select_process);
    }

    console.log("Executing SQL Query:", query); // Add this line for debugging
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/TableData", async (req, res) => {
//   try {
//     const result = await pool.query(
//       `
//       SELECT
//   	id,
//     item_code as machine,
//     item_desc1,
//     item_status,
//     item_building as building,
//     item_owner_cc,
//     item_sub_process as process,
//     item_iot_group1,
//     status as scada,
//     npi_year,
//     plan_date,
//     finish_date,
//     machine_buyoff,
//     pm,
//     calibration,
//     grr,
//     oee,
//     upd,
//     scr,
//     mtbf,
//     mttr,
//     history_track,
//     predictive
// FROM smart.smart_machine_connect_list ;;
//       `
//     );

//     // Send the JSON response back to the client
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

router.get("/TableData", async (req, res) => {
  try {
    const { select_building, select_process, select_machine } = req.query;

    let query = `
      SELECT
        id,
        item_code as machine,
        item_desc1,
        item_status,
        item_building as building,
        item_owner_cc,
        item_sub_process as process,
        item_iot_group1,
        status as scada,
        npi_year,
        plan_date,
        finish_date,
        machine_buyoff,
        pm,
        calibration,
        grr,
        ROUND(oee::numeric, 1) as oee,  
        upd,
        scr,
        mtbf,
        mttr,
        history_track,
        predictive
      FROM smart.smart_machine_connect_list
    `;

    // Add conditions to the query based on the provided parameters
    const queryParams = [];
    if (select_building && select_building !== "ALL") {
      query += `
        WHERE item_building = $1
      `;
      queryParams.push(select_building);
    }

    if (select_process && select_process !== "ALL") {
      if (queryParams.length === 0) {
        query += `
          WHERE
        `;
      } else {
        query += `
          AND
        `;
      }
      query += `
        item_sub_process = $${queryParams.length + 1}
      `;
      queryParams.push(select_process);
    }

    if (select_machine && select_machine !== "ALL") {
      if (queryParams.length === 0) {
        query += `
          WHERE
        `;
      } else {
        query += `
          AND
        `;
      }
      query += `
        item_code = $${queryParams.length + 1}
      `;
      queryParams.push(select_machine);
    }

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/cal", async (req, res) => {
  try {
    const { mc_ref } = req.query;

    let query = `
      SELECT
        cal.id,
        cal.equipment_code,
        cal.equipment_desc,
        TO_CHAR(cal.due_date, 'YYYY-MM-DD') AS due_date,
        TO_CHAR(cal.next_date, 'YYYY-MM-DD') AS next_date,
        TO_CHAR(cal.plan_date, 'YYYY-MM-DD') AS plan_date,
        TO_CHAR(cal.last_date, 'YYYY-MM-DD') AS last_date,
        cal.status_filter,
        cal.wsm_status_name,
        cal.mc_ref
      FROM smart.smart_machine_connect_cal AS cal
      INNER JOIN smart.smart_machine_connect_list AS list
      ON cal.mc_ref = list.item_code
    `;

    // Add conditions to the query based on the provided parameters
    const queryParams = [];

    if (mc_ref) {
      query += `
        WHERE cal.mc_ref = $1
      `;
      queryParams.push(mc_ref);
    }

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/pm", async (req, res) => {
  try {
    const { mc_code } = req.query;

    let query = `
      SELECT
    pm.id,
    pm.mc_code,
    pm.mc_desc,
    TO_CHAR(pm.due_date, 'YYYY-MM-DD') AS due_date,
    TO_CHAR(pm.actual_date, 'YYYY-MM-DD') AS actual_date,
    TO_CHAR(pm.plan_date, 'YYYY-MM-DD') AS plan_date,
    TO_CHAR(pm.last_date, 'YYYY-MM-DD') AS last_date,
    TO_CHAR(pm.next_date, 'YYYY-MM-DD') AS next_date,
    pm.cc_code,
    pm.status_desc,
    pm.stats_mc
FROM smart.smart_machine_connect_pm AS pm
INNER JOIN smart.smart_machine_connect_list AS list
ON pm.mc_code = list.item_code
    `;

    // Add conditions to the query based on the provided parameters
    const queryParams = [];

    if (mc_code) {
      query += `
        WHERE pm.mc_code = $1
      `;
      queryParams.push(mc_code);
    }

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/scr", async (req, res) => {
  try {
    const { mc_code } = req.query;

    let query = `
      SELECT
        scr.id,
        scr.mc_desc,
        scr.mc_code,
        scr.cc_code,
        scr.req_date,
        scr.status_desc,
        scr.status_filter
      FROM smart.smart_machine_connect_scr AS scr
      INNER JOIN smart.smart_machine_connect_list AS list
      ON scr.mc_code = list.item_code
    `;

    // Add conditions to the query based on the provided parameters
    const queryParams = [];

    if (mc_code) {
      query += `
        WHERE scr.mc_code = $1
      `;
      queryParams.push(mc_code);
    }

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/upd", async (req, res) => {
  try {
    const { dld_machine } = req.query;

    let query = `
     SELECT 
    upd.id,
    upd.dld_group,
    upd.dld_machine,
    upd.dld_product,
    upd.dld_proc_name,
    upd.dld_customer_name,
    upd.dld_model_name,
    upd.dld_build,
    upd.dld_proc_cust_name,
    upd.dld_year,
    upd.dld_customer_box,
    upd.dld_ok2s
FROM smart.smart_machine_upd AS upd
INNER JOIN smart.smart_machine_connect_list AS list
ON upd.dld_machine = list.item_code
    `;

    // Add conditions to the query based on the provided parameters
    const queryParams = [];

    if (dld_machine) {
      query += `
        WHERE upd.dld_machine = $1
      `;
      queryParams.push(dld_machine);
    }

    // Add the ORDER BY clause to sort by dld_product in descending order
    query += `
      ORDER BY upd.dld_product DESC;
    `;

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/oee", async (req, res) => {
  try {
    const { oee_machine } = req.query;

    let query = `
    SELECT
      oee.*,
      SPLIT_PART(oee.mc_code, '_', 1) AS oee_machine,
      ROUND(oee.percent_oee::numeric, 1) AS rounded_percent_oee,
      ROUND(oee.percent_available::numeric, 1) AS rounded_percent_available
    FROM smart.smart_machine_oee AS oee
    INNER JOIN smart.smart_machine_connect_list AS list
    ON SPLIT_PART(oee.mc_code, '_', 1) = list.item_code
    `;

    // Add conditions to the query based on the provided parameters
    const queryParams = [];

    if (oee_machine) {
      query += `
        WHERE SPLIT_PART(oee.mc_code, '_', 1) = $1
      `;
      queryParams.push(oee_machine);
    }

    // Add the ORDER BY clause to sort by date_time in descending order
    query += `
      ORDER BY oee.date_time DESC
    `;

    query += `
      LIMIT 30;
    `;

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/grr", async (req, res) => {
  try {
    const { grr_machine } = req.query;

    let query = `
    SELECT 
    grr.id,
    TO_CHAR(grr.create_at, 'YYYY-MM-DD HH24:MI') AS create_at,
    grr.mc_code,
    grr.grr_desc,
    TO_CHAR(grr.plan, 'YYYY-MM-DD HH24:MI') AS plan,
    TO_CHAR(grr.actual , 'YYYY-MM-DD HH24:MI') AS actual,
    grr.upload,
    grr.status
FROM smart.smart_machine_grr AS grr
INNER JOIN smart.smart_machine_connect_list AS list
ON grr.mc_code = list.item_code
    `;

    // Add conditions to the query based on the provided parameters
    const queryParams = [];

    if (grr_machine) {
      query += `
        WHERE mc_code = $1
      `;
      queryParams.push(grr_machine);
    }

    // Add the ORDER BY clause to sort by date_time in descending order
    query += `
      ORDER BY grr.create_at DESC
    `;

    // query += `
    //   LIMIT 30;
    // `;

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.put("/updatemachine_buyoff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { machine_buyoff } = req.body;
    console.log(machine_buyoff);
    if (!machine_buyoff) {
      return res.status(400).json({ error: "Missing machine_buyoff data" });
    }

    const machine_buyoffJson = machine_buyoff; // แปลง Array of Objects เป็น JSON
    const result = await query(
      `UPDATE smart.smart_machine_connect_list
       SET machine_buyoff = $1
       WHERE id = $2`,
      [machine_buyoffJson, id]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

router.put("/updatemachine_manual_is/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { history_track } = req.body;
    console.log(history_track);
    if (!history_track) {
      return res
        .status(400)
        .json({ error: "Missing history_track(Manual_is) data" });
    }

    const history_trackJson = history_track; // แปลง Array of Objects เป็น JSON
    const result = await query(
      `UPDATE smart.smart_machine_connect_list
       SET history_track = $1
       WHERE id = $2`,
      [history_trackJson, id]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

router.put("/deletewhat_manual_is/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Perform the deletion by setting the view_cam to null
    const result = await query(
      `UPDATE smart.smart_machine_connect_list
       SET history_track = null
       WHERE id = $1`,
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

// router.put("/updatewhat_happen_need/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { what_happen_need } = req.body;
//     console.log(what_happen_need);
//     if (!what_happen_need) {
//       return res.status(400).json({ error: "Missing attached file data" });
//     }

//     const what_happen_needJson = what_happen_need; // แปลง Array of Objects เป็น JSON
//     const result = await query(
//       `UPDATE smart.smart_kpi_a1_main
//        SET what_happen_need = $1
//        WHERE id = $2`,
//       [what_happen_needJson, id]
//     );

//     res.status(200).json({ message: "Data updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while updating data" });
//   }
// });

module.exports = router;
