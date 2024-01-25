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

router.get("/Machine_master", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct item_code 
      from smart.smart_machine_connect_list smcl 
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/Master_grr_mc_code_grr_desc_choose", async (req, res) => {
//   try {
//     const result = await pool.query(
//       `
//       SELECT DISTINCT
//         mc_code
//       FROM
//         smart.smart_machine_grr_master smgm
//       `
//     );

//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// router.get("/Master_grr_mc_code_grr_desc", async (req, res) => {
//   try {
//     const { mc_code } = req.query; // Change here from req.params to req.query
//     if (!mc_code) {
//       return res.status(400).json({ error: "mc_code parameter is required" });
//     }

//     const result = await pool.query(
//       `
//       SELECT DISTINCT
//         grr_desc
//       FROM
//         smart.smart_machine_grr_master smgm
//       WHERE
//         mc_code = $1
//       `,
//       [mc_code]
//     );
//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "No results found for the provided mc_code" });
//     }

//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while processing the request" });
//   }
// });

router.get("/Master_grr_mc_code_grr_desc_choose", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT
        grr_desc
      FROM
        smart.smart_machine_grr_master smgm
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/Master_grr_mc_code_grr_desc", async (req, res) => {
//   try {
//     const { grr_desc } = req.query;
//     if (!grr_desc) {
//       return res.status(400).json({ error: "mc_code parameter is required" });
//     }

//     const result = await pool.query(
//       `
//       SELECT DISTINCT
//         mc_code
//       FROM
//         smart.smart_machine_grr_master smgm
//       WHERE
//         grr_desc = $1
//       `,
//       [grr_desc]
//     );
//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "No results found for the provided mc_code" });
//     }

//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while processing the request" });
//   }
// });

router.post("/Master_grr_mc_code_grr_desc", async (req, res) => {
  try {
    const { grr_desc } = req.body;
    if (!grr_desc) {
      return res
        .status(400)
        .json({ error: "grr_desc parameter is required in the request body" });
    }

    const result = await pool.query(
      `
      SELECT DISTINCT
        mc_code
      FROM
        smart.smart_machine_grr_master smgm
      WHERE
        grr_desc = $1
      `,
      [grr_desc]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No results found for the provided grr_desc" });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

router.get("/Main_TableGrr", async (req, res) => {
  try {
    const result = await pool.query(
      `
   SELECT
    grr.id,
    TO_CHAR(grr.create_at, 'YYYY-MM-DD HH24:MI') as create_at,
    grr.mc_code,
    grr.grr_desc,
    TO_CHAR(grr.plan, 'YYYY-MM-DD HH24:MI') as plan,
    TO_CHAR(grr.actual, 'YYYY-MM-DD HH24:MI') as actual,
    grr.upload,
    grr.status,
    grmaster.period_day as life_time,
    grmaster.warning_day,
    list.item_code,
    TO_CHAR(grr.actual  + (grmaster.period_day || ' days')::INTERVAL, 'YYYY-MM-DD HH24:MI') as next_plan,
    TO_CHAR(grr.actual + (grmaster.period_day || ' days')::INTERVAL - (grmaster.warning_day || ' days')::INTERVAL, 'YYYY-MM-DD HH24:MI') as warning_date
FROM
    smart.smart_machine_grr grr
INNER JOIN
    smart.smart_machine_connect_list list
ON
    grr.mc_code = list.item_code
INNER JOIN
    smart.smart_machine_grr_master grmaster
ON
    grr.mc_code = grmaster.mc_code
ORDER BY
    grr.id DESC;
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//ADD GR&R
router.post("/add_grr", async (req, res) => {
  try {
    const { mc_code, grr_desc, plan } = req.body;

    const results = await query(
      `insert
	into
	smart.smart_machine_grr
        (mc_code,
	grr_desc,
	plan,
	status,
	create_at)
values
        ($1,
$2,
$3,
2,
now() AT TIME ZONE 'Asia/Bangkok');
      `,
      [mc_code, grr_desc, plan]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

//DELETE GR&R
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const results = await query(
      `DELETE FROM smart.smart_machine_grr
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

// UPDATE ACTUAL && STATUS

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const results = await query(
      `
     UPDATE smart.smart_machine_grr
SET
    status =
        CASE
            WHEN upload IS NOT NULL THEN '0'
            WHEN plan < CURRENT_DATE THEN '1'
            WHEN upload IS NULL THEN '1'
            WHEN plan >= CURRENT_DATE THEN '2'
            ELSE '' 
        END
WHERE id = $1;
      `,
      [id]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// UPDATE MAIN TABLE

router.put("/EditMainGrr/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { grr_desc, plan } = req.body;

    const result = await pool.query(
      `
      UPDATE smart.smart_machine_grr
      SET grr_desc = $1, plan = $2
      WHERE id = $3;
      `,
      [grr_desc, plan, id]
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

module.exports = router;
