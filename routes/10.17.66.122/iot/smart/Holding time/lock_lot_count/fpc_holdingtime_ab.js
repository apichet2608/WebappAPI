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

//  LOCK LOT COUNT

router.get("/distinct_con_desc", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct condition_desc 
from fpc.fpc_holdingtime_ab fha 
      
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/locklotChart", async (req, res) => {
  try {
    const { startdate, stopdate, condition_desc } = req.query;
    let sqlQuery = `
      SELECT count_lock, TO_CHAR("date", 'YYYY-MM-DD') AS set_date, condition_desc
      FROM fpc.fpc_holdingtime_ab fha
      WHERE 1=1
    `;

    const queryParams = [];
    if (startdate && stopdate) {
      sqlQuery += `
        AND "date"::date BETWEEN $${queryParams.length + 1} AND $${
        queryParams.length + 2
      }
      `;
      queryParams.push(startdate, stopdate);
    }
    if (condition_desc && condition_desc !== "ALL") {
      sqlQuery += `
        AND condition_desc = $${queryParams.length + 1}
      `;
      queryParams.push(condition_desc);
    }

    console.log(sqlQuery);

    // Replace 'query' with your actual database query function
    const result = await query(sqlQuery, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// router.get("/locklotChart", async (req, res) => {
//   try {
//     const { startdate, stopdate, condition_desc } = req.query;
//     let sqlQuery = `
//       SELECT count_lock, TO_CHAR("date", 'YYYY-MM-DD') AS set_date
//       FROM fpc.fpc_holdingtime_ab fha
//       WHERE 1=1
//     `;

//     const queryParams = [];
//     if (startdate && stopdate) {
//       sqlQuery += `
//         AND "date"::date BETWEEN $${queryParams.length + 1} AND $${
//         queryParams.length + 2
//       }
//       `;
//       queryParams.push(startdate, stopdate);
//     }
//     // if (condition_desc && condition_desc !== "ALL") {
//     //   sqlQuery += `
//     //     AND condition_desc = $${queryParams.length + 1}
//     //   `;
//     //   queryParams.push(condition_desc);
//     // }

//     console.log(sqlQuery);

//     // Replace 'query' with your actual database query function
//     const result = await query(sqlQuery, queryParams);

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

// router.get("/locklotChart", async (req, res) => {
//   try {
//     const result = await pool.query(
//       `
//      select count_lock ,TO_CHAR("date", 'YYYY-MM-DD') AS set_date  ,condition_desc
// from fpc.fpc_holdingtime_ab fha

//       `
//     );

//     // Send the JSON response back to the client
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

module.exports = router;
