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

router.get("/TableTooling", async (req, res) => {
  try {
    const result = await pool.query(
      `
        select *
  from smart.smart_aut_die_master sadm 
      
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_prd_name", async (req, res) => {
  try {
    const result = await pool.query(
      `
         select distinct product_name
from smart.smart_aut_die_master sadd 
WHERE product_name IS NOT NULL
        
        `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_tool_code", async (req, res) => {
  try {
    const result = await pool.query(
      `
         select distinct tool_code
from smart.smart_aut_die_master sadd 
WHERE tool_code IS NOT NULL
        
        `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_tool_type", async (req, res) => {
  try {
    const result = await pool.query(`
      select distinct tool_type
from smart.smart_aut_die_master sadd 
WHERE tool_type IS NOT NULL
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/distinct_app", async (req, res) => {
  try {
    const result = await pool.query(
      `
         select distinct application
from smart.smart_aut_die_master sadd 
WHERE application IS NOT NULL
        
        `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//ADD
router.post("/add_tool", async (req, res) => {
  try {
    const { product_name, tool_code, tool_type, application, status } =
      req.body;

    const results = await query(
      `INSERT INTO smart.smart_aut_die_master
       (product_name, tool_code, tool_type, application, status)
       VALUES ($1, $2, $3, $4, $5)
      `,
      [product_name, tool_code, tool_type, application, status]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

//EDIT
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, tool_code, tool_type, application, status } =
      req.body;

    const results = await query(
      `UPDATE smart.smart_aut_die_master 
       SET
        product_name = $1,
        tool_code = $2,
        tool_type = $3,
        application = $4,
        status = $5
      WHERE
        id = $6;
      `,
      [product_name, tool_code, tool_type, application, status, id]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const results = await query(
      `DELETE FROM smart.smart_aut_die_master
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

module.exports = router;
