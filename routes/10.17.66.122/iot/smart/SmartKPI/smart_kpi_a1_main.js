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

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "postgres",
//   database: "postgres",
// });

const query = (text, params) => pool.query(text, params);

router.get("/ItemsBtn", async (req, res) => {
  try {
    const { select_div, select_dept, select_month } = req.query;

    let query = `
      SELECT items, "result", target 
      FROM smart.smart_kpi_a1_main skam
      WHERE 1=1
    `;

    const queryParams = [];

    if (select_div && select_div !== "ALL") {
      query += ` AND div = $1`;
      queryParams.push(select_div);
    }

    if (select_dept && select_dept !== "ALL") {
      query += ` AND dept = $${queryParams.length + 1}`;
      queryParams.push(select_dept);
    }

    if (select_month && select_month !== "ALL") {
      query += ` AND "month" = $${queryParams.length + 1}`;
      queryParams.push(select_month);
    }

    query += `
      ORDER BY "month" DESC;
    `;

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_div", async (req, res) => {
  try {
    const result = await pool.query(
      `
	select distinct div  
    from smart.smart_kpi_a1_main skam 
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_dept", async (req, res) => {
  try {
    const { select_div } = req.query;
    let query = `
      select distinct dept  
    from smart.smart_kpi_a1_main skam 
    `;
    if (select_div !== "ALL") {
      query += `
        WHERE div = $1
      `;
    }
    const queryParams = select_div !== "ALL" ? [select_div] : [];
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_month", async (req, res) => {
  try {
    const { select_div, select_dept } = req.query;

    let query = `
      SELECT DISTINCT "month"
      FROM smart.smart_kpi_a1_main
    `;

    const queryParams = [];

    if (select_div !== "ALL" && select_dept !== "ALL") {
      // กรณีไม่เท่ากับ "ALL" สำหรับทั้ง select_div และ select_dept
      query += `
        WHERE div = $1 AND dept = $2
      `;
      queryParams.push(select_div, select_dept);
    } else if (select_div !== "ALL" && select_dept === "ALL") {
      // กรณีไม่เท่ากับ "ALL" สำหรับ select_div และ "ALL" สำหรับ select_dept
      query += `
        WHERE div = $1
      `;
      queryParams.push(select_div);
    } else if (select_div === "ALL" && select_dept !== "ALL") {
      // กรณี "ALL" สำหรับ select_div และไม่เท่ากับ "ALL" สำหรับ select_dept
      query += `
        WHERE dept = $1
      `;
      queryParams.push(select_dept);
    }
    query += `
      ORDER BY "month" DESC;
    `;

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/KPI_Table", async (req, res) => {
  const { select_div, select_dept, select_month } = req.query;

  try {
    let condition = "";
    let params = [];

    if (select_div && select_div !== "ALL") {
      condition += "skam.div = $1";
      params.push(select_div);
    }

    if (select_dept && select_dept !== "ALL") {
      if (condition !== "") condition += " AND ";
      condition += "skam.dept = $" + (params.length + 1);
      params.push(select_dept);
    }

    if (select_month && select_month !== "ALL") {
      if (condition !== "") condition += " AND ";
      condition += "skam.month = $" + (params.length + 1);
      params.push(select_month);
    }

    const result = await pool.query(
      `
    SELECT
	      id,
	      "month",
	      div,
	      dept,
	      kpi,
	      items,
	      evaluate,
	      target_des,
	      dri,
	      comment,
	      update,
	      order_no,
	      what_happen_need,
	      CASE
		      WHEN result::integer = result then result::integer
		      ELSE cast(result AS DECIMAL(10,3)) END AS result,
	      CASE
		      WHEN target::integer = target then target::integer
		      ELSE cast(target AS DECIMAL(10,3)) END AS target,
        CASE
           WHEN target <> 0 THEN ROUND(CAST((result / target) * 100 AS numeric), 1)
           ELSE NULL
       END AS ev_percent,
	      CASE
		      WHEN evaluate in ('F') then 'Not Keep'
		      WHEN evaluate in ('P') then 'Keep'
		      WHEN evaluate in ('S') then 'Diff 5%'
		      ELSE evaluate
	      END AS evaluate_result
    FROM
	      smart.smart_kpi_a1_main skam

      ${condition !== "" ? "WHERE " + condition : ""}
      ORDER BY order_no ASC;
      `,
      params
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/cardResult", async (req, res) => {
  try {
    const { select_div, select_dept, select_month, select_items, select_kpi } =
      req.query;

    let query = `
	      SELECT
	        "month",
	        div,
	        dept,
	        kpi,
	        items,
	        case
		          when result::integer = result then result::integer
		          else cast(result as DECIMAL(10,3)) end as result,
	        case
		          when target::integer = target then target::integer
		          else cast(target as DECIMAL(10,3)) end as target
	      FROM
	          smart.smart_kpi_a1_main
    `;

    if (select_div !== "ALL") {
      query += ` WHERE div = '${select_div}'`;
    }

    if (select_dept !== "ALL") {
      if (query.includes("WHERE")) {
        query += ` AND dept = '${select_dept}'`;
      } else {
        query += ` WHERE dept = '${select_dept}'`;
      }
    }

    if (select_month !== "ALL") {
      if (query.includes("WHERE")) {
        query += ` AND "month" = '${select_month}'`;
      } else {
        query += ` WHERE "month" = '${select_month}'`;
      }
    }

    if (select_items !== "ALL") {
      if (query.includes("WHERE")) {
        query += ` AND items = '${select_items}'`;
      } else {
        query += ` WHERE items = '${select_items}'`;
      }
    }

    if (select_kpi !== "ALL") {
      if (query.includes("WHERE")) {
        query += ` AND kpi = '${select_kpi}'`;
      } else {
        query += ` WHERE kpi = '${select_kpi}'`;
      }
    }

    query += `
      GROUP BY "month", div, dept, kpi, items, result, target;
    `;

    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/chartResult", async (req, res) => {
  try {
    const { select_div, select_dept, select_items, select_kpi } = req.query;

    let query = `
     SELECT
      "month",
      div,
      dept,
      kpi,
      items,
      case
		          when result::integer = result then result::integer
		          else cast(result as DECIMAL(10,3)) end as result,
	        case
		          when target::integer = target then target::integer
		          else cast(target as DECIMAL(10,3)) end as target
    FROM smart.smart_kpi_a1_main
    `;

    if (select_div !== "ALL") {
      query += ` WHERE div = '${select_div}'`;
    }

    if (select_dept !== "ALL") {
      if (query.includes("WHERE")) {
        query += ` AND dept = '${select_dept}'`;
      } else {
        query += ` WHERE dept = '${select_dept}'`;
      }
    }

    if (select_items !== "ALL") {
      if (query.includes("WHERE")) {
        query += ` AND items = '${select_items}'`;
      } else {
        query += ` WHERE items = '${select_items}'`;
      }
    }

    if (select_kpi !== "ALL") {
      if (query.includes("WHERE")) {
        query += ` AND kpi = '${select_kpi}'`;
      } else {
        query += ` WHERE kpi = '${select_kpi}'`;
      }
    }

    query += `
      GROUP BY "month", div, dept, kpi, items, result, target
ORDER BY "month" ASC;
    `;

    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      month,
      kpi,
      items,
      result,
      target,
      target_des,
      evaluate,
      dri,
      comment,
    } = req.body;

    const results = await query(
      `UPDATE smart.smart_kpi_a1_main
        SET
          month = $1,
          kpi = $2,
          items = $3,
          result = $4,
          target = $5,
          target_des = $6,
          evaluate = $7,
          dri = $8, 
          comment = $9          
        WHERE id = $10;
      `,
      [
        month,
        kpi,
        items,
        result,
        target,
        target_des,
        evaluate,
        dri,
        comment,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// router.put("/updatewhat_happen_need/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { what_happen_need } = req.body;
//     console.log(what_happen_need);
//     if (!what_happen_need) {
//       return res.status(400).json({ error: "Missing attached file data" });
//     }

//     const what_happen_needJson = what_happen_need; // แปลง Array of Objects เป็น JSON
//     const result = await query(
//       `UPDATE smart.smart_kpi_a1_main
//        SET what_happen_need = $1
//        WHERE id = $2`,
//       [what_happen_needJson, id]
//     );

//     res.status(200).json({ message: "Data updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while updating data" });
//   }
// });

// router.put("/deletewhat_happen_needJson/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Perform the deletion by setting the view_cam to null
//     const result = await query(
//       `UPDATE smart.smart_kpi_a1_main
//        SET what_happen_need = null
//        WHERE id = $1`,
//       [id]
//     );

//     res.status(200).json({ message: "Data deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while deleting data" });
//   }
// });

module.exports = router;
