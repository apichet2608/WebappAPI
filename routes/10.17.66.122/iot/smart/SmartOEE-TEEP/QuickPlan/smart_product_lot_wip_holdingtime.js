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

router.get("/smart_product_lot_wip_holdingtime", async (req, res) => {
  try {
    const { fac_unit_desc, proc_grp_name, proc_disp } = req.query;

    let sqlQuery = `
    SELECT
        id, prd_name_nov, product_name, lot, proc_id, fac_unit_desc, factory_desc,
        proc_disp, scan_code, lot_status, input_qty, scan_desc, scan_in,
        ROUND(holding_time_hrs) AS holding_time_hrs,
        ROUND(holding_time_mins) AS holding_time_mins,
        proc_grp_name,
        update_date
    FROM
        smart.smart_product_lot_wip_holdingtime
    WHERE 1=1
    `;

    let queryParam = [];

    if (fac_unit_desc && fac_unit_desc !== "ALL") {
      sqlQuery += `AND "fac_unit_desc" = $${queryParam.length + 1} `;
      queryParam.push(fac_unit_desc);
    }

    if (proc_grp_name && proc_grp_name !== "ALL") {
      sqlQuery += `AND "proc_grp_name" = $${queryParam.length + 1} `;
      queryParam.push(proc_grp_name);
    }

    if (proc_disp && proc_disp !== "ALL") {
      sqlQuery += `AND "proc_disp" = $${queryParam.length + 1} `;
      queryParam.push(proc_disp);
    }

    // ORDER BY clause
    sqlQuery += `ORDER BY "holding_time_mins" DESC`;

    // Execute the database query
    const result = await pool.query(sqlQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

router.get("/smart_product_lot_wip_holdingtime_table", async (req, res) => {
  try {
    const { fac_unit_desc, proc_grp_name, proc_disp } = req.query;

    let sqlQuery = `
    SELECT *
    FROM smart.smart_product_lot_wip_holdingtime`;

    let queryParam = [];

    if (fac_unit_desc && fac_unit_desc !== "ALL") {
      sqlQuery += ` WHERE "fac_unit_desc" = $${queryParam.length + 1} `;
      queryParam.push(fac_unit_desc);
    }

    if (proc_grp_name && proc_grp_name !== "ALL") {
      sqlQuery += `${
        queryParam.length > 0 ? " AND" : " WHERE"
      } "proc_grp_name" = $${queryParam.length + 1} `;
      queryParam.push(proc_grp_name);
    }

    if (proc_disp && proc_disp !== "ALL") {
      sqlQuery += `${
        queryParam.length > 0 ? " AND" : " WHERE"
      } "proc_disp" = $${queryParam.length + 1} `;
      queryParam.push(proc_disp);
    }

    // ORDER BY clause
    sqlQuery += ` ORDER BY "holding_time_mins" DESC`;

    // Execute the database query
    const result = await pool.query(sqlQuery, queryParam);

    console.log("SQL Query:", sqlQuery);
    console.log("Query Parameters:", queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
