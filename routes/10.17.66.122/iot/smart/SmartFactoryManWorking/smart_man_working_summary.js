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

router.get("/distinct_month", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct month as month_code
from smart.smart_man_working_summary smws 
order by month_code desc;
      
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_cpo_div", async (req, res) => {
  try {
    const { select_month } = req.query;
    let query = `
      SELECT DISTINCT cpo_div 
      FROM smart.smart_man_working_summary smws 
    `;
    if (select_month !== "ALL") {
      query += `
        WHERE month = $1
      `;
    }
    query += `
      ORDER BY cpo_div ASC;
    `;

    const queryParams = select_month !== "ALL" ? [select_month] : [];
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_cpo_unit", async (req, res) => {
  try {
    const { select_month, select_cpo_div } = req.query;

    let query = `
      select distinct cpo_unit 
from smart.smart_man_working_summary smws 
    `;

    const queryParams = [];

    if (select_month !== "ALL" && select_cpo_div !== "ALL") {
      query += `
        WHERE month = $1 AND cpo_div = $2
      `;
      queryParams.push(select_month, select_cpo_div);
    } else if (select_month !== "ALL" && select_cpo_div === "ALL") {
      query += `
        WHERE month = $1
      `;
      queryParams.push(select_month);
    } else if (select_month === "ALL" && select_cpo_div !== "ALL") {
      query += `
        WHERE cpo_div = $1
      `;
      queryParams.push(select_cpo_div);
    }

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table_summary", async (req, res) => {
  try {
    const { select_month, select_cpo_div, select_cpo_unit } = req.query;

    let conditions = [];
    let parameters = [];

    if (select_month && select_month !== "ALL") {
      conditions.push(`month = $${parameters.length + 1}`);
      parameters.push(select_month);
    }

    if (select_cpo_div && select_cpo_div !== "ALL") {
      conditions.push(`cpo_div = $${parameters.length + 1}`);
      parameters.push(select_cpo_div);
    }

    if (select_cpo_unit && select_cpo_unit !== "ALL") {
      conditions.push(`cpo_unit = $${parameters.length + 1}`);
      parameters.push(select_cpo_unit);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `
     SELECT
    id,
    select_date,
    month AS month_code,
    cpo_div,
    cpo_unit,
    normal_direct,
    ot_direct,
    CASE
        WHEN percent_ot_direct = ROUND(percent_ot_direct) THEN
            CAST(ROUND(percent_ot_direct) AS INTEGER)
        ELSE
            ROUND(CAST(percent_ot_direct AS numeric), 1)
    END AS percent_ot_direct,
    normal_indirect,
    ot_indirect,
    CASE
        WHEN percent_ot_indirect = ROUND(percent_ot_indirect) THEN
            CAST(ROUND(percent_ot_indirect) AS INTEGER)
        ELSE
            ROUND(CAST(percent_ot_indirect AS numeric), 1)
    END AS percent_ot_indirect,
    leave,
    record_total,
    hr_total,
    update_date
FROM
    smart.smart_man_working_summary 
      ${whereClause}
      ORDER BY
        select_date ASC;
      `,
      parameters
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Chart_OT", async (req, res) => {
  try {
    const { select_month, select_cpo_div, select_cpo_unit } = req.query;

    const result = await pool.query(
      `
      SELECT 
    id, 
    TO_CHAR(CAST(select_date AS DATE), 'YYYY-MM-DD') AS select_date,
    month AS month_code, 
    cpo_div, 
    cpo_unit,  
    normal_direct, 
    ot_direct, 
    percent_ot_direct, 
    normal_indirect, 
    ot_indirect,
    percent_ot_indirect,
    leave, 
    record_total, 
    hr_total, 
    update_date
FROM 
    smart.smart_man_working_summary
      WHERE
        ($1 = 'ALL' OR month = $1)
        AND ($2 = 'ALL' OR cpo_div = $2)
        AND ($3 = 'ALL' OR cpo_unit = $3)
      ORDER BY select_date ASC;
      
      `,
      [select_month, select_cpo_div, select_cpo_unit]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/setDEFAULT", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT month AS month_code
FROM smart.smart_man_working_summary
ORDER BY month_code DESC
LIMIT 1;
      
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
