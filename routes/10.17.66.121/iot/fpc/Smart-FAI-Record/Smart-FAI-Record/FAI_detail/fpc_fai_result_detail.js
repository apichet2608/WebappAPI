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

// ADD Detail

// ------------------------------

router.post("/add_detail", async (req, res) => {
  const client = await pool.connect();

  try {
    const data = req.body;

    for (const item of data) {
      const insertQuery = `
        INSERT INTO fpc.fpc_fai_result_detail (job_id, fai_no, fai_item_check, number_flag, fai_result, fai_text_result,job_id_id_header)
        VALUES ($1, $2, $3, $4, $5, $6 , $7)
      `;

      const values = [
        item.fai_record_id,
        item.fai_no,
        item.fai_item_check,
        item.number_flag,
        item.fai_result,
        item.fai_text_result,
        item.job_id_id_header,
      ];

      await client.query(insertQuery, values);
    }

    res
      .status(200)
      .json({ success: true, message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error during database operation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
});

router.post("/update", async (req, res) => {
  const client = await pool.connect();

  try {
    const data = req.body;

    for (const item of data) {
      const updateQuery = `
        UPDATE fpc.fpc_fai_result_detail 
        SET job_id = $1, 
            fai_no = $2, 
            fai_item_check = $3, 
            number_flag = $4, 
            fai_result = $5, 
            fai_text_result = $6
        WHERE id = $7
      `;

      const values = [
        item.fai_record_id,
        item.fai_no,
        item.fai_item_check,
        item.number_flag,
        item.fai_result,
        item.fai_text_result,
        item.id,
      ];

      await client.query(updateQuery, values);
    }

    res
      .status(200)
      .json({ success: true, message: "Data updated successfully" });
  } catch (error) {
    console.error("Error during database operation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
});

// ------------------------------
// UPDATE Detail
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (id === undefined || id === null) {
//       return res.status(400).json({ error: "Invalid or missing ID parameter" });
//     }

//     const { number_flag, fai_result, fai_text_result } = req.body;

//     const results = await query(
//       `
//         UPDATE fpc.fpc_fai_result_detail
//         SET
//           number_flag = $1,
//           fai_result = $2,
//           fai_text_result = $3
//         WHERE
//           id = $4;
//       `,
//       [number_flag, fai_result, fai_text_result, id]
//     );

//     res.status(200).json({ message: "Data updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while updating data" });
//   }
// });
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

//DELETE
router.delete("/:job_id_id_header", async (req, res) => {
  try {
    const { job_id_id_header } = req.params;

    const results = await query(
      `delete
from
	fpc.fpc_fai_result_detail
where
	job_id_id_header = $1;
      `,
      [job_id_id_header]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

module.exports = router;
