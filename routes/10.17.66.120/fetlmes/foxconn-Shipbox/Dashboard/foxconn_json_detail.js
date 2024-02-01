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

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "fujikura",
//   database: "postgres", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
// });

const query = (text, params) => pool.query(text, params);

router.get("/Sum_good_qty", async (req, res) => {
  try {
    const pack_wh = req.query.pack_wh;

    if (!Array.isArray(pack_wh)) {
      return res.status(200).json({ error: "pack_wh must be an array" });
    }

    const queryParams = [...pack_wh];

    const queryStr = `
      SELECT  sum(good_qty) as sum_good_qty
      FROM foxconn.foxconn_report
      WHERE pack_wh IN (${pack_wh.map((_, i) => `$${i + 1}`).join(",")})
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/Tablw_view", async (req, res) => {
  try {
    const { product_name, lot_no } = req.query;

    let queryStr = `
    select *
    FROM foxconn.foxconn_report`;

    let queryParams = [];

    if (product_name !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND product_name = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE product_name = $${queryParams.length + 1}
        `;
      }
      queryParams.push(product_name);
    }

    if (lot_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND lot_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE lot_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(lot_no);
    }

    if (queryParams.length > 0) {
      queryStr += `
    AND pack_wh is not null
  `;
    } else {
      queryStr += `
    WHERE pack_wh is not null
      `;
    }

    queryStr += `
      order by update_date  :: timestamp desc;
    `;

    // console.log(queryStr);
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_product_name", async (req, res) => {
  try {
    // const { product_name, lot_no } = req.query;

    let queryStr = `
    select distinct product_name
    FROM foxconn.foxconn_report`;

    let queryParams = [];

    if (queryParams.length > 0) {
      queryStr += `
    AND pack_wh is not null
  `;
    } else {
      queryStr += `
    WHERE pack_wh is not null
      `;
    }
    queryStr += `
      order by product_name desc;
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_lot_no", async (req, res) => {
  try {
    const { product_name } = req.query;

    let queryStr = `
    select distinct lot_no
    FROM foxconn.foxconn_report`;

    let queryParams = [];

    if (product_name !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND product_name = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE product_name = $${queryParams.length + 1}
        `;
      }
      queryParams.push(product_name);
    }

    if (queryParams.length > 0) {
      queryStr += `
    AND pack_wh is not null
  `;
    } else {
      queryStr += `
    WHERE pack_wh is not null
      `;
    }
    queryStr += `
      order by lot_no   desc;
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
