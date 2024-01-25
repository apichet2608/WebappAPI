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

router.get("/", async (req, res) => {
  try {
    const result = await query(`
select
	*
from
	smart.smart_mil_common
order by no 
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/apple-dri", async (req, res) => {
  try {
    // Extract the query parameters from the request
    const { year, agenda, status } = req.query;

    // Perform the database query using the query parameters
    const result = await query(
      `
      SELECT DISTINCT apple_dri 
      FROM smart.smart_mil_common
      WHERE EXTRACT(YEAR FROM mil_date) = $1
      AND agenda = $2
      AND status = $3
    `,
      [year, agenda, status]
    );

    // Respond with the query result as JSON
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/agenda", async (req, res) => {
  try {
    const result = await query(`
select
	distinct  agenda 
from
	smart.smart_mil_common;`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/year-agenda-status-appledri", async (req, res) => {
  try {
    const { year, agenda, status, apple_dri } = req.query;

    const result = await query(
      `SELECT *
       FROM smart.smart_mil_common
       WHERE EXTRACT(YEAR FROM mil_date) = $1
         AND agenda = $2
         AND status = $3
         AND apple_dri = $4
         order by no `,
      [year, agenda, status, apple_dri]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/year-agenda-status", async (req, res) => {
  try {
    const { year, agenda, status } = req.query;

    const result = await query(
      `SELECT *
       FROM smart.smart_mil_common
       WHERE EXTRACT(YEAR FROM mil_date) = $1
         AND agenda = $2
         AND status = $3
         order by no `,
      [year, agenda, status]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/year-agenda", async (req, res) => {
  try {
    const { year, agenda } = req.query;

    const result = await query(
      `SELECT *
       FROM smart.smart_mil_common
       WHERE EXTRACT(YEAR FROM mil_date) = $1
         AND agenda = $2
         order by no `,
      [year, agenda]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/year", async (req, res) => {
  try {
    const { year } = req.query;

    const result = await query(
      `SELECT *
       FROM smart.smart_mil_common
       WHERE EXTRACT(YEAR FROM mil_date) = $1
       order by no `,
      [year]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// DELETE route to delete data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM smart.smart_mil_common WHERE id = $1;",
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

// PUT route to update data
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      agenda,
      apple_dri,
      mil_date,
      process,
      smart_topic,
      sub_topic,
      risk,
      findings,
      corrective_action,
      fjk_dri,
      cp_date,
      status,
      share_link_report,
      email_list,
      no,
    } = req.body;

    const result = await query(
      `UPDATE smart.smart_mil_common 
       SET 
         agenda = $1,
         apple_dri = $2,
         mil_date = $3,
         process = $4,
         smart_topic = $5,
         sub_topic = $6,
         risk = $7,
         findings = $8,
         corrective_action = $9,
         fjk_dri = $10,
         cp_date = $11,
         status = $12,
         share_link_report = $13,
         "email_list" = $14,
         no =  $15
       WHERE id = $16;`,
      [
        agenda,
        apple_dri,
        mil_date,
        process,
        smart_topic,
        sub_topic,
        risk,
        findings,
        corrective_action,
        fjk_dri,
        cp_date,
        status,
        share_link_report,
        email_list,
        no,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// POST route to add new data
router.post("/", async (req, res) => {
  try {
    const {
      agenda,
      apple_dri,
      mil_date,
      process,
      smart_topic,
      sub_topic,
      risk,
      findings,
      corrective_action,
      fjk_dri,
      cp_date,
      status,
      share_link_report,
      email_list,
      no,
    } = req.body;

    const result = await query(
      `INSERT INTO smart.smart_mil_common 
       (agenda, apple_dri, mil_date, process, smart_topic, sub_topic, risk, findings, corrective_action, fjk_dri, cp_date, status, share_link_report, "email_list","no")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,$15);`,
      [
        agenda,
        apple_dri,
        mil_date,
        process,
        smart_topic,
        sub_topic,
        risk,
        findings,
        corrective_action,
        fjk_dri,
        cp_date,
        status,
        share_link_report,
        email_list,
        no,
      ]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

// POST route to add new data
router.post("/agenda", async (req, res) => {
  try {
    const { agenda } = req.body;

    const result = await query(
      `INSERT INTO smart.smart_mil_common 
       (agenda)
       VALUES ($1);`,
      [agenda]
    );
    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

//put
router.put("/updateshare_link_report/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { share_link_report } = req.body;
    console.log(share_link_report);
    if (!share_link_report) {
      return res.status(400).json({ error: "Missing machine_buyoff data" });
    }

    const share_link_reportJson = share_link_report// แปลง Array of Objects เป็น JSON
    const result = await query(
      `UPDATE smart.smart_mil_common
       SET share_link_report = $1
       WHERE id = $2`,
      [share_link_reportJson, id]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});
module.exports = router;
