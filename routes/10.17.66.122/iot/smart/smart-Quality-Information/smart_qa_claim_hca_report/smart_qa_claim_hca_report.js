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

// router.post("/Add_hca_report", async (req, res) => {
//   try {
//     const {
//       hca_no,
//       doc_issue_date,
//       distri_to,
//       plan_date,
//       resp_dri,
//       finish_date,
//       approve_by,
//       approve_date,
//       car_no,
//       note_result,
//     } = req.body;

//     const result = await pool.query(
//       `
//       INSERT INTO smart.smart_qa_claim_hca_report
//       (hca_no, doc_issue_date, distri_to, plan_date, resp_dri, finish_date, approve_by, approve_date, car_no, note_result)
//       VALUES
//       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
//       `,
//       [
//         hca_no,
//         doc_issue_date,
//         distri_to,
//         plan_date,
//         resp_dri,
//         finish_date,
//         approve_by,
//         approve_date,
//         car_no,
//         note_result,
//       ]
//     );

//     // Send the JSON response back to the client
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

router.post("/Add_hca_report", async (req, res) => {
  const client = await pool.connect();

  try {
    const data = req.body; // Assuming `data` is an array of records
    const firstItemHeaderId = data[0].id_smart_qa_claim_header;

    const checkQuery = `
      SELECT 1
      FROM smart.smart_qa_claim_hca_report
      WHERE id_smart_qa_claim_header = $1
      LIMIT 1
    `;
    const checkResult = await client.query(checkQuery, [firstItemHeaderId]);

    if (!checkResult.rows.length > 0) {
      for (const item of data) {
        const insertQuery = `
          INSERT INTO smart.smart_qa_claim_hca_report
          (hca_no, doc_issue_date, distri_to, plan_date, resp_dri, finish_date, approve_by, approve_date, car_no, note_result, id_smart_qa_claim_header)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        const values = [
          item.hca_no,
          item.doc_issue_date,
          item.distri_to,
          item.plan_date,
          item.resp_dri,
          item.finish_date,
          item.approve_by,
          item.approve_date,
          item.car_no,
          item.note_result,
          item.id_smart_qa_claim_header,
        ];
        await client.query(insertQuery, values);
      }
    } else {
      for (const item of data) {
        const updateQuery = `
          UPDATE smart.smart_qa_claim_hca_report
          SET hca_no = $1, doc_issue_date = $2, distri_to = $3, plan_date = $4, resp_dri = $5, finish_date = $6, approve_by = $7, approve_date = $8, car_no = $9, note_result = $10
          WHERE id_smart_qa_claim_header = $11 AND car_no = $9
        `;
        const values = [
          item.hca_no,
          item.doc_issue_date,
          item.distri_to,
          item.plan_date,
          item.resp_dri,
          item.finish_date,
          item.approve_by,
          item.approve_date,
          item.car_no,
          item.note_result,
          item.id_smart_qa_claim_header,
        ];
        await client.query(updateQuery, values);
      }
    }
    res
      .status(200)
      .json({ success: true, message: "Data processed successfully" });
  } catch (error) {
    console.error("Error during database operation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
});

router.put("/EDIT_hca_report/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      hca_no,
      doc_issue_date,
      distri_to,
      plan_date,
      resp_dri,
      finish_date,
      approve_by,
      approve_date,
      car_no,
      note_result,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE smart.smart_qa_claim_hca_report
      SET 
      hca_no = $1,
      doc_issue_date = $2,
      distri_to = $3,
      plan_date = $4,
      resp_dri = $5,
      finish_date = $6,
      approve_by = $7,
      approve_date = $8,
      car_no = $9,
      note_result = $10
      WHERE id = $11
      `,
      [
        hca_no,
        doc_issue_date,
        distri_to,
        plan_date,
        resp_dri,
        finish_date,
        approve_by,
        approve_date,
        car_no,
        note_result,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/GET_hac_report", async (req, res) => {
  try {
    const { car_no } = req.query;

    const result = await pool.query(
      `
      SELECT
        hd.id,
        hd.car_no,
        hca.hca_no,
        hca.note_result,
        hca.doc_issue_date,
        hca.distri_to,
        hca.plan_date,
        hca.resp_dri,
        hca.finish_date,
        hca.approve_by,
        hca.approve_date
      FROM
        smart.smart_qa_claim_header hd
      LEFT JOIN
        smart.smart_qa_claim_hca_report hca ON hd.car_no = hca.car_no
      WHERE
        hd.car_no = $1;
      `,
      [car_no]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.post("/Add_hca_report", async (req, res) => {
//   const client = await pool.connect();

//   try {
//     const data = req.body; // Assuming `data` is an array of records

//     for (const item of data) {
//       // Check for existing record
//       const checkQuery = `
//         SELECT 1
//         FROM smart.smart_qa_claim_hca_report
//         WHERE car_no = $1
//         LIMIT 1;
//       `;
//       const checkResult = await client.query(checkQuery, [item.car_no]);

//       if (checkResult.rows.length === 0) {
//         // Insert new record
//         const insertQuery = `
//           INSERT INTO smart.smart_qa_claim_hca_report
//           (hca_no, doc_issue_date, distri_to, plan_date, resp_dri, finish_date, approve_by, approve_date, car_no, note_result)
//           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
//         `;
//         const values = [
//           item.hca_no,
//           item.doc_issue_date,
//           item.distri_to,
//           item.plan_date,
//           item.resp_dri,
//           item.finish_date,
//           item.approve_by,
//           item.approve_date,
//           item.car_no,
//           item.note_result,
//         ];
//         await client.query(insertQuery, values);
//       } else {
//         // Update existing record
//         const updateQuery = `
//           UPDATE smart.smart_qa_claim_hca_report
//           SET hca_no = $1, doc_issue_date = $2, distri_to = $3, plan_date = $4, resp_dri = $5, finish_date = $6, approve_by = $7, approve_date = $8, note_result = $9
//           WHERE car_no = $10;
//         `;
//         const values = [
//           item.hca_no,
//           item.doc_issue_date,
//           item.distri_to,
//           item.plan_date,
//           item.resp_dri,
//           item.finish_date,
//           item.approve_by,
//           item.approve_date,
//           item.note_result,
//           item.car_no, // Ensure car_no is included in the update values
//         ];
//         await client.query(updateQuery, values);
//       }
//     }

//     res
//       .status(200)
//       .json({ success: true, message: "Data processed successfully" });
//   } catch (error) {
//     console.error("Error during database operation:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   } finally {
//     client.release();
//   }
// });

module.exports = router;
