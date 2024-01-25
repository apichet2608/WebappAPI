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

router.get("/TableData", async (req, res) => {
  try {
    const { startdate, stopdate, test_station, product } = req.query;
    let sqlQuery = `
      SELECT
        id,
        "date",
        product,
        test_station,
        fox_qty,
        mes_qty,
        ROUND(CAST(match_rate AS numeric), 2) AS match_rate
      FROM
        fox.foxsystem_daily_report fdr
      WHERE
        1=1
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
    if (test_station && test_station !== "ALL") {
      sqlQuery += `
        AND test_station = $${queryParams.length + 1}
      `;
      queryParams.push(test_station);
    }
    if (product && product !== "ALL") {
      sqlQuery += `
        AND product = $${queryParams.length + 1}
      `;
      queryParams.push(product);
    }
    sqlQuery += `
        AND fox_qty > 5
        AND match_rate > 1
    `;
    sqlQuery += `
      ORDER BY
        product ASC,
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
        test_station;
    `;
    const result = await query(sqlQuery, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_station", async (req, res) => {
  try {
    const result = await pool.query(
      `
select distinct test_station 
from fox.foxsystem_daily_report 
Where fox_qty > 5
        AND match_rate > 1
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
    const { test_station, startdate, stopdate } = req.query;

    let dynamicQuery = `
      SELECT DISTINCT product
      FROM fox.foxsystem_daily_report
    `;

    const queryParams = [];

    if (test_station && test_station !== "ALL") {
      dynamicQuery += `
        WHERE test_station = $${queryParams.length + 1}
      `;
      queryParams.push(test_station);
    }

    if (startdate && stopdate) {
      if (queryParams.length === 0) {
        dynamicQuery += `
          WHERE date >= $${queryParams.length + 1}
          AND date <= $${queryParams.length + 2}
        `;
      } else {
        dynamicQuery += `
          AND date >= $${queryParams.length + 1}
          AND date <= $${queryParams.length + 2}
        `;
      }
      queryParams.push(startdate, stopdate);
    }
    dynamicQuery += `
        AND fox_qty > 5
        AND match_rate > 1
    `;
    const result = await pool.query(dynamicQuery, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
