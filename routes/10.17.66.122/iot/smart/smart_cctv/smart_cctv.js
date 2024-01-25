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

router.get("/distinct_build", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct build 
from smart.smart_cctv sc 
      
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_unit", async (req, res) => {
  try {
    const { select_build } = req.query;
    let queryStr = `
      select distinct unit  
from smart.smart_cctv sc 
    `;

    let queryParams = [];

    if (select_build !== "ALL") {
      queryStr += `
        where build = $1
      `;
      queryParams.push(select_build);
    }
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_process_station", async (req, res) => {
  try {
    const { select_build, select_unit } = req.query;
    let queryStr = `
      SELECT DISTINCT process_station
      FROM smart.smart_cctv sc
    `;

    let queryParams = [];

    if (select_build !== "ALL") {
      queryStr += `
      WHERE build = $1
      `;
      queryParams.push(select_build);
    }

    if (select_unit !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
        WHERE unit = $1
        `;
      } else {
        queryStr += `
        AND unit = $2
        `;
      }
      queryParams.push(select_unit);
    }

    // You can add an ORDER BY clause here if needed
    // queryStr += `
    //   ORDER BY ...
    // `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_location", async (req, res) => {
  try {
    const { select_build, select_unit, select_process_station } = req.query;
    let queryStr = `
      SELECT DISTINCT "location"  
      FROM smart.smart_cctv sc
    `;

    let queryParams = [];

    if (select_build !== "ALL") {
      queryStr += `
        WHERE build = $${queryParams.length + 1}
      `;
      queryParams.push(select_build);
    }

    if (select_unit !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
          WHERE unit = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          AND unit = $${queryParams.length + 1}
        `;
      }
      queryParams.push(select_unit);
    }

    if (select_process_station !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
          WHERE process_station = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          AND process_station = $${queryParams.length + 1}
        `;
      }
      queryParams.push(select_process_station);
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_active", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct fill_low 
from smart.smart_cctv sc  
      
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_condition", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct condition_cam
from smart.smart_cctv sc  
      
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/cctv_Table", async (req, res) => {
  try {
    const {
      select_build,
      select_unit,
      select_process_station,
      select_location,
      condition_status, // New parameter
    } = req.query;

    let queryStr = `
      SELECT *
      FROM smart.smart_cctv sc
    `;

    let queryParams = [];

    if (select_build !== "ALL") {
      queryStr += `
        WHERE build = $${queryParams.length + 1}
      `;
      queryParams.push(select_build);
    }

    if (select_unit !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND unit = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE unit = $${queryParams.length + 1}
        `;
      }
      queryParams.push(select_unit);
    }

    if (select_process_station !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND process_station = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE process_station = $${queryParams.length + 1}
        `;
      }
      queryParams.push(select_process_station);
    }

    if (select_location !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND location = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE location = $${queryParams.length + 1}
        `;
      }
      queryParams.push(select_location);
    }

    if (condition_status !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND condition_cam = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE condition_cam = $${queryParams.length + 1}
        `;
      }
      queryParams.push(condition_status);
    }
    queryStr += `
      ORDER BY build, unit, machine,position_cam;
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/condition_cam", async (req, res) => {
  try {
    const {
      select_build,
      select_unit,
      select_process_station,
      select_location,
    } = req.query;

    const result = await pool.query(
      `
      SELECT
        conditions.condition_cam,
        COALESCE(COUNT(result_data.condition_cam), 0) AS Result
      FROM (
        SELECT 'Move' AS condition_cam
        UNION ALL
        SELECT 'Completed' AS condition_cam
        UNION ALL
        SELECT 'Adjust' AS condition_cam
        UNION ALL
        SELECT 'Need' AS condition_cam
      ) AS conditions
      LEFT JOIN (
        SELECT condition_cam
        FROM smart.smart_cctv
        WHERE
          (
            ($1 = 'ALL' OR build = $1)
            AND ($2 = 'ALL' OR unit = $2)
            AND ($3 = 'ALL' OR process_station = $3)
            AND ($4 = 'ALL' OR location = $4)
          )
          AND condition_cam IN ('Move', 'Completed', 'Adjust', 'Need')
      ) AS result_data ON conditions.condition_cam = result_data.condition_cam
      GROUP BY conditions.condition_cam;
      `,
      [select_build, select_unit, select_process_station, select_location]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/con_result", async (req, res) => {
  try {
    const select_build = req.query.select_build;
    const select_unit = req.query.select_unit;
    const select_process_station = req.query.select_process_station;
    const select_location = req.query.select_location;

    // เช็คเงื่อนไขเพื่อกำหนดคำสั่ง SQL
    let conditionSQL = "";
    if (select_build !== "ALL") {
      conditionSQL += " AND build = $1";
    }
    if (select_unit !== "ALL") {
      conditionSQL += " AND unit = $2";
    }
    if (select_process_station !== "ALL") {
      conditionSQL += " AND process_station = $3";
    }
    if (select_location !== "ALL") {
      conditionSQL += " AND location = $4";
    }

    const query = `
      SELECT
        CASE
            WHEN condition_cam = 'Move' THEN 'Move'
            WHEN condition_cam = 'Need' THEN 'Need'
            WHEN condition_cam = 'Completed' THEN 'Completed'
            WHEN condition_cam = 'Adjust' THEN 'Adjust'
            ELSE 'null'
        END AS condition_cam,
        position_cam,
        COALESCE(COUNT(*), 0) AS result
      FROM smart.smart_cctv sc
      WHERE 1=1 ${conditionSQL}
      GROUP BY condition_cam, position_cam;
    `;

    const queryParams = [];
    if (select_build !== "ALL") {
      queryParams.push(select_build);
    }
    if (select_unit !== "ALL") {
      queryParams.push(select_unit);
    }
    if (select_process_station !== "ALL") {
      queryParams.push(select_process_station);
    }
    if (select_location !== "ALL") {
      queryParams.push(select_location);
    }

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/4btn_card", async (req, res) => {
  try {
    const {
      select_build,
      select_unit,
      select_process_station,
      select_location,
    } = req.query;

    const query = `
      SELECT condition_cam, COUNT(*) AS result
FROM (
  SELECT 'ALL' AS condition_cam, 1 AS sort_order
  FROM smart.smart_cctv
  WHERE
    (condition_cam IN ('Move', 'Need', 'Completed', 'Adjust'))
    AND
    ($1 = 'ALL' OR build = $1)
    AND
    ($2 = 'ALL' OR unit = $2)
    AND
    ($3 = 'ALL' OR process_station = $3)
    AND
    ($4 = 'ALL' OR location = $4)
  UNION ALL
  SELECT condition_cam, 2 AS sort_order
  FROM smart.smart_cctv
  WHERE 
    (condition_cam IN ('Move', 'Need', 'Completed', 'Adjust'))
    AND
    ($1 = 'ALL' OR build = $1)
    AND
    ($2 = 'ALL' OR unit = $2)
    AND
    ($3 = 'ALL' OR process_station = $3)
    AND
    ($4 = 'ALL' OR location = $4)
) AS combined_data
GROUP BY condition_cam, sort_order
ORDER BY sort_order, condition_cam;
    `;

    const values = [
      select_build,
      select_unit,
      select_process_station,
      select_location,
    ];

    const result = await pool.query(query, values);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      build,
      unit,
      process_station,
      machine,
      location,
      type,
      fill_low,
      position_cam,
      cam_id,
      condition_cam,
      condition_desc,
      view_cam,
      audit,
      pass_date,
      update_date,
    } = req.body;

    const result = await query(
      `UPDATE smart.smart_cctv
       SET
         build = $1,
         unit = $2,
         process_station = $3,
         machine = $4,
         "location" = $5,
         "type" = $6,
         fill_low = $7,
         position_cam = $8,
         cam_id = $9,
         condition_cam = $10,
         condition_desc = $11,
         view_cam = $12,
         audit = $13,
         pass_date = $14,
         update_date = $15
       WHERE id = $16;`,
      [
        build,
        unit,
        process_station,
        machine,
        location,
        type,
        fill_low,
        position_cam,
        cam_id,
        condition_cam,
        condition_desc,
        view_cam,
        audit,
        pass_date,
        update_date,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

//put
router.put("/updateview_cam/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { view_cam } = req.body;
    console.log(view_cam);
    if (!view_cam) {
      return res.status(400).json({ error: "Missing attached file data" });
    }

    const view_camJson = view_cam; // แปลง Array of Objects เป็น JSON
    const result = await query(
      `UPDATE smart.smart_cctv
       SET view_cam = $1
       WHERE id = $2`,
      [view_camJson, id]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// Delete the view_cam for a specific record
router.put("/deleteview_camJson/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Perform the deletion by setting the view_cam to null
    const result = await query(
      `UPDATE smart.smart_cctv
       SET view_cam = null
       WHERE id = $1`,
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

router.get("/piechart2", async (req, res) => {
  try {
    const select_build = req.query.select_build;
    const select_unit = req.query.select_unit;
    const select_process_station = req.query.select_process_station;

    // Define the WHERE clause conditions based on the provided values
    const whereConditions = [];
    const queryParams = [];

    if (select_build !== "ALL") {
      whereConditions.push("build = $1");
      queryParams.push(select_build);
    }

    if (select_unit !== "ALL") {
      whereConditions.push("unit = $2");
      queryParams.push(select_unit);
    }

    if (select_process_station !== "ALL") {
      whereConditions.push("process_station = $3");
      queryParams.push(select_process_station);
    }

    // Construct the WHERE clause
    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    const result = await pool.query(
      `
      SELECT
        position_cam,
        condition_cam,
        process_station,
        COUNT(condition_cam) AS condition_count,
        ROW_NUMBER() OVER (ORDER BY process_station, COUNT(condition_cam) DESC) AS id
      FROM smart.smart_cctv
      ${whereClause}
      GROUP BY process_station, position_cam, condition_cam
      ORDER BY process_station, COUNT(condition_cam) DESC;
      `,
      queryParams
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_unit_t", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct unit 
from smart.smart_cctv sc 
      
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_proc", async (req, res) => {
  try {
    const { select_unit } = req.query;
    let queryStr = `
      SELECT DISTINCT process_station
      FROM smart.smart_cctv sc
    `;

    let queryParams = [];

    if (select_unit !== "ALL") {
      queryStr += `
        WHERE unit = $1
      `;
      queryParams.push(select_unit);
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_type", async (req, res) => {
  try {
    const { select_unit, select_proc } = req.query;
    let queryStr = `
      SELECT DISTINCT type
      FROM smart.smart_cctv sc
    `;

    let queryParams = [];

    if (select_unit !== "ALL") {
      queryStr += `
      WHERE unit = $1
      `;
      queryParams.push(select_unit);
    }

    if (select_proc !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
        WHERE process_station = $1
        `;
      } else {
        queryStr += `
        AND process_station = $2
        `;
      }
      queryParams.push(select_proc);
    }

    // You can add an ORDER BY clause here if needed
    // queryStr += `
    //   ORDER BY ...
    // `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/Table_coverage", async (req, res) => {
  const { select_unit, select_proc, select_type } = req.query;

  try {
    let queryParams = []; // An array to hold the query parameters

    // Construct the WHERE clause for filtering based on parameters
    let whereClause = "";
    if (select_unit !== "ALL") {
      whereClause += " AND t.unit = $1";
      queryParams.push(select_unit);
    }
    if (select_proc !== "ALL") {
      whereClause += " AND t.process_station = $" + (queryParams.length + 1);
      queryParams.push(select_proc);
    }
    if (select_type !== "ALL") {
      whereClause += ' AND t."type" = $' + (queryParams.length + 1);
      queryParams.push(select_type);
    }

    const result = await pool.query(
      `
      SELECT
        ROW_NUMBER() OVER () AS id,
        sq1.unit,
        sq1.process_station,
        sq1.type,
        sq1.position_cam as cam_position,
        sq1.cam_status,
        sq1.mc_qty,
        sq1.total_mc,
        ROUND(sq1.p_coverage, 1) AS percent_coverage,
        ROUND(sq1.t_percent_coverage, 1) AS total_percent_coverage
      FROM
        (
          WITH CoverageData AS (
            SELECT
              t.unit,
              t.process_station,
              t."type",
              t.position_cam,
              CASE
                WHEN t.condition_cam = 'Completed' THEN 'Completed'
                ELSE 'Incomplete'
              END AS condition_cam_updated,
              COUNT(*) AS count,
              SUM(COUNT(*)) OVER (PARTITION BY t.unit, t.process_station, t."type") AS sum_count,
              (COUNT(*) * 100.0) / SUM(COUNT(*)) OVER (PARTITION BY t.unit, t.process_station, t."type") AS p_coverage
            FROM
              smart.smart_cctv t
            WHERE 1=1 ${whereClause}  -- Include the WHERE clause
            GROUP BY
              t.unit, t.process_station, t."type", t.position_cam, condition_cam_updated
          )
          SELECT
            unit,
            process_station,
            "type",
            position_cam,
            condition_cam_updated AS cam_status,
            count AS mc_qty,
            sum_count AS total_mc,
            p_coverage,
            SUM(p_coverage) OVER (PARTITION BY unit, process_station, "type", condition_cam_updated) AS t_percent_coverage
          FROM
            CoverageData
          ORDER BY
            process_station ASC
        ) sq1
      ORDER BY
        CASE
          WHEN sq1.unit = 'PTH' THEN 1
          WHEN sq1.unit = 'CFM' THEN 2
          WHEN sq1.unit = 'LPI' THEN 3
          WHEN sq1.unit = 'CVC' THEN 4
          WHEN sq1.unit = 'SFT' THEN 5
          WHEN sq1.unit = 'FIN' THEN 6
          ELSE 7
        END,
        sq1.process_station ASC, position_cam, cam_status ;
      `,
      queryParams // Pass the array of query parameters
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Card_Audit", async (req, res) => {
  const { select_build, select_unit, select_process_station, select_location } =
    req.query;

  try {
    const whereClause = [];
    const queryParams = [];

    if (select_build && select_build !== "ALL") {
      whereClause.push(`smart_cctv.build = $${queryParams.length + 1}`);
      queryParams.push(select_build);
    }

    if (select_unit && select_unit !== "ALL") {
      whereClause.push(`smart_cctv.unit = $${queryParams.length + 1}`);
      queryParams.push(select_unit);
    }

    if (select_process_station && select_process_station !== "ALL") {
      whereClause.push(
        `smart_cctv.process_station = $${queryParams.length + 1}`
      );
      queryParams.push(select_process_station);
    }

    if (select_location && select_location !== "ALL") {
      whereClause.push(`smart_cctv.location = $${queryParams.length + 1}`);
      queryParams.push(select_location);
    }

    const whereClauseString =
      whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

    const query = `
    SELECT
      SUM(CASE WHEN audit = 'Fail' THEN 1 ELSE 0 END) AS Fail_Count,
      SUM(CASE WHEN audit = 'Pass' THEN 1 ELSE 0 END) AS Pass_Count,
      SUM(CASE WHEN audit = 'Wait' THEN 1 ELSE 0 END) AS Wait_Count,
      COUNT(*) AS Total_Count,
      (SUM(CASE WHEN audit = 'Fail' THEN 1 ELSE 0 END) / CAST(COUNT(*) AS decimal)) * 100 AS Fail_Percentage,
      (SUM(CASE WHEN audit = 'Pass' THEN 1 ELSE 0 END) / CAST(COUNT(*) AS decimal)) * 100 AS Pass_Percentage,
      (SUM(CASE WHEN audit = 'Wait' THEN 1 ELSE 0 END) / CAST(COUNT(*) AS decimal)) * 100 AS Wait_Percentage
    FROM smart.smart_cctv
    ${whereClauseString};
    `;

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/piechart", async (req, res) => {
  try {
    // Extract parameters from the request query
    const {
      select_build,
      select_unit,
      select_process_station,
      select_location,
    } = req.query;

    // Define an array to store parameters for the query
    const queryParams = [];

    // Build the WHERE clause conditions and add parameters to the array
    let whereClause = "";
    if (select_build && select_build !== "ALL") {
      whereClause += "build = $1";
      queryParams.push(select_build);
    } else {
      whereClause += "TRUE";
    }

    if (select_unit && select_unit !== "ALL") {
      whereClause += `${whereClause.length > 0 ? " AND " : ""}unit = $${
        queryParams.length + 1
      }`;
      queryParams.push(select_unit);
    }

    if (select_process_station && select_process_station !== "ALL") {
      whereClause += `${
        whereClause.length > 0 ? " AND " : ""
      }process_station = $${queryParams.length + 1}`;
      queryParams.push(select_process_station);
    }

    if (select_location && select_location !== "ALL") {
      whereClause += `${whereClause.length > 0 ? " AND " : ""}location = $${
        queryParams.length + 1
      }`;
      queryParams.push(select_location);
    }

    // Use parameters in the SQL query
    const result = await pool.query(
      `
       SELECT
         position_cam,
         condition_cam,
         process_station,
         COUNT(condition_cam) as condition_count,
         ROW_NUMBER() OVER (ORDER BY process_station, COUNT(condition_cam) DESC) as id
       FROM
         smart.smart_cctv
       WHERE
         ${whereClause}
       GROUP BY
         process_station,
         position_cam,
         condition_cam
       ORDER BY
         process_station,
         COUNT(condition_cam) DESC;
      `,
      queryParams
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
