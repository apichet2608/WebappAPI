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

router.get("/distinctproduct", async (req, res) => {
  try {
    let { startdate, stopdate } = req.query;

    const result = await pool.query(
      `
        SELECT DISTINCT product
        FROM fpc.fpc_cvc_ui_tape_test
        WHERE create_date::date BETWEEN $1 AND $2
        ORDER BY product ASC
      `,
      [startdate, stopdate]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/totalstatus", async (req, res) => {
  try {
    let { startdate, stopdate } = req.query;
    let queryParams = [startdate, stopdate];

    let queryCondition = "";

    // ตรวจสอบและกำหนดเงื่อนไขสำหรับ product
    if (req.query.product !== "ALL") {
      queryParams.push(req.query.product);
      queryCondition += `and product = $${queryParams.length} `;
    }

    // ตรวจสอบและกำหนดเงื่อนไขสำหรับ lot_no
    if (req.query.lot_no !== "ALL") {
      queryParams.push(req.query.lot_no);
      queryCondition += `and lot_no = $${queryParams.length} `;
    }

    const result = await pool.query(
      `select
    'Total' as result,
    COUNT(*) as result_count
from
    (
    select
        id,
        create_date,
        product,
        lot_no,
        pos_scan,
        op_id,
        ink_name,
        lower_left_sheet,
        center_sheet,
        top_sheet,
        case
            when lower_left_sheet = 'OK'
            and center_sheet = 'OK'
            and top_sheet = 'OK' then 'Pass'
            else 'Fail'
        end as result
    from
        fpc.fpc_cvc_ui_tape_test
     WHERE 
    create_date::date BETWEEN $1 AND $2
    ${queryCondition}
    ) subquery

union all

select
    'Pass' as result,
    COUNT(*) as result_count
from
    (
    select
        id,
        create_date,
        product,
        lot_no,
        pos_scan,
        op_id,
        ink_name,
        lower_left_sheet,
        center_sheet,
        top_sheet,
        case
            when lower_left_sheet = 'OK'
            and center_sheet = 'OK'
            and top_sheet = 'OK' then 'Pass'
            else 'Fail'
        end as result
    from
        fpc.fpc_cvc_ui_tape_test
     WHERE 
    create_date::date BETWEEN $1 AND $2
    ${queryCondition}
    ) subquery
where
    result = 'Pass'

union all

select
    'Fail' as result,
    COUNT(*) as result_count
from
    (
    select
        id,
        create_date,
        product,
        lot_no,
        pos_scan,
        op_id,
        ink_name,
        lower_left_sheet,
        center_sheet,
        top_sheet,
        case
            when lower_left_sheet = 'OK'
            and center_sheet = 'OK'
            and top_sheet = 'OK' then 'Pass'
            else 'Fail'
        end as result
    from
        fpc.fpc_cvc_ui_tape_test
    WHERE 
    create_date::date BETWEEN $1 AND $2
    ${queryCondition}
    ) subquery
where
    result = 'Fail';`,
      queryParams
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinctlot_no", async (req, res) => {
  try {
    const { product, startdate, stopdate } = req.query;

    let queryStr = `
    SELECT DISTINCT lot_no
    FROM fpc.fpc_cvc_ui_tape_test
    WHERE 1=1`;

    const queryParams = [];

    // เพิ่มเงื่อนไขสำหรับ startdate และ stopdate
    queryStr += ` AND cutt.create_date::date BETWEEN $1 AND $2`;
    queryParams.push(startdate);
    queryParams.push(stopdate);

    // ตรวจสอบและเพิ่มเงื่อนไขสำหรับ product
    if (product !== "ALL") {
      queryStr += ` AND cutt.product = $3`;
      queryParams.push(product);
    }

    queryStr += ` ORDER BY lot_no ASC;`;

    const result = await query(queryStr, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/querry", async (req, res) => {
  try {
    const { startdate, stopdate } = req.query;
    let queryStr = `SELECT 
    id, 
    create_date, 
    product, 
    lot_no, 
    pos_scan, 
    op_id, 
    ink_name, 
    lower_left_sheet, 
    center_sheet, 
    top_sheet
FROM 
    fpc.fpc_cvc_ui_tape_test
WHERE 
    create_date::date BETWEEN $1 AND $2`;

    let queryParams = [startdate, stopdate];

    // ตรวจสอบและเพิ่มเงื่อนไขสำหรับ product
    if (req.query.product !== "ALL") {
      queryStr += ` and product = $${queryParams.length + 1}`;
      queryParams.push(req.query.product);
    }

    // ตรวจสอบและเพิ่มเงื่อนไขสำหรับ lot_no
    if (req.query.lot_no !== "ALL") {
      queryStr += ` and lot_no = $${queryParams.length + 1}`;
      queryParams.push(req.query.lot_no);
    }

    queryStr += ` ORDER BY create_date::date ASC;`;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
