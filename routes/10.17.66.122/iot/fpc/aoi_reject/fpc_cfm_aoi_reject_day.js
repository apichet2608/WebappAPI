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

router.get("/AOI_Table", async (req, res) => {
  try {
    const { aoi_date, aoi_prd_name } = req.query;

    let query = `
      SELECT 
        ROW_NUMBER() OVER (ORDER BY aoi_date) AS id,
        TO_CHAR(aoi_date, 'YYYY-MM-DD') AS formatted_aoi_date,  
        TO_CHAR(aoi_date, 'YYYY-MM') AS aoi_month,  
        aoi_prd_name AS product_name, 
        aoi_side,                
        sub_group,             
        reject_desc,             
        sum_input_pcs AS input_pcs,  
        sum_rej_qty AS rej_qty,      
        CASE 
          WHEN reject_percentage = 0 THEN '0'
          ELSE TO_CHAR(reject_percentage, 'FM0.999')
        END AS rej_percent 
      FROM 
        fpc.fpc_cfm_aoi_reject_day
      WHERE 1=1
    `;

    const queryParams = [];

    if (aoi_date && aoi_date !== "ALL") {
      query += " AND aoi_date = $1"; // Use the original expression
      queryParams.push(aoi_date);
    }

    if (aoi_prd_name && aoi_prd_name !== "ALL") {
      query += " AND aoi_prd_name = $2";
      queryParams.push(aoi_prd_name);
    }

    query += `
      ORDER BY 
        aoi_date DESC, product_name DESC, aoi_side, reject_percentage DESC;
    `;

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_aoi_date", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT DISTINCT TO_CHAR(aoi_date, 'YYYY-MM-DD') AS formatted_aoi_date
            FROM fpc.fpc_cfm_aoi_reject_day fcard
            ORDER BY formatted_aoi_date DESC;
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_aoi_prd_name", async (req, res) => {
  try {
    const { aoi_date } = req.query;
    let query = `
      select distinct aoi_prd_name  as product_name
    from fpc.fpc_cfm_aoi_reject_day fcard
    `;
    if (aoi_date !== "ALL") {
      query += `
        WHERE aoi_date = $1
      `;
    }
    const queryParams = aoi_date !== "ALL" ? [aoi_date] : [];
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Chart_AOI", async (req, res) => {
  try {
    const { aoi_prd_name, aoi_side, sub_group, reject_desc } = req.query;

    let queryStr = `
      SELECT 
        TO_CHAR(aoi_date, 'yyyy-mm-dd') AS formatted_date,           
        aoi_prd_name AS product_name, 
        aoi_side,                
        sub_group,             
        reject_desc,             
        sum_input_pcs AS input_pcs,  
        sum_rej_qty AS rej_qty,      
        CASE 
          WHEN reject_percentage = 0 THEN '0'
          ELSE TO_CHAR(reject_percentage, 'FM0.999')
        END AS reject_percentage 
      FROM 
        fpc.fpc_cfm_aoi_reject_day
      WHERE 1=1
    `;

    const queryParams = [];

    if (aoi_prd_name && aoi_prd_name !== "all") {
      queryStr += ` AND aoi_prd_name = $${queryParams.length + 1}`;
      queryParams.push(aoi_prd_name);
    }

    if (aoi_side && aoi_side !== "all") {
      queryStr += ` AND aoi_side = $${queryParams.length + 1}`;
      queryParams.push(aoi_side);
    }

    if (sub_group && sub_group !== "all") {
      queryStr += ` AND sub_group = $${queryParams.length + 1}`;
      queryParams.push(sub_group);
    }

    if (reject_desc && reject_desc !== "all") {
      queryStr += ` AND reject_desc = $${queryParams.length + 1}`;
      queryParams.push(reject_desc);
    }

    queryStr += `
      ORDER BY aoi_date, product_name DESC, aoi_side, reject_percentage DESC;
    `;

    const result = await pool.query(queryStr, queryParams);

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
      select distinct TO_CHAR(aoi_date, 'YYYY-MM-DD') as formatted_aoi_date
      from fpc.fpc_cfm_aoi_reject_day fcard  
      order by formatted_aoi_date desc
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

// Table Pareto

// old
// router.get("/Table_pareto", async (req, res) => {
//   const { aoi_date, aoi_prd_name, aoi_side } = req.query;

//   try {
//     const query = `
// SELECT
//     ROW_NUMBER() OVER () as id,
//     to_char(aoi_date, 'yyyy-mm') as month,
//     to_char(aoi_date, 'yyyy-mm-dd') as aoi_date,
//     aoi_prd_name,
//     aoi_side,
//     reject_desc,
//     sum(sum_input_pcs) as sum_input_pcs,
//     sum(sum_rej_qty) as sum_rej_qty,
//     (sum(sum_rej_qty) / sum(sum_input_pcs)) * 100 as p_rej
// FROM
//     fpc.fpc_cfm_aoi_reject_day t
// WHERE
//     sum_input_pcs NOT IN ('NaN')
//     AND to_char(aoi_date, 'yyyy-mm-dd') = $1
//     AND aoi_prd_name = $2
//     AND aoi_side = $3
// GROUP BY
//     to_char(aoi_date, 'yyyy-mm'),
//     to_char(aoi_date, 'yyyy-mm-dd'),
//     aoi_prd_name,
//     aoi_side,
//     reject_desc
// ORDER BY
//     p_rej DESC;
//     `;

//     const result = await pool.query(query, [aoi_date, aoi_prd_name, aoi_side]);
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while processing the request." });
//   }
// });

router.get("/Table_pareto", async (req, res) => {
  const { aoi_date, aoi_prd_name, aoi_side } = req.query;

  try {
    const query = `
select
    row_number() over () as id,
    to_char(aoi_date, 'yyyy-mm') as month,
    aoi_prd_name,
    aoi_side,
    reject_desc,
    sum(sum_input_pcs) as sum_input_pcs,
    sum(sum_rej_qty) as sum_rej_qty,
    (sum(sum_rej_qty) / sum(sum_input_pcs)) * 100 as p_rej
from
    fpc.fpc_cfm_aoi_reject_day t
where
    sum_input_pcs not in ('NaN')
    and to_char(aoi_date, 'yyyy-mm') = $1
    and aoi_prd_name = $2
    and aoi_side = $3
group by
    to_char(aoi_date, 'yyyy-mm'),
    aoi_prd_name,
    aoi_side,
    reject_desc
order by
    p_rej desc;
    `;

    const result = await pool.query(query, [aoi_date, aoi_prd_name, aoi_side]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

router.get("/Chart_pareto", async (req, res) => {
  const { month, aoi_prd_name, aoi_side, reject_desc } = req.query;

  try {
    const result = await pool.query(
      `
       select
	to_char(aoi_date,
	'yyyy-mm-dd') as formatted_date,
	ROUND(reject_percentage::numeric,
	2) as reject_percentage,
	to_char(aoi_date,
	'yyyy-mm') as month,
	aoi_prd_name,
	aoi_side,
	reject_desc
from
	fpc.fpc_cfm_aoi_reject_day
where
	to_char(aoi_date,
	'YYYY-MM') = $1
	and aoi_prd_name = $2
	and aoi_side = $3
	and reject_desc = $4
order by
	aoi_date asc
      `,
      [month, aoi_prd_name, aoi_side, reject_desc]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// ---------------------- Page AOI Improvement ---------------------- //

router.get("/setMonthDEFAULT", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct 
	to_char (aoi_date, 'yyyy-mm') as month
	from fpc.fpc_cfm_aoi_reject_day fcard 
	order by month desc
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

router.get("/distinct_month", async (req, res) => {
  try {
    const result = await pool.query(`
      WITH sum_day AS (
        SELECT
          t.aoi_date,
          t.aoi_prd_name,
          t.aoi_side,
          MAX(t.sum_input_pcs) AS input_pcs,
          SUM(t.sum_rej_qty) AS rej_qty
        FROM
          fpc.fpc_cfm_aoi_reject_day t
        GROUP BY
          t.aoi_date,
          t.aoi_prd_name,
          t.aoi_side
        ORDER BY
          t.aoi_date ASC,
          t.aoi_prd_name ASC,
          t.aoi_side ASC
      )
      SELECT DISTINCT TO_CHAR(sd.aoi_date, 'yyyy-mm') AS month
      FROM
        sum_day sd
        INNER JOIN fpc.fpc_cfm_aoi_reject_master m
        ON
          TO_CHAR(sd.aoi_date, 'yyyy-mm') = m."month"
          AND CONCAT(SPLIT_PART(sd.aoi_prd_name, '-', 1), '-', SPLIT_PART(sd.aoi_prd_name, '-', 2)) = m.product
          AND sd.aoi_side = m.side
        ORDER BY month DESC
    `);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_aoi_prd_name_im", async (req, res) => {
  try {
    const { month } = req.query;

    let query = `
      WITH sum_day AS (
        SELECT
          t.aoi_date,
          t.aoi_prd_name,
          t.aoi_side,
          MAX(t.sum_input_pcs) AS input_pcs,
          SUM(t.sum_rej_qty) AS rej_qty
        FROM
          fpc.fpc_cfm_aoi_reject_day t
        GROUP BY
          t.aoi_date,
          t.aoi_prd_name,
          t.aoi_side
        ORDER BY
          t.aoi_date ASC,
          t.aoi_prd_name ASC,
          t.aoi_side ASC
      )
      SELECT DISTINCT sd.aoi_prd_name
      FROM
        sum_day sd
        INNER JOIN fpc.fpc_cfm_aoi_reject_master m
        ON
          TO_CHAR(sd.aoi_date, 'yyyy-mm') = m."month"
          AND CONCAT(SPLIT_PART(sd.aoi_prd_name, '-', 1), '-', SPLIT_PART(sd.aoi_prd_name, '-', 2)) = m.product
          AND sd.aoi_side = m.side
      WHERE
        (COALESCE($1, 'ALL') = 'ALL' OR TO_CHAR(sd.aoi_date, 'yyyy-mm') = $1)
    `;

    const queryParams = [];

    if (month && month !== "ALL") {
      query += ` AND TO_CHAR(aoi_date, 'yyyy-mm') = $1`;
      queryParams.push(month);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_aoi_side_im", async (req, res) => {
  try {
    const { month, aoi_prd_name } = req.query;

    let query = `
      WITH sum_day AS (
        SELECT
          t.aoi_date,
          t.aoi_prd_name,
          t.aoi_side,
          MAX(t.sum_input_pcs) AS input_pcs,
          SUM(t.sum_rej_qty) AS rej_qty
        FROM
          fpc.fpc_cfm_aoi_reject_day t
        GROUP BY
          t.aoi_date,
          t.aoi_prd_name,
          t.aoi_side
        ORDER BY
          t.aoi_date ASC,
          t.aoi_prd_name ASC,
          t.aoi_side ASC
      )
      SELECT DISTINCT sd.aoi_side
      FROM
        sum_day sd
        INNER JOIN fpc.fpc_cfm_aoi_reject_master m
        ON
          TO_CHAR(sd.aoi_date, 'yyyy-mm') = m."month"
          AND CONCAT(SPLIT_PART(sd.aoi_prd_name, '-', 1), '-', SPLIT_PART(sd.aoi_prd_name, '-', 2)) = m.product
          AND sd.aoi_side = m.side
      WHERE
        (COALESCE($1, 'ALL') = 'ALL' OR TO_CHAR(sd.aoi_date, 'yyyy-mm') = $1)
        ${aoi_prd_name === "ALL" ? "" : "AND sd.aoi_prd_name = $2"}
    `;

    const queryParams = [];

    if (month && month !== "ALL") {
      queryParams.push(month);
    }
    if (aoi_prd_name && aoi_prd_name !== "ALL") {
      queryParams.push(aoi_prd_name);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/AOI_ImprovementTable", async (req, res) => {
//   try {
//     const { month, aoi_prd_name, aoi_side } = req.query;

//     const result = await pool.query(
//       `
//       WITH sum_day AS (
//         SELECT
//             t.aoi_date,
//             t.aoi_prd_name,
//             t.aoi_side,
//             MAX(t.sum_input_pcs) AS input_pcs,
//             SUM(t.sum_rej_qty) AS rej_qty
//         FROM
//             fpc.fpc_cfm_aoi_reject_day t
//         GROUP BY
//             t.aoi_date,
//             t.aoi_prd_name,
//             t.aoi_side
//         ORDER BY
//             t.aoi_date ASC,
//             t.aoi_prd_name ASC,
//             t.aoi_side ASC
//       ),
//       sum_month AS (
//         SELECT
//             TO_CHAR(sd.aoi_date, 'yyyy-mm') AS month,
//             sd.aoi_prd_name,
//             sd.aoi_side,
//             SUM(sd.input_pcs) AS t_input_pcs,
//             SUM(sd.rej_qty) AS t_rej_pcs
//         FROM
//             sum_day sd
//         GROUP BY
//             TO_CHAR(sd.aoi_date, 'yyyy-mm'),
//             sd.aoi_prd_name,
//             sd.aoi_side
//       )
//       SELECT
//           ROW_NUMBER() OVER () AS id,
//           sm.month,
//           sm.aoi_prd_name,
//           sm.aoi_side,
//           ROUND((sm.t_rej_pcs * 100) / sm.t_input_pcs::NUMERIC, 2) AS p_rej,
//           m.target_p_reject
//       FROM
//           sum_month sm
//       INNER JOIN
//           fpc.fpc_cfm_aoi_reject_master m
//       ON
//           sm.month = m."month"
//           AND SPLIT_PART(sm.aoi_prd_name, '-', 1) || '-' || SPLIT_PART(sm.aoi_prd_name, '-', 2) = m.product
//           AND sm.aoi_side = m.side
//       WHERE
//           ($1 = 'ALL' OR sm.month = $1)
//           AND ($2 = 'ALL' OR sm.aoi_prd_name = $2)
//           AND ($3 = 'ALL' OR sm.aoi_side = $3);
//       `,
//       [month, aoi_prd_name, aoi_side]
//     );

//     // Send the JSON response back to the client
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// router.get("/Table_Im", async (req, res) => {
//   try {
//     const { month, aoi_prd_name, aoi_side } = req.query;

//     const result = await pool.query(
//       `
//       with sum_day as (
//         select
//           t.aoi_date,
//           t.aoi_prd_name,
//           t.aoi_side,
//           max(t.sum_input_pcs) as input_pcs,
//           sum(t.sum_rej_qty) as rej_qty
//         from
//           fpc.fpc_cfm_aoi_reject_day t
//         group by
//           t.aoi_date,
//           t.aoi_prd_name,
//           t.aoi_side
//         order by
//           t.aoi_date asc,
//           t.aoi_prd_name asc,
//           t.aoi_side asc
//       )
//       select
//         to_char(sd.aoi_date, 'yyyy-mm') as month,
//         sd.aoi_prd_name,
//         sd.aoi_side,
//         round((sd.rej_qty * 100) / sd.input_pcs::numeric, 2) as p_rej,
//         m.target_p_reject,
//         ROW_NUMBER() OVER () AS id
//       from
//         sum_day sd
//       inner join fpc.fpc_cfm_aoi_reject_master m
//         on
//         to_char(sd.aoi_date, 'yyyy-mm') = m."month"
//         and split_part(sd.aoi_prd_name, '-', 1) || '-' || split_part(sd.aoi_prd_name, '-', 2) = m.product
//         and sd.aoi_side = m.side
//       where
//         (COALESCE($1, 'ALL') = 'ALL' or to_char(sd.aoi_date, 'yyyy-mm') = $1)
//         and (COALESCE($2, 'ALL') = 'ALL' or sd.aoi_prd_name = $2)
//         and (COALESCE($3, 'ALL') = 'ALL' or sd.aoi_side = $3)
//       `,
//       [month, aoi_prd_name, aoi_side]
//     );

//     // Send the JSON response back to the client
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

router.get("/AOI_ImprovementTable", async (req, res) => {
  try {
    const { month, aoi_prd_name, aoi_side } = req.query;

    const result = await pool.query(
      `
    WITH sum_day AS (
      SELECT
        t.aoi_date,
        t.aoi_prd_name,
        t.aoi_side,
        MAX(t.sum_input_pcs) AS input_pcs,
        SUM(t.sum_rej_qty) AS rej_qty
      FROM
        fpc.fpc_cfm_aoi_reject_day t
      GROUP BY
        t.aoi_date,
        t.aoi_prd_name,
        t.aoi_side
    ),
    sum_month AS (
      SELECT
        TO_CHAR(sd.aoi_date, 'yyyy-mm') AS month,
        sd.aoi_prd_name,
        sd.aoi_side,
        SUM(sd.input_pcs) AS t_input_pcs,
        SUM(sd.rej_qty) AS t_rej_pcs
      FROM
        sum_day sd
      GROUP BY
        TO_CHAR(sd.aoi_date, 'yyyy-mm'),
        sd.aoi_prd_name,
        sd.aoi_side
    )
    SELECT
      ROW_NUMBER() OVER (ORDER BY sm.month, sm.aoi_prd_name, sm.aoi_side) AS id,
      sm.month,
      sm.aoi_prd_name,
      sm.aoi_side,
      ROUND((sm.t_rej_pcs * 100) / NULLIF(sm.t_input_pcs, 0)::NUMERIC, 2) AS p_rej,
      m.target_p_reject
    FROM
      sum_month sm
    INNER JOIN
      fpc.fpc_cfm_aoi_reject_master m
    ON
      sm.month = m."month"
      AND SPLIT_PART(sm.aoi_prd_name, '-', 1) || '-' || SPLIT_PART(sm.aoi_prd_name, '-', 2) = m.product
      AND sm.aoi_side = m.side
    WHERE
      ($1 = 'ALL' OR sm.month = $1)
      AND ($2 = 'ALL' OR sm.aoi_prd_name = $2)
      AND ($3 = 'ALL' OR sm.aoi_side = $3);
      `,
      [month, aoi_prd_name, aoi_side]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Chart_aoi_im", async (req, res) => {
  try {
    const { aoi_prd_name, aoi_side } = req.query;

    const result = await pool.query(
      `
      WITH sum_day AS (
        SELECT
            t.aoi_date,
            t.aoi_prd_name,
            t.aoi_side,
            MAX(t.sum_input_pcs) AS input_pcs,
            SUM(t.sum_rej_qty) AS rej_qty
        FROM
            fpc.fpc_cfm_aoi_reject_day t
        GROUP BY
            t.aoi_date,
            t.aoi_prd_name,
            t.aoi_side
        ORDER BY
            t.aoi_date ASC,
            t.aoi_prd_name ASC,
            t.aoi_side ASC
      ),
      sum_month AS (
        SELECT
            TO_CHAR(sd.aoi_date, 'yyyy-mm') AS month,
            sd.aoi_prd_name,
            sd.aoi_side,
            SUM(sd.input_pcs) AS t_input_pcs,
            SUM(sd.rej_qty) AS t_rej_pcs
        FROM
            sum_day sd
        GROUP BY
            TO_CHAR(sd.aoi_date, 'yyyy-mm'),
            sd.aoi_prd_name,
            sd.aoi_side
      )
      SELECT
          sm.month,
          sm.aoi_prd_name,
          sm.aoi_side,
          ROUND((sm.t_rej_pcs * 100) / sm.t_input_pcs::NUMERIC, 2) AS p_rej,
          m.target_p_reject
      FROM
          sum_month sm
      INNER JOIN
          fpc.fpc_cfm_aoi_reject_master m
      ON
          sm.month = m."month"
          AND SPLIT_PART(sm.aoi_prd_name, '-', 1) || '-' || SPLIT_PART(sm.aoi_prd_name, '-', 2) = m.product
          AND sm.aoi_side = m.side
      WHERE
          ($1 = 'ALL' OR sm.aoi_prd_name = $1)
          AND ($2 = 'ALL' OR sm.aoi_side = $2)
      `,
      [aoi_prd_name, aoi_side]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//----------Improvement Pareto----------

router.get("/Im_table_pareto", async (req, res) => {
  try {
    const { month, aoi_prd_name, aoi_side } = req.query;
    const result = await pool.query(
      `
  WITH sum_day AS (
  SELECT
    DATE_TRUNC('MONTH', t.aoi_date) AS month_start,
    t.aoi_prd_name,
    t.aoi_side,
    MAX(t.sum_input_pcs) AS input_pcs,
    SUM(t.sum_rej_qty) AS rej_qty,
    t.reject_desc
  FROM
    fpc.fpc_cfm_aoi_reject_day t
  WHERE
    EXTRACT(YEAR FROM t.aoi_date) = EXTRACT(YEAR FROM TO_TIMESTAMP($1, 'YYYY-MM'))
    AND EXTRACT(MONTH FROM t.aoi_date) = EXTRACT(MONTH FROM TO_TIMESTAMP($1, 'YYYY-MM'))
    AND t.aoi_prd_name = $2
    AND t.aoi_side = $3
  GROUP BY
    month_start,
    t.aoi_prd_name,
    t.aoi_side,
    t.reject_desc
),
ranked_data AS (
  SELECT
    TO_CHAR(sd.month_start, 'yyyy-mm') AS month,
    sd.aoi_prd_name,
    sd.aoi_side,
    sd.reject_desc,
    ROUND((sd.rej_qty * 100) / NULLIF(sd.input_pcs, 0)::NUMERIC, 2) AS p_rej,
    m.target_p_reject,
    ROW_NUMBER() OVER () AS id
  FROM
    sum_day sd
  INNER JOIN
    fpc.fpc_cfm_aoi_reject_master m
    ON sd.month_start = DATE_TRUNC('MONTH', TO_TIMESTAMP(m."month", 'YYYY-MM'))::DATE
    AND SPLIT_PART(sd.aoi_prd_name, '-', 1) || '-' || SPLIT_PART(sd.aoi_prd_name, '-', 2) = m.product
    AND sd.aoi_side = m.side
)
SELECT *
FROM ranked_data
ORDER BY p_rej DESC;

    
      `,
      [month, aoi_prd_name, aoi_side]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});
router.get("/Im_chart_pareto", async (req, res) => {
  try {
    const { month, aoi_prd_name, aoi_side, reject_desc } = req.query;
    const result = await pool.query(
      `
     WITH sum_day AS (
  SELECT
    t.aoi_date,
    t.aoi_prd_name,
    t.aoi_side,
    t.reject_desc,
    MAX(t.sum_input_pcs) AS input_pcs,
    SUM(t.sum_rej_qty) AS rej_qty
  FROM
    fpc.fpc_cfm_aoi_reject_day t
  GROUP BY
    t.aoi_date,
    t.aoi_prd_name,
    t.aoi_side,
    t.reject_desc
),
ranked_data AS (
  SELECT
    TO_CHAR(sd.aoi_date, 'yyyy-mm') AS month,
    TO_CHAR(sd.aoi_date, 'yyyy-mm-dd') AS formatted_aoi_date,
    sd.aoi_prd_name,
    sd.aoi_side,
    sd.reject_desc,
    ROUND((sd.rej_qty * 100) / NULLIF(sd.input_pcs, 0)::NUMERIC, 2) AS p_rej,
    m.target_p_reject,
    ROW_NUMBER() OVER () AS id
  FROM
    sum_day sd
  INNER JOIN fpc.fpc_cfm_aoi_reject_master m ON TO_CHAR(sd.aoi_date, 'yyyy-mm') = m."month"
    AND SPLIT_PART(sd.aoi_prd_name, '-', 1) || '-' || SPLIT_PART(sd.aoi_prd_name, '-', 2) = m.product
    AND sd.aoi_side = m.side
  WHERE
    TO_CHAR(sd.aoi_date, 'yyyy-mm') = $1
    AND sd.aoi_prd_name = $2
    AND sd.aoi_side = $3
    AND sd.reject_desc = $4
)
SELECT *
FROM ranked_data
ORDER BY formatted_aoi_date ASC;
    
      `,
      [month, aoi_prd_name, aoi_side, reject_desc]
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// ---------------------- Page AOI Improvement ---------------------- //

module.exports = router;
