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

router.get("/Table_ByUnit", async (req, res) => {
  try {
    const { select_date, select_unit, select_subgroup, select_product } =
      req.query;

    let queryStr = `
      SELECT TO_CHAR(output_date, 'YYYY-MM-DD') AS formatted_date ,*
      FROM smart.smart_reject_fpc_by_sheet srfbs
      WHERE output_date >= (CURRENT_DATE - interval '30 days')
    `;

    let queryParams = [];

    if (select_date !== "all") {
      queryParams.push(select_date);
      queryStr += `
        AND output_date = $${queryParams.length}
      `;
    }

    if (select_unit !== "all") {
      queryParams.push(select_unit);
      queryStr += `
        AND unit = $${queryParams.length}
      `;
    }

    if (select_subgroup !== "all") {
      queryParams.push(select_subgroup);
      queryStr += `
        AND sub_group = $${queryParams.length}
      `;
    }

    if (select_product !== "all") {
      queryParams.push(select_product);
      queryStr += `
        AND prd_name = $${queryParams.length}
      `;
    }

    queryStr += `
      ORDER BY output_date DESC, percent_total_reject DESC, prd_name DESC, unit, sub_group, percent_reject_by_subgroup DESC;
    `;

    const client = await pool.connect();

    try {
      const result = await client.query(queryStr, queryParams);
      res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_date", async (req, res) => {
  try {
    const result = await pool.query(
      `
     SELECT DISTINCT TO_CHAR(output_date, 'YYYY-MM-DD') AS formatted_date
FROM smart.smart_reject_fpc_by_sheet srfbs
WHERE output_date >= (CURRENT_DATE - interval '30 days')
ORDER BY formatted_date DESC;
      
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_unit", async (req, res) => {
  try {
    const { select_date } = req.query;
    let queryStr = `
      select distinct unit  
      from smart.smart_reject_fpc_by_sheet srfbs  
    `;

    let queryParams = [];

    if (select_date !== "all") {
      queryStr += `
        where output_date = $1
      `;
      queryParams.push(select_date);
    }

    const result = await query(queryStr, queryParams); // ตรวจสอบว่าคุณได้นำเอา query ฟังก์ชันมาจากที่ถูกต้อง
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_subgroup", async (req, res) => {
  try {
    const { select_date, select_unit } = req.query;
    let queryStr = `
      SELECT DISTINCT sub_group 
      FROM smart.smart_reject_fpc_by_sheet srfbs
    `;

    let queryParams = [];

    if (select_date !== "all") {
      queryStr += `
        WHERE output_date = $1
      `;
      queryParams.push(select_date);
    }

    if (select_unit !== "all") {
      if (queryParams.length === 0) {
        queryStr += `
          WHERE output_date = $1
        `;
      } else {
        queryStr += `
          AND unit = $2
        `;
      }
      queryParams.push(select_unit);
    }

    const client = await pool.connect(); // Acquire a database client

    try {
      const result = await client.query(queryStr, queryParams); // Execute the SQL query
      res.status(200).json(result.rows);
    } finally {
      client.release(); // Release the database client when done
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_product", async (req, res) => {
  try {
    const { select_date, select_unit, select_subgroup } = req.query;

    let queryStr = `
      SELECT DISTINCT prd_name
      FROM smart.smart_reject_fpc_by_sheet srfbs
    `;

    let queryParams = [];

    if (select_date !== "all") {
      queryParams.push(select_date);
      queryStr += `
        WHERE output_date = $${queryParams.length}
      `;
    }

    if (select_unit !== "all") {
      if (queryParams.length > 0) {
        queryStr += ` AND `;
      } else {
        queryStr += ` WHERE `;
      }
      queryParams.push(select_unit);
      queryStr += `
        unit = $${queryParams.length}
      `;
    }

    if (select_subgroup !== "all") {
      if (queryParams.length > 0) {
        queryStr += ` AND `;
      } else {
        queryStr += ` WHERE `;
      }
      queryParams.push(select_subgroup);
      queryStr += `
        sub_group = $${queryParams.length}
      `;
    }

    const result = await pool.query(queryStr, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/ChartUnit", async (req, res) => {
//   try {
//     const { select_date, select_unit, select_subgroup, select_product } =
//       req.query;

//     let query = `
//       SELECT TO_CHAR(output_date, 'YYYY-MM-DD') AS formatted_date,
//       percent_reject_by_subgroup,
//       percent_total_scrap
//       FROM smart.smart_reject_fpc_by_sheet srfbs
//     `;

//     const filters = [];
//     const values = [];

//     // Check and handle each parameter
//     if (select_date && select_date !== "all") {
//       filters.push(
//         `TO_CHAR(output_date, 'YYYY-MM-DD') = $${values.length + 1}`
//       );
//       values.push(select_date);
//     }
//     if (select_unit && select_unit !== "all") {
//       filters.push(`unit = $${values.length + 1}`);
//       values.push(select_unit);
//     }
//     if (select_subgroup && select_subgroup !== "all") {
//       filters.push(`sub_group = $${values.length + 1}`);
//       values.push(select_subgroup);
//     }
//     if (select_product && select_product !== "all") {
//       filters.push(`prd_name = $${values.length + 1}`);
//       values.push(select_product);
//     }

//     if (filters.length > 0) {
//       query += ` WHERE ${filters.join(" AND ")}`;
//     }

//     query += ` ORDER BY formatted_date DESC`;

//     const result = await pool.query(query, values);

//     // Send the JSON response back to the client
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

router.get("/setDEFAULT", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT TO_CHAR(output_date, 'YYYY-MM-DD') AS formatted_date
FROM smart.smart_reject_fpc_by_sheet srfbs
ORDER BY formatted_date DESC
limit 1;

      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/ChartUnit", async (req, res) => {
//   try {
//     const { select_subgroup, select_product } = req.query;
//     let queryStr = `
//     select
//       TO_CHAR(output_date, 'YYYY-MM-DD') as formatted_date,
//       percent_reject_by_subgroup,
//       prd_name,
//       unit,
//       sub_group
//     from
//       smart.smart_reject_fpc_by_sheet srfbs
//       WHERE
//   EXTRACT(YEAR FROM output_date) = (SELECT MAX(EXTRACT(YEAR FROM output_date)) FROM smart.smart_reject_fpc_by_sheet)
//     `;

//     let queryParams = [];

//     if (select_subgroup !== "all") {
//       queryStr += `
//       and
//         sub_group = $1
//       `;
//       queryParams.push(select_subgroup);
//     }

//     if (select_product !== "all") {
//       if (queryParams.length === 0) {
//         queryStr += `
//         where
//           prd_name = $1
//         `;
//       } else {
//         queryStr += `
//         and
//           prd_name = $${queryParams.length + 1}
//         `;
//       }
//       queryParams.push(select_product);
//     }

//     queryStr += `
//       order by
//       formatted_date asc;
//     `;

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/ChartUnit", async (req, res) => {
  try {
    const { select_subgroup, select_product } = req.query;
    let queryStr = `
     select
    to_char(output_date, 'yyyy-mm-dd') as formatted_date,
    percent_reject_by_subgroup,
    prd_name,
    unit,
    sub_group
from
    smart.smart_reject_fpc_by_sheet t
where 
    output_date >= current_date - interval '365 days'
    `;

    let queryParams = [];

    if (select_subgroup !== "all") {
      queryStr += `
        AND sub_group = $1
      `;
      queryParams.push(select_subgroup);
    }

    if (select_product !== "all") {
      if (queryParams.length === 0) {
        queryStr += `
        AND prd_name = $1
        `;
      } else {
        queryStr += `
        AND prd_name = $${queryParams.length + 1}
        `;
      }
      queryParams.push(select_product);
    }

    queryStr += `
      ORDER BY formatted_date ASC;
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
