const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.120",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "fetlmes",
  // timezone: "UTC", // Set your desired timezone here
});

const query = (text, params) => pool.query(text, params);

router.post("/insert_data", async (req, res) => {
  try {
    // Destructure data from the request body
    const { op_code, password, re_password, name } = req.body;

    // Define the SQL query and parameter values
    let queryData = `
  INSERT INTO eworking.eworking_user_password (op_code, "password", re_password, create_at , name)
  VALUES ($1, $2, $3, now() AT TIME ZONE 'Asia/Bangkok' , $4);
`;

    let values = [op_code, password, re_password, name];

    // Execute the query
    const result = await query(queryData, values);

    // Respond with a success message
    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    // Respond with an error message
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

// UPDATE route to UPDATE data
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { op_code, password, re_password } = req.body;

    const result = await query(
      `update
	eworking.eworking_user_password
set
	update_date  = now() AT TIME ZONE 'Asia/Bangkok',
	op_code = $1,
	"password" = $2,
	re_password = $3
where
	id = $4`, // Include $16 as a placeholder for id
      [
        op_code,
        password,
        re_password,
        id, // Bind id as the 16th parameter
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

router.get("/data_register", async (req, res) => {
  try {
    const {} = req.query;
    let query = `
    select
	*
from
	eworking.eworking_user_password
order by create_at asc`;

    const queryParams = [];

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
