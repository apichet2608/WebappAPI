const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.228",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "foxsystem",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinct_product", async (req, res) => {
  try {
    const { startdate, stopdate } = req.query; // Retrieve query parameters

    const result = await pool.query(
      `
      SELECT DISTINCT product_name 
      FROM public.foxsystem_holding_time fht 
      WHERE fin_gate_create_time::date BETWEEN $1 AND $2
      `,
      [startdate, stopdate] // Pass the query parameters to the query
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_lot", async (req, res) => {
  try {
    const { select_product, startdate, stopdate } = req.query;
    let queryStr = `
      select distinct lot_no 
from public.foxsystem_holding_time fht
WHERE fin_gate_create_time::date BETWEEN $1 AND $2
    `;

    let queryParams = [startdate, stopdate];

    if (select_product !== "ALL") {
      queryStr += `
        AND product_name = $3
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

router.get("/distinct_packing", async (req, res) => {
  try {
    const { select_product, select_lot, startdate, stopdate } = req.query;
    let queryStr = `
   select distinct packing_group  
from public.foxsystem_holding_time fht 
WHERE fin_gate_create_time::date BETWEEN $1 AND $2
    `;

    let queryParams = [startdate, stopdate];

    if (select_product !== "ALL") {
      queryStr += `
      and
        product_name = $3
      `;
      queryParams.push(select_product);
    }

    if (select_lot !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
        and
          lot_no = $3
        `;
      } else {
        queryStr += `
        and
          lot_no = $4
        `;
      }
      queryParams.push(select_lot);
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

// router.get("/trackTable", async (req, res) => {
//   try {
//     const { select_product, select_lot, select_packing } = req.query;

//     let queryStr = `
//     select *
// from public.foxsystem_holding_time fht

//     `;

//     let queryParams = [];

//     if (select_product !== "ALL") {
//       queryStr += `
//         WHERE
//           product_name = $1
//       `;
//       queryParams.push(select_product);
//     }

//     if (select_lot !== "ALL") {
//       if (queryParams.length > 0) {
//         queryStr += `
//           AND
//         `;
//       } else {
//         queryStr += `
//           WHERE
//         `;
//       }
//       queryStr += `
//           lot_no = $${queryParams.length + 1}
//       `;
//       queryParams.push(select_lot);
//     }

//     if (select_packing !== "ALL") {
//       if (queryParams.length > 0) {
//         queryStr += `
//           AND
//         `;
//       } else {
//         queryStr += `
//           WHERE
//         `;
//       }
//       queryStr += `
//           packing_group = $${queryParams.length + 1}
//       `;
//       queryParams.push(select_packing);
//     }

//     queryStr += `
//       order by pack_create_time desc ;

//     `;

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/Start_StopDate", async (req, res) => {
  try {
    const { startdate, stopdate, select_product, select_lot, select_packing } =
      req.query;
    let queryStr = `
      SELECT ROW_NUMBER() OVER (ORDER BY pack_create_time DESC) AS id, *
      FROM public.foxsystem_holding_time fht
    `;

    const queryParams = [];

    if (startdate !== "ALL" && stopdate !== "ALL") {
      queryStr += `
        WHERE fin_gate_create_time::date BETWEEN $1 AND $2
      `;
      queryParams.push(startdate, stopdate);
    }

    if (select_product !== "ALL") {
      queryStr += ` AND product_name = $${queryParams.length + 1}::text`;
      queryParams.push(select_product);
    }

    if (select_lot !== "ALL") {
      queryStr += ` AND lot_no = $${queryParams.length + 1}::text`;
      queryParams.push(select_lot);
    }

    if (select_packing !== "ALL") {
      queryStr += ` AND packing_group = $${queryParams.length + 1}::text`;
      queryParams.push(select_packing);
    }

    // Add the ORDER BY and LIMIT clauses
    queryStr += `
      ORDER BY pack_create_time DESC;
    `;

    const result = await pool.query(queryStr, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
