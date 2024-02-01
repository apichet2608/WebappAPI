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

router.get("/setDEFAULT", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT TO_CHAR(output_date, 'YYYY-MM-DD') AS formatted_date
FROM smart.smart_reject_fpc_product_item srfpi 
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

router.get("/distinct_formattedDate", async (req, res) => {
  try {
    const result = await pool.query(
      `
     SELECT DISTINCT TO_CHAR(output_date, 'YYYY-MM-DD') AS formatted_date
FROM smart.smart_reject_fpc_product_item srfpi 
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
    const { formattedDate } = req.query;
    let queryStr = `
      select distinct unit  
      from smart.smart_reject_fpc_product_item srfpi
    `;

    let queryParams = [];

    if (formattedDate !== "all") {
      queryStr += `
        where output_date = $1
      `;
      queryParams.push(formattedDate);
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct_subgroup", async (req, res) => {
  try {
    const { formattedDate, unit } = req.query;
    let queryStr = `
      SELECT DISTINCT sub_group 
      FROM smart.smart_reject_fpc_product_item srfpi 
    `;

    let queryParams = [];

    if (formattedDate !== "all") {
      queryStr += `
        WHERE output_date = $1
      `;
      queryParams.push(formattedDate);
    }

    if (unit !== "all") {
      if (queryParams.length === 0) {
        queryStr += `
          WHERE output_date = $1
        `;
      } else {
        queryStr += `
          AND unit = $2
        `;
      }
      queryParams.push(unit);
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

router.get("/distinct_rejectCodeDesc", async (req, res) => {
  try {
    const { formattedDate, unit, subgroup } = req.query;

    let queryStr = `
      SELECT DISTINCT reject_code || ' ' || reject_desc AS reject_codedesc
      FROM smart.smart_reject_fpc_product_item srfpi
    `;

    let queryParams = [];

    if (formattedDate !== "all") {
      queryParams.push(formattedDate);
      queryStr += `
        WHERE output_date = $${queryParams.length}
      `;
    }

    if (unit !== "all") {
      if (queryParams.length > 0) {
        queryStr += ` AND `;
      } else {
        queryStr += ` WHERE `;
      }
      queryParams.push(unit);
      queryStr += `
        unit = $${queryParams.length}
      `;
    }

    if (subgroup !== "all") {
      if (queryParams.length > 0) {
        queryStr += ` AND `;
      } else {
        queryStr += ` WHERE `;
      }
      queryParams.push(subgroup);
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

router.get("/Table_ByItem", async (req, res) => {
  try {
    const { formattedDate, unit, subgroup, rejectCodeDesc } = req.query;

    let queryStr = `
      SELECT *, reject_code || ' ' || reject_desc AS reject_codedesc, TO_CHAR(output_date, 'YYYY-MM-DD') AS formatted_date 
      FROM smart.smart_reject_fpc_product_item srfpi 
      WHERE 1=1
    `;

    let queryParams = [];

    if (formattedDate !== "all") {
      queryParams.push(formattedDate);
      queryStr += `
        AND output_date = $${queryParams.length}
      `;
    }

    if (unit !== "all") {
      queryParams.push(unit);
      queryStr += `
        AND unit = $${queryParams.length}
      `;
    }

    if (subgroup !== "all") {
      queryParams.push(subgroup);
      queryStr += `
        AND sub_group = $${queryParams.length}
      `;
    }

    if (rejectCodeDesc.trim() !== "all") {
      // Trim and check if the value is not empty or whitespace
      queryParams.push(rejectCodeDesc.trim());
      queryStr += `
        AND (reject_code || ' ' || reject_desc) = $${queryParams.length}
      `;
    }

    queryStr += `
       order by output_date desc, percent_total_reject desc, prd_name ,unit, sub_group ,percent_rej desc 

    `;

    const client = await pool.connect();

    try {
      const result = await client.query(queryStr, queryParams);
      console.log(result.rows);
      res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/ChartItem", async (req, res) => {
  try {
    const { subgroup, product, rejectCodeDesc } = req.query;
    let queryStr = `
     SELECT
        TO_CHAR(output_date, 'yyyy-mm-dd') AS formatted_date,
        reject_code || ' ' || reject_desc AS reject_codedesc,
        percent_rej,
        prd_name,
        unit,
        percent_rej,
        sub_group
     FROM
        smart.smart_reject_fpc_product_item srfpi
     WHERE 
        output_date >= current_date - interval '365 days'
    `;

    let queryParams = [];

    if (subgroup !== "all") {
      queryStr += `
        AND sub_group = $1
      `;
      queryParams.push(subgroup);
    }

    if (product !== "all") {
      if (queryParams.length === 0) {
        queryStr += `
          AND prd_name = $1
        `;
      } else {
        queryStr += `
          AND prd_name = $${queryParams.length + 1}
        `;
      }
      queryParams.push(product);
    }

    if (rejectCodeDesc !== "all") {
      if (queryParams.length === 0) {
        queryStr += `
          AND (reject_code || ' ' || reject_desc) = $1
        `;
      } else {
        queryStr += `
          AND (reject_code || ' ' || reject_desc) = $${queryParams.length + 1}
        `;
      }
      queryParams.push(rejectCodeDesc);
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
