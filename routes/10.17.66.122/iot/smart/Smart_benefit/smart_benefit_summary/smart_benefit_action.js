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

router.get("/Table_benefit_action", async (req, res) => {
  try {
    const { action_id } = req.query;

    let sqlQuery = `
    select
	create_at,
	action_id,
	action_key_id,
	f_year,
	production,
	process_station,
	action_desc,
	dri,
	man_before,
	man_after,
	mh_before,
	mh_after,
	cost_before,
	cost_afterr,
	total_cost_before,
	total_cost_after,
	net_saving,
	id
from
	smart.smart_benefit_action
    WHERE 1=1
    `;

    let queryParam = [];

    if (action_id && action_id !== "ALL") {
      sqlQuery += `AND "action_id" = $${queryParam.length + 1} `;
      queryParam.push(action_id);
    }

    // ORDER BY clause
    sqlQuery += `ORDER BY action_id ASC`;

    // Execute the database query
    const result = await pool.query(sqlQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

router.post("/insert_task", async (req, res) => {
  try {
    const {
      action_id,
      f_year,
      production,
      process_station,
      action_desc,
      dri,
      man_before,
      man_after,
      mh_before,
      mh_after,
      cost_before,
      cost_afterr,
      total_cost_before,
      total_cost_after,
      net_saving,
    } = req.body;

    // Query to get the count of existing records with the same action_id
    const countQuery = "SELECT COUNT(*) FROM smart.smart_benefit_action";
    const countResult = await query(countQuery, []);
    const count = parseInt(countResult.rows[0].count, 10);
    console.log(count);

    // Construct the action_key_id using the count
    const action_key_id = `${action_id}_${count + 1}`;
    console.log(action_key_id);

    // Query to insert the new record
    const insertQuery = `INSERT INTO smart.smart_benefit_action (
      action_id,
      action_key_id,
      f_year,
      production,
      process_station,
      action_desc,
      dri,
      man_before,
      man_after,
      mh_before,
      mh_after,
      cost_before,
      cost_afterr,
      total_cost_before,
      total_cost_after,
      net_saving
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`;

    const values = [
      action_id,
      action_key_id,
      f_year,
      production,
      process_station,
      action_desc,
      dri,
      man_before,
      man_after,
      mh_before,
      mh_after,
      cost_before,
      cost_afterr,
      total_cost_before,
      total_cost_after,
      net_saving,
    ];

    // Execute the insert query
    await query(insertQuery, values);

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      f_year,
      production,
      process_station,
      action_desc,
      dri,
      man_before,
      man_after,
      mh_before,
      mh_after,
      cost_before,
      cost_afterr,
      total_cost_before,
      total_cost_after,
      net_saving,
    } = req.body;

    const result = await query(
      `UPDATE smart.smart_benefit_action
       SET
        f_year = $1,
        production = $2,
        process_station = $3,
        action_desc = $4,
        dri = $5,
        man_before = $6,
        man_after = $7,
        mh_before = $8,
        mh_after = $9,
        cost_before = $10,
        cost_afterr = $11,
        total_cost_before = $12,
        total_cost_after = $13,
        net_saving = $14
       WHERE
        id = $15`,
      [
        f_year,
        production,
        process_station,
        action_desc,
        dri,
        man_before,
        man_after,
        mh_before,
        mh_after,
        cost_before,
        cost_afterr,
        total_cost_before,
        total_cost_after,
        net_saving,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// DELETE route to delete data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM smart.smart_benefit_action WHERE id = $1;",
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

module.exports = router;
