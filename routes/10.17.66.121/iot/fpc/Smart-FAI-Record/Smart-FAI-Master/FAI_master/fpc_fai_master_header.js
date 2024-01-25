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

router.get("/fai_master_table", async (req, res) => {
  try {
    const { fai_dept, fai_proc_group, fai_record } = req.query;
    let query = `
      SELECT
        id,
        TO_CHAR(ffmh.create_at, 'YYYY-MM-DD HH24:MI:SS') AS create_at,
        TO_CHAR(ffmh.update_at, 'YYYY-MM-DD HH24:MI:SS') AS update_at,
        fai_dept,
        fai_proc_group,
        fai_product,
        fai_lot,
        fai_mc_code,
        fai_tool,
        fai_side,
        fai_record_id,
        fai_record,
        fai_no,
        fai_item_check,
        std_target,
        std_min,
        std_max,
        number_flag
      FROM
        fpc.fpc_fai_master_header ffmh
    `;

    const queryParams = [];
    let whereClauseAdded = false;

    if (fai_dept && fai_dept !== "ALL") {
      query += `
        WHERE fai_dept = $1
      `;
      queryParams.push(fai_dept);
      whereClauseAdded = true;
    }

    if (fai_proc_group && fai_proc_group !== "ALL") {
      if (whereClauseAdded) {
        query += ` AND `;
      } else {
        query += ` WHERE `;
        whereClauseAdded = true;
      }
      query += `
        fai_proc_group = $${queryParams.length + 1}
      `;
      queryParams.push(fai_proc_group);
    }

    if (fai_record && fai_record !== "ALL") {
      if (whereClauseAdded) {
        query += ` AND `;
      } else {
        query += ` WHERE `;
      }
      query += `
        fai_record = $${queryParams.length + 1}
      `;
      queryParams.push(fai_record);
    }
    // query += `
    //   ORDER BY
    // `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_fai_dept", async (req, res) => {
  try {
    const result = await pool.query(
      `
    select distinct fai_dept 
    from fpc.fpc_fai_master_header ffmh
    where
	number_flag is not null
	and number_flag != ''
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_fai_proc_group", async (req, res) => {
  try {
    const { fai_dept } = req.query;
    let query = `
  SELECT DISTINCT fai_proc_group 
  FROM fpc.fpc_fai_master_header ffmh 
  WHERE number_flag IS NOT NULL
    AND number_flag != ''
`;

    if (fai_dept !== "ALL") {
      query += `
    AND fai_dept = $1
  `;
    }

    const queryParams = fai_dept !== "ALL" ? [fai_dept] : [];

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_fai_record", async (req, res) => {
  try {
    const { fai_dept, fai_proc_group } = req.query;

    let query = `
      SELECT DISTINCT fai_record 
      FROM fpc.fpc_fai_master_header ffmh 
      WHERE number_flag IS NOT NULL
        AND number_flag != ''
    `;

    if (fai_dept && fai_dept !== "ALL") {
      query += `
        AND fai_dept = $1
      `;
    }

    if (fai_proc_group && fai_proc_group !== "ALL") {
      if (fai_dept && fai_dept !== "ALL") {
        query += ` AND `;
      } else {
        query += ` AND `;
      }
      query += `
        fai_proc_group = $2
      `;
    }

    const queryParams = [];
    if (fai_dept && fai_dept !== "ALL") {
      queryParams.push(fai_dept);
    }
    if (fai_proc_group && fai_proc_group !== "ALL") {
      queryParams.push(fai_proc_group);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//EDIT Master
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fai_item_check, std_target, std_min, std_max, number_flag } =
      req.body;

    const results = await query(
      `
      UPDATE smart.smart_aut_die_detail
      SET
        fai_item_check = $1,
        std_target = $2,
        std_min = $3,
        std_max = $4,
        number_flag = $5
      WHERE
        id = $6
      `,
      [fai_item_check, std_target, std_min, std_max, number_flag, id]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

module.exports = router;
