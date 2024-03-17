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

router.post("/Add_Item_select", async (req, res) => {
  const client = await pool.connect();

  try {
    const data = req.body;
    const firstItemHeaderId = data[0].id_smart_qa_claim_header;

    // Perform the check once using the first item's id_smart_qa_claim_header
    const checkQuery = `
        SELECT 1
        FROM smart.smart_qa_claim_fa_item_select
        WHERE id_smart_qa_claim_header = $1
        LIMIT 1
      `;
    const checkResult = await client.query(checkQuery, [firstItemHeaderId]);

    if (!checkResult.rows.length > 0) {
      for (const item of data) {
        const insertQuery = `
         INSERT INTO smart.smart_qa_claim_fa_item_select
        (car_no, defect_item, fa_item, area, note_result, id_smart_qa_claim_header, fa_no)
        VALUES($1, $2, $3, $4, $5, $6, $7)
      `;

        const values = [
          item.car_no,
          item.defect_item,
          item.fa_item,
          item.area,
          item.note_result,
          item.id_smart_qa_claim_header,
          item.fa_no,
        ];

        await client.query(insertQuery, values);
      }
    } else {
      for (const item of data) {
        const updateQuery = `
      UPDATE smart.smart_qa_claim_fa_item_select
      SET car_no = $1, defect_item = $2, fa_item = $3, area = $4, note_result = $5, fa_no = $6
      WHERE id_smart_qa_claim_header = $7 AND fa_item = $3
    `;
        const values = [
          item.car_no,
          item.defect_item,
          item.fa_item,
          item.area,
          item.note_result,
          item.fa_no,
          item.id_smart_qa_claim_header,
        ];
        await client.query(updateQuery, values);
      }
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

router.get("/Data_analysis", async (req, res) => {
  try {
    const { car_no, defect_item, area, id } = req.query;
    const result = await pool.query(
      `
         SELECT
        t.area,
        t.defect_item,
        t.fa_no,
        t.fa_item,
        t.guideline,
        h.car_no,
        h.id,
        s.note_result,
        s.id_smart_qa_claim_header 
      FROM 
        smart.smart_qa_claim_fa_master t
      LEFT JOIN 
        smart.smart_qa_claim_header h ON t.area = h.area AND t.defect_item = h.defect_item
      LEFT JOIN 
        smart.smart_qa_claim_fa_item_select s ON t.fa_item = s.fa_item and h.id = s.id_smart_qa_claim_header 
      WHERE 
        h.car_no = $1
        AND t.defect_item = $2
        AND t.area = $3
        AND h.id  = $4
      ORDER BY 
        t.fa_no 
      `,
      [car_no, defect_item, area, id] // Pass parameters in the array
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
