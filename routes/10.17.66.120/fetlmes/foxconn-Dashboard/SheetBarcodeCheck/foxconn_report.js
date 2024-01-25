const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.120",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "fetlmes",
});

const query = (text, params) => pool.query(text, params);

router.get("/call_bin_xout", async (req, res) => {
  try {
    // Retrieve parameters from the query string
    const lotNo = req.query.lotno;
    const sheetNo = req.query.sheetno;

    // Construct the SQL query with parameters
    const queryString = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY lot_no, sheet_no, bin) AS id,
        lot_no,
        sheet_no,
        bin,
        fail_qty AS x_out
      FROM
        foxconn.foxconn_report fr
      WHERE
        lot_no = $1
        AND sheet_no = $2
    `;

    const result = await pool.query(queryString, [lotNo, sheetNo]);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table_Check_Lot", async (req, res) => {
  try {
    const { lot_no } = req.query;

    let queryStr = `
    select 
	t.lot_no,
	t.bin,
	sum (t.total_qty) as sum_total ,
	sum (t.good_qty) as sum_good_qty ,
	sum (t.fail_qty) as sum_fail_qty 
from 
	foxconn.foxconn_report t
`;

    let queryParams = [];

    if (lot_no) {
      if (queryParams.length > 0) {
        queryStr += `
          AND t.lot_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE t.lot_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(lot_no);
    }

    queryStr += `
      group by 
	t.lot_no ,
	t.bin 
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/Sum_GoodQTY_sheetno", async (req, res) => {
  try {
    const { sheet_no } = req.query;

    let queryStr = `
    select 
	t.good_qty 
from 
	foxconn.foxconn_report t
`;

    let queryParams = [];

    if (sheet_no) {
      if (queryParams.length > 0) {
        queryStr += `
          AND t.sheet_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE t.sheet_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(sheet_no);
    }

    // queryStr += ``;
    // console.log(queryStr)
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
