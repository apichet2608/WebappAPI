const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.120",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "fetlmes",
});

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "postgres",
//   database: "postgres",
// });

const query = (text, params) => pool.query(text, params);

router.get("/Pack_whandBox_id", async (req, res) => {
  try {
    const { pkg_id } = req.query;

    let query = `
    select
	distinct
	t.pack_wh ,
	l.pkg_id ,
	b.box_id 
from
	foxconn.foxconn_report t
inner join foxconn.foxconn_label l
	on t.pack_wh = l.key_1
left join foxconn.foxconn_label_box b
	on t.box_fjk_no = b.key_2`;

    const queryParams = [];

    if (pkg_id) {
      if (queryParams.length > 0) {
        query += ` AND l.pkg_id = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE l.pkg_id =  $${queryParams.length + 1}`;
      }
      queryParams.push(pkg_id);
    }

    // query += `
    //   order by date_time desc
    // `;
    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// // Express route for deleting records from foxconn_label, foxconn_label_box, and updating foxconn_report
// router.post("/processSubmit", async (req, res) => {
//   const { pkg_id, box_id, pack_wh } = req.body;

//   try {
//     // Step 2: Delete from foxconn_label
//     await pool.query("DELETE FROM foxconn.foxconn_label WHERE pkg_id = $1", [
//       pkg_id,
//     ]);

//     // Step 3: Delete from foxconn_label_box
//     await pool.query(
//       "DELETE FROM foxconn.foxconn_label_box WHERE box_id = $1",
//       [box_id]
//     );

//     // Step 4: Update foxconn_report
//     await pool.query(
//       `
//       UPDATE foxconn.foxconn_report
//       SET
//         pack_no = null,
//         pack_sht_qty = null,
//         pack_good_qty = null,
//         pack_dc = null,
//         pack_date_label = null,
//         pack_wh = null,
//         box_fjk_no = null,
//         box_good_qty = null,
//         box_dc = null,
//         box_date_label = null,
//         invoice_no = null
//       WHERE pack_wh = $1
//     `,
//       [pack_wh]
//     );

//     res.status(200).json({ message: "Process completed successfully." });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// Express route for deleting records from foxconn_label, foxconn_label_box, and updating foxconn_report
router.post("/processSubmit", async (req, res) => {
  const { pkg_id, box_id, pack_wh } = req.body;

  try {
    // Step 1: Delete from foxconn_label
    const deleteLabelResult = await pool.query(
      "DELETE FROM foxconn.foxconn_label WHERE pkg_id = $1",
      [pkg_id]
    );
    if (deleteLabelResult.rowCount === 0) {
      throw new Error("No records deleted from foxconn_label.");
    }

    // Step 2: Update foxconn_report
    const updateReportResult = await pool.query(
      `
      UPDATE foxconn.foxconn_report
      SET
        pack_no = null,
        pack_sht_qty = null,
        pack_good_qty = null,
        pack_dc = null,
        pack_date_label = null,
        pack_wh = null,
        box_fjk_no = null,
        box_good_qty = null,
        box_dc = null,
        box_date_label = null,
        invoice_no = null
      WHERE pack_wh = $1
    `,
      [pack_wh]
    );

    if (updateReportResult.rowCount === 0) {
      throw new Error("No records updated in foxconn_report.");
    }

    // Step 3: Delete from foxconn_label_box
    const deleteLabelBoxResult = await pool.query(
      "DELETE FROM foxconn.foxconn_label_box WHERE box_id = $1",
      [box_id]
    );
    if (deleteLabelBoxResult.rowCount === 0) {
      // throw new Error("No records deleted from foxconn_label_box.");
      res
        .status(200)
        .json({ message: "No records deleted from foxconn_label_box." });
      return; // ออกจากฟังก์ชันหลังจากส่งการตอบสนอง
    }

    res.status(200).json({ message: "Process completed successfully." });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
