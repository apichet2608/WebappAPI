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

router.get("/distinct_product", async (req, res) => {
  try {
    const result = await pool.query(
      `
       select distinct lot_prd_name 
from smart.smart_product_lot_wip splw 
      
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_process", async (req, res) => {
  try {
    const { select_product } = req.query;
    let queryStr = `
      select distinct proc_disp  
      from smart.smart_product_lot_wip splw
    `;

    let queryParams = [];

    if (select_product !== "ALL") {
      queryStr += `
        where lot_prd_name = $1
      `;
      queryParams.push(select_product);
    }

    const result = await query(queryStr, queryParams); // ตรวจสอบว่าคุณได้นำเอา query ฟังก์ชันมาจากที่ถูกต้อง
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_lot", async (req, res) => {
  try {
    const { select_product, select_process } = req.query;
    let queryStr = `
   select distinct lot_status 
from smart.smart_product_lot_wip splw
    `;

    let queryParams = [];

    if (select_product !== "ALL") {
      queryStr += `
      where
        lot_prd_name = $1
      `;
      queryParams.push(select_product);
    }

    if (select_process !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
        where
          lot_prd_name = $1
        `;
      } else {
        queryStr += `
        and
          proc_disp = $2
        `;
      }
      queryParams.push(select_process);
    }

    // queryStr += `
    //   order by
    //
    // `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/current_wipTable", async (req, res) => {
  try {
    const { select_product, select_process, select_lot } = req.query;

    let queryStr = `
    select * 
from smart.smart_product_lot_wip splw 
    `;

    let queryParams = [];

    if (select_product !== "ALL") {
      queryStr += `
        WHERE
          lot_prd_name = $1
      `;
      queryParams.push(select_product);
    }

    if (select_process !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND
        `;
      } else {
        queryStr += `
          WHERE
        `;
      }
      queryStr += `
          proc_disp = $${queryParams.length + 1}
      `;
      queryParams.push(select_process);
    }

    if (select_lot !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND
        `;
      } else {
        queryStr += `
          WHERE
        `;
      }
      queryStr += `
          lot_status = $${queryParams.length + 1}
      `;
      queryParams.push(select_lot);
    }

    // queryStr += `
    //   ORDER BY
    //
    // `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
