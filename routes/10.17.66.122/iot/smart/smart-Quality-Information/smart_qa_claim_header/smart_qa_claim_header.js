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

//Distinct from Master (smart_qa_claim_fa_master)
router.get("/distinct_area", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT area 
      FROM smart.smart_qa_claim_fa_master
    `);

    // Send the distinct areas as JSON response
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);

    // Send a more informative error response
    res.status(500).json({ error: `An error occurred: ${error.message}` });
  }
});

router.get("/distinct_defect_item", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT defect_item
FROM (
    SELECT DISTINCT defect_item
    FROM smart.smart_qa_claim_fa_master
    UNION
    SELECT 'No option' AS defect_item
) AS combined_result
ORDER BY 
    CASE 
        WHEN defect_item = 'No option' THEN 2 
        ELSE 1 
    END,
    defect_item ASC;
    `);

    // Send the distinct defect items as JSON response
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);

    // Send a more informative error response
    res.status(500).json({ error: `An error occurred: ${error.message}` });
  }
});

//ADD QUALITY
router.post("/add_quality", async (req, res) => {
  try {
    const {
      claim_date,
      recieve_date,
      car_no,
      product_name,
      defect_item,
      customer,
      area,
      description,
      claim_failure_rate,
      impact_risk,
    } = req.body;

    const results = await query(
      `insert
	into
	smart.smart_qa_claim_header
        (claim_date,
	      recieve_date,
	      car_no,
	      product_name,
	      defect_item,
        customer,
        area,
        description,
        claim_failure_rate,
        impact_risk
        )
  values
        ($1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10)
      `,
      [
        claim_date,
        recieve_date,
        car_no,
        product_name,
        defect_item,
        customer,
        area,
        description,
        claim_failure_rate,
        impact_risk,
      ]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

//EDiT MAIN QUALITY
router.put("/EditMainQuality/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      claim_date,
      recieve_date,
      car_no,
      product_name,
      defect_item,
      process_respond,
      root_cause,
      escape_cause,
      action_rc,
      action_escape,
      photo_att,
      customer,
      pqe,
      pqm,
      qa_8d_report_att,
      approved_time,
      hca_require,
      area,
      action_containment,
      action_preventive,
      next_steps,
      description,
      impact_risk,
      claim_failure_rate,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE smart.smart_qa_claim_header
      SET 
	      claim_date = $1,
	      recieve_date = $2,
	      car_no = $3,
	      product_name = $4,
	      defect_item = $5,
	      process_respond = $6,
	      root_cause = $7,
	      escape_cause = $8,
	      action_rc = $9,
	      action_escape = $10,
	      photo_att = $11,
	      customer = $12,
	      pqe = $13,
	      pqm = $14,
	      qa_8d_report_att = $15,
	      approved_time = $16,
	      hca_require = $17,
	      area = $18,
        action_containment = $19,
        action_preventive = $20,
        next_steps = $21,
        description = $22,
        impact_risk = $23,
        claim_failure_rate = $24
      WHERE id = $25
      `,
      [
        claim_date,
        recieve_date,
        car_no,
        product_name,
        defect_item,
        process_respond,
        root_cause,
        escape_cause,
        action_rc,
        action_escape,
        photo_att,
        customer,
        pqe,
        pqm,
        qa_8d_report_att,
        approved_time,
        hca_require,
        area,
        action_containment,
        action_preventive,
        next_steps,
        description,
        impact_risk,
        claim_failure_rate,
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

//DELETE QUALITY && Item Select
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ลบข้อมูลในตาราง smart_qa_claim_fa_item_select ที่มี id_smart_qa_claim_header เท่ากับ id ใน table smart_qa_claim_header
    await query(
      `DELETE FROM smart.smart_qa_claim_fa_item_select
       WHERE id_smart_qa_claim_header = $1;
      `,
      [id]
    );

    // ลบข้อมูลในตาราง smart_qa_claim_header
    const results = await query(
      `DELETE FROM smart.smart_qa_claim_header
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

//GET HEADER TABLE QUALITY
router.get("/QA_Main_Table", async (req, res) => {
  try {
    const result = await pool.query(
      `
     SELECT
    id,
    TO_CHAR(claim_date, 'YYYY-MM-DD HH24:MI') AS claim_date,
    TO_CHAR(recieve_date, 'YYYY-MM-DD HH24:MI') AS recieve_date,
    car_no,
    product_name,
    defect_item,
    process_respond,
    root_cause,
    escape_cause,
    action_rc,
    action_escape,
    photo_att,
    customer,
    pqe,
    pqm,
    qa_8d_report_att,
    TO_CHAR(approved_time, 'YYYY-MM-DD HH24:MI') AS approved_time,
    hca_require,
    area,
    action_containment,
    action_preventive,
    next_steps,
    description,
    impact_risk,
    claim_failure_rate
FROM
    smart.smart_qa_claim_header
ORDER BY
    id DESC;
      

      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
