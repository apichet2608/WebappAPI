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

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "postgres",
//   database: "postgres",
// });

const query = (text, params) => pool.query(text, params);

router.get("/distinct_station", async (req, res) => {
  try {
    const result = await pool.query(
      `
select distinct test_station 
from fox.foxsystem_daily_report_bylot
        `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_product", async (req, res) => {
  try {
    const result = await pool.query(
      `
select distinct product 
from fox.foxsystem_daily_report_bylot
        `
    );
    console.log("dynamicQuery");

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/Start_StopDate", async (req, res) => {
//   try {
//     const { startdate, stopdate, test_station, product } = req.query;
//     let queryStr = `
//       SELECT
//         id,
//         update_at,
//         "date",
//         product,
//         lot_no,
//         test_station,
//         fox_qty,
//         mes_qty,
//         ROUND(CAST(match_rate AS numeric), 2) AS match_rate
//       FROM
//         fox.foxsystem_daily_report_bylot
//       WHERE
//         "date"::date = (current_date - interval '1' day)::date
//     `;

//     const queryParams = [];

//     if (test_station !== "ALL") {
//       queryStr += ` AND test_station = $${queryParams.length + 1}::text`;
//       queryParams.push(test_station);
//     }

//     if (product !== "ALL") {
//       queryStr += ` AND product = $${queryParams.length + 1}::text`;
//       queryParams.push(product);
//     }

//     if (startdate !== "ALL" && stopdate !== "ALL") {
//       queryStr += `
//         AND "date"::date BETWEEN $${queryParams.length + 1} AND $${
//         queryParams.length + 2
//       }
//       `;
//       queryParams.push(startdate, stopdate);
//     }

//     // เพิ่มเงื่อนไขการเรียงลำดับ
//     queryStr += `
//       ORDER BY
//         product ASC,
//         lot_no ASC,
//         CASE
//           WHEN test_station = 'SPI' THEN 1
//           WHEN test_station = 'AOI' THEN 2
//           WHEN test_station = 'X-ray' THEN 3
//           WHEN test_station = 'ICT' THEN 4
//           WHEN test_station = 'FCT' THEN 5
//           WHEN test_station = 'AVI' THEN 6
//           WHEN test_station = 'SPI-REFLOW' THEN 7
//           WHEN test_station = 'preBAK-PACK' THEN 8
//           WHEN test_station = 'PLASMA-PACK' THEN 9
//           WHEN test_station = 'OQC' THEN 10
//           WHEN test_station = 'OQC-ICT' THEN 11
//           ELSE 12
//         END,
//         test_station
//     `;

//     const result = await pool.query(queryStr, queryParams);
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

router.get("/Start_StopDate", async (req, res) => {
  try {
    const { startdate, stopdate, test_station, product } = req.query;
    let queryStr = `
  SELECT
    id,
    update_at,
    "date",
    product,
    lot_no,
    test_station,
    fox_qty,
    mes_qty,
    ROUND(CAST(match_rate AS numeric), 2) AS match_rate
  FROM
    fox.foxsystem_daily_report_bylot
  WHERE
    "date"::date >= $1::date AND "date"::date <= $2::date
`;

    const queryParams = [startdate, stopdate]; // Use startdate and stopdate as query parameters

    if (test_station !== "ALL") {
      queryStr += ` AND test_station = $3::text`;
      queryParams.push(test_station);
    }

    if (product !== "ALL") {
      queryStr += ` AND product = $4::text`;
      queryParams.push(product);
    }

    if (startdate !== "ALL" && stopdate !== "ALL") {
      queryStr += `
        AND "date"::date BETWEEN $${queryParams.length + 1} AND $${
        queryParams.length + 2
      }
      `;
      queryParams.push(startdate, stopdate);
    }

    // เพิ่มเงื่อนไขการเรียงลำดับ
    queryStr += `
      ORDER BY
        product ASC,
        lot_no ASC,
        CASE
          WHEN test_station = 'SPI' THEN 1
          WHEN test_station = 'AOI' THEN 2
          WHEN test_station = 'X-ray' THEN 3
          WHEN test_station = 'ICT' THEN 4
          WHEN test_station = 'FCT' THEN 5
          WHEN test_station = 'AVI' THEN 6
          WHEN test_station = 'SPI-REFLOW' THEN 7
          WHEN test_station = 'preBAK-PACK' THEN 8
          WHEN test_station = 'PLASMA-PACK' THEN 9
          WHEN test_station = 'OQC' THEN 10
          WHEN test_station = 'OQC-ICT' THEN 11
          ELSE 12
        END,
        test_station
    `;

    const result = await pool.query(queryStr, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
