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

// router.get("/result_header_table", async (req, res) => {
//   try {
//     const fai_dept = req.query.fai_dept;

//     const result = await pool.query(
//       `
//        SELECT DISTINCT
//           rsh.id,
//           rsh.job_id,
//           rsh.fai_product,
//           rsh.fai_lot,
//           rsh.fai_mc_code,
//           rsh.fai_tool,
//           rsh.fai_side,
//           rsh.judgement,
//           rsh.record_by,
//           rsh.approve_by,
//           rsh.approve_date,
//           rsh.fai_lock,
//           mst.fai_record_id,
//           mst.fai_dept,
//           mst.fai_proc_group,
//           mst.fai_product
//        FROM
//           fpc.fpc_fai_result_header rsh
//        INNER JOIN
//           fpc.fpc_fai_master_header mst ON rsh.job_id = mst.fai_record_id
//        WHERE
//           mst.fai_dept = $1
//         ORDER BY
//           rsh.id DESC;
//       `,
//       [fai_dept]
//     );

//     // Send the JSON response back to the client
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

router.get("/result_header_table", async (req, res) => {
  try {
    const { fai_dept, fai_proc_group, fai_record } = req.query;

    const result = await pool.query(
      `
       SELECT DISTINCT
          rsh.id,
          rsh.job_id,
          rsh.fai_product,
          rsh.fai_lot,
          rsh.fai_mc_code,
          rsh.fai_tool,
          rsh.fai_side,
          rsh.judgement,
          rsh.record_by,
          rsh.approve_by,
          rsh.approve_date,
          rsh.fai_lock,
          mst.fai_record_id,
          mst.fai_dept,
          mst.fai_proc_group,
          mst.fai_product as fai_product_master,
          mst.fai_record
       FROM
          fpc.fpc_fai_result_header rsh
       INNER JOIN
          fpc.fpc_fai_master_header mst ON rsh.job_id = mst.fai_record_id
       WHERE
          mst.fai_dept = $1
          AND mst.fai_proc_group = $2
          AND mst.fai_record = $3
        ORDER BY
          rsh.id DESC;
      `,
      [fai_dept, fai_proc_group, fai_record]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/select_record_id", async (req, res) => {
  try {
    const { fai_dept, fai_proc_group, fai_record } = req.query;
    let query = `
     SELECT
	    DISTINCT fai_record_id
      FROM
	    fpc.fpc_fai_master_header
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
        whereClauseAdded = true;
      }
      query += `
        fai_record = $${queryParams.length + 1}
      `;
      queryParams.push(fai_record);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// ADD HEADER
// router.put("/add_create", async (req, res) => {
//   console.log("PUT request received at /add_create");
//   console.log("Request body:", req.body);

//   try {
//     // Validate the presence of required fields in the request body
//     const requiredFields = [
//       "job_id",
//       "fai_product",
//       "fai_lot",
//       "fai_mc_code",
//       "fai_tool",
//       "fai_side",
//       "judgement",
//       "approve_by",
//       "approve_date",
//       "record_by",
//     ];

//     for (const field of requiredFields) {
//       if (!(field in req.body) || req.body[field] === null) {
//         return res.status(400).json({
//           error: `Missing or invalid value for required field: ${field}`,
//         });
//       }
//     }

//     const {
//       job_id,
//       fai_product,
//       fai_lot,
//       fai_mc_code,
//       fai_tool,
//       fai_side,
//       judgement,
//       approve_by,
//       approve_date,
//       record_by,
//     } = req.body;

//     // Use parameterized query to prevent SQL injection
//     const insertQuery = `
//       INSERT INTO fpc.fpc_fai_result_header (
//         job_id,
//         fai_product,
//         fai_lot,
//         fai_mc_code,
//         fai_tool,
//         fai_side,
//         judgement,
//         approve_by,
//         approve_date,
//         record_by
//       )
//       VALUES ($1, $2, $3, $4, $5, $6 ,$7 ,$8, $9, $10)
//       RETURNING *;
//     `;

//     const result = await pool.query(insertQuery, [
//       job_id,
//       fai_product,
//       fai_lot,
//       fai_mc_code,
//       fai_tool,
//       fai_side,
//       judgement || null,
//       approve_by || null,
//       approve_date || null,
//       record_by || null,
//     ]);

//     res.status(200).json({ message: "Success", data: result.rows[0] });
//   } catch (error) {
//     console.error("Error adding data:", error);
//     res
//       .status(500)
//       .json({ error: `An error occurred while adding data: ${error.message}` });
//   }
// });

router.put("/add_create", async (req, res) => {
  console.log("PUT request received at /add_create");
  console.log("Request body:", req.body);

  try {
    // Validate the presence of required fields in the request body
    const requiredFields = [
      "job_id",
      "fai_product",
      "fai_lot",
      "fai_mc_code",
      "fai_tool",
      "fai_side",
      "judgement",
      "approve_by",
      "approve_date",
      "record_by",
    ];

    for (const field of requiredFields) {
      if (!(field in req.body) || req.body[field] === null) {
        return res.status(400).json({
          error: `Missing or invalid value for required field: ${field}`,
        });
      }
    }

    const {
      job_id,
      fai_product,
      fai_lot,
      fai_mc_code,
      fai_tool,
      fai_side,
      judgement,
      approve_by,
      approve_date,
      record_by,
    } = req.body;

    // Convert fai_mc_code to uppercase
    const uppercaseFaiMcCode = fai_mc_code.toUpperCase();

    // Use parameterized query to prevent SQL injection
    const insertQuery = `
      INSERT INTO fpc.fpc_fai_result_header (
        job_id,
        fai_product,
        fai_lot,
        fai_mc_code,
        fai_tool,
        fai_side,
        judgement,
        approve_by,
        approve_date,
        record_by
      )
      VALUES ($1, $2, $3, $4, $5, $6 ,$7 ,$8, $9, $10)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      job_id,
      fai_product,
      fai_lot,
      uppercaseFaiMcCode, // Use the converted value here
      fai_tool,
      fai_side,
      judgement || null,
      approve_by || null,
      approve_date || null,
      record_by || null,
    ]);

    res.status(200).json({ message: "Success", data: result.rows[0] });
  } catch (error) {
    console.error("Error adding data:", error);
    res
      .status(500)
      .json({ error: `An error occurred while adding data: ${error.message}` });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fai_product,
      fai_lot,
      fai_mc_code,
      fai_tool,
      fai_side,
      judgement,
      approve_by,
      record_by,
    } = req.body;

    // Get the current date and time in the desired format

    const results = await query(
      `
        UPDATE fpc.fpc_fai_result_header
        SET
          fai_product = $1,
          fai_lot = $2,
          fai_mc_code = $3,
          fai_tool = $4,
          fai_side = $5,
          judgement = $6,
          record_by = $8,
          approve_by = $7,
          approve_date = now()
        WHERE
          id = $9;
      `,
      [
        fai_product,
        fai_lot,
        fai_mc_code,
        fai_tool,
        fai_side,
        judgement,
        approve_by,
        record_by,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// ADD Detail

// Check  check_detail
router.get("/check_detail", async (req, res) => {
  try {
    const { fai_record_id } = req.query;

    const result = await pool.query(
      `
     select
	job_id as fai_record_id
from
	fpc.fpc_fai_result_detail
where
	job_id_id_header = $1
      `,
      [fai_record_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Filter_detail
router.get("/Filter_detail", async (req, res) => {
  try {
    const { fai_record_id } = req.query;

    const result = await pool.query(
      `
      select
	id,
	job_id as fai_record_id,
	fai_no,
	fai_item_check,
	number_flag,
	fai_result,
	fai_text_result
from
	fpc.fpc_fai_result_detail
where
	job_id_id_header = $1
order by
	job_id_id_header , fai_no asc
      `,
      [fai_record_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Filter_master
router.get("/Filter_master", async (req, res) => {
  try {
    const { fai_record_id } = req.query;

    const result = await pool.query(
      `
     select
	fai_record_id,
	fai_no,
	fai_item_check,
	number_flag,
	id
from
	fpc.fpc_fai_master_header
where
	fai_record_id = $1
order by
	fai_record_id , fai_no asc
      `,
      [fai_record_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//Edit Master
router.put("/EditMaster/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fai_item_check, std_target, std_min, std_max, number_flag } =
      req.body;

    const result = await pool.query(
      `
      UPDATE fpc.fpc_fai_master_header
      SET
        fai_item_check = $1,
        std_target = $2,
        std_min = $3,
        std_max = $4,
        number_flag = $5
      WHERE
        id = $6;
      `,
      [fai_item_check, std_target, std_min, std_max, number_flag, id]
    );

    // Check if the update affected any rows
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const results = await query(
      `DELETE FROM fpc.fpc_fai_result_header
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

// Page Over all Record
router.get("/distinct_fai_dept", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT
        mst.fai_dept
      FROM
        fpc.fpc_fai_result_header rsh
      INNER JOIN
        fpc.fpc_fai_master_header mst ON rsh.job_id = mst.fai_record_id
      ORDER BY
        mst.fai_dept;
      `
    );
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
      SELECT DISTINCT
        mst.fai_proc_group
      FROM
        fpc.fpc_fai_result_header rsh
      INNER JOIN
        fpc.fpc_fai_master_header mst ON rsh.job_id = mst.fai_record_id
    `;
    if (fai_dept !== "ALL") {
      query += `
        WHERE fai_dept = $1
      `;
    }
    query += `
      ORDER BY
        mst.fai_proc_group;
    `;
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
       SELECT DISTINCT
        mst.fai_record
      FROM
        fpc.fpc_fai_result_header rsh
       INNER JOIN
        fpc.fpc_fai_master_header mst ON rsh.job_id = mst.fai_record_id
    `;

    const queryParams = [];

    if (fai_dept !== "ALL") {
      query += `
        WHERE mst.fai_dept = $1
      `;
      queryParams.push(fai_dept);
    }

    if (fai_proc_group !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND `;
      } else {
        query += ` WHERE `;
      }
      query += ` mst.fai_proc_group = $${queryParams.length + 1}`;
      queryParams.push(fai_proc_group);
    }

    query += `
      ORDER BY mst.fai_record DESC;
    `;

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Table Over all Record

router.get("/Table_OverAll_record", async (req, res) => {
  const { fai_dept, fai_proc_group, fai_record } = req.query;

  try {
    let condition = "";
    let params = [];

    if (fai_dept && fai_dept !== "ALL") {
      condition += " AND mst.fai_dept = $" + (params.length + 1);
      params.push(fai_dept);
    }

    if (fai_proc_group && fai_proc_group !== "ALL") {
      condition += " AND mst.fai_proc_group = $" + (params.length + 1);
      params.push(fai_proc_group);
    }

    if (fai_record && fai_record !== "ALL") {
      condition += " AND mst.fai_record = $" + (params.length + 1);
      params.push(fai_record);
    }

    const result = await pool.query(
      `
       SELECT DISTINCT
          rsh.id,
          rsh.job_id,
          rsh.fai_product,
          rsh.fai_lot,
          rsh.fai_mc_code,
          rsh.fai_tool,
          rsh.fai_side,
          rsh.judgement,
          rsh.record_by,
          rsh.approve_by,
          rsh.approve_date,
          rsh.fai_lock,
          mst.fai_record_id,
          mst.fai_dept,
          mst.fai_proc_group,
          mst.fai_record,
          mst.fai_product
       FROM
          fpc.fpc_fai_result_header rsh
       INNER JOIN
          fpc.fpc_fai_master_header mst ON rsh.job_id = mst.fai_record_id
       WHERE 1=1 ${condition}
       ORDER BY
          rsh.id DESC;
      `,
      params
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//APichet
router.get("/GetDataandIDfpc_fai_result_header", async (req, res) => {
  try {
    const { fai_product, fai_lot, fai_side, fai_mc_code, fai_tool, job_id } =
      req.query;

    const result = await pool.query(
      `
     select
	id,
	create_at,
	job_id,
	fai_product,
	fai_lot,
	fai_mc_code,
	fai_tool,
	fai_side,
	judgement,
	approve_by,
	approve_date,
	fai_lock,
	is_send,
	update_file,
	record_by
from
	fpc.fpc_fai_result_header
where 
	fai_product = $1
	and fai_lot = $2
	and fai_side = $3
	and fai_mc_code = $4
	and fai_tool = $5
	and job_id = $6
      `,
      [fai_product, fai_lot, fai_side, fai_mc_code, fai_tool, job_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;

// NOTE
// router.get("/Table_OverAll_record", async (req, res) => {
//   try {
//     const fai_dept = req.query.fai_dept;
//     const fai_proc_group = req.query.fai_proc_group;
//     const fai_record = req.query.fai_record;

//     let whereClause = "";
//     let queryParams = [];

//     if (fai_dept && fai_dept !== "ALL") {
//       whereClause += " AND mst.fai_dept = $1";
//       queryParams.push(fai_dept);
//     }

//     if (fai_proc_group && fai_proc_group !== "ALL") {
//       whereClause += " AND mst.fai_proc_group = $2";
//       queryParams.push(fai_proc_group);
//     }

//     if (fai_record && fai_record !== "ALL") {
//       whereClause += " AND mst.fai_record = $3";
//       queryParams.push(fai_record);
//     }

//   const { fai_dept, fai_proc_group, fai_record } = req.query;

//   try {
//     let condition = "";
//     let params = [];

//     if (fai_dept && fai_dept !== "ALL") {
//       condition += "mst.fai_dept = $1";
//       params.push(fai_dept);
//     }

//     if (fai_proc_group && fai_proc_group !== "ALL") {
//       if (condition !== "") condition += " AND ";
//       condition += "mst.fai_proc_group  = $" + (params.length + 1);
//       params.push(fai_proc_group);
//     }

//     if (fai_record && fai_record !== "ALL") {
//       if (condition !== "") condition += " AND ";
//       condition += "mst.fai_record = $" + (params.length + 1);
//       params.push(fai_record);
//     }

//     const result = await pool.query(
//       `
//        SELECT DISTINCT
//           rsh.id,
//           rsh.job_id,
//           rsh.fai_product,
//           rsh.fai_lot,
//           rsh.fai_mc_code,
//           rsh.fai_tool,
//           rsh.fai_side,
//           rsh.judgement,
//           rsh.record_by,
//           rsh.approve_by,
//           rsh.approve_date,
//           rsh.fai_lock,
//           mst.fai_record_id,
//           mst.fai_dept,
//           mst.fai_proc_group,
//           mst.fai_record,
//           mst.fai_product
//        FROM
//           fpc.fpc_fai_result_header rsh
//        INNER JOIN
//           fpc.fpc_fai_master_header mst ON rsh.job_id = mst.fai_record_id
//        WHERE 1=1 ${whereClause}
//        ORDER BY
//           rsh.id DESC;
//       `,
//       queryParams
//     );

//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });
