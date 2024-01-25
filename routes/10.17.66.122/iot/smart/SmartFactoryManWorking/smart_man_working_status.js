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

router.get("/default", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT select_date
      FROM smart.smart_man_working_status
 order by select_date desc 
 limit 1
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_department", async (req, res) => {
  try {
    const { selectDate } = req.query;

    const result = await pool.query(
      `
      SELECT DISTINCT department 
      FROM smart.smart_man_working_status
      WHERE select_date = $1
      `,
      [selectDate]
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
    const { selectDate, department } = req.query;
    const queryParams = [];
    let queryStr = `
      SELECT DISTINCT process 
      FROM smart.smart_man_working_status
      WHERE 1 = 1`;

    if (selectDate && selectDate !== "ALL") {
      queryStr += ` AND select_date = $${queryParams.push(selectDate)}`;
    }

    if (department && department !== "ALL") {
      queryStr += ` AND department = $${queryParams.push(department)}`;
    }

    // Add an ORDER BY clause to order the results by the "process" column in ascending order
    queryStr += ` ORDER BY process ASC`;

    const result = await pool.query(queryStr, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/result_totalDetail", async (req, res) => {
  try {
    const { select_date, department, process } = req.query;

    let queryParams = [];
    let queryStr = `
    SELECT
        categories.title,
        COALESCE(SUM(CASE WHEN sr.con_wk = categories.title THEN 1 ELSE 0 END), 0) AS result
    FROM
        (
            SELECT 'Normal Working' AS title
            UNION ALL
            SELECT 'OT'
            UNION ALL
            SELECT 'Work on Holiday'
            UNION ALL
            SELECT 'Work Holiday'
            UNION ALL
            SELECT 'Working in line'
            UNION ALL
            SELECT 'Roving'
            UNION ALL
            SELECT 'Work Indirect'
            UNION ALL
            SELECT 'OT Indirect'
            UNION ALL
            SELECT 'Half Day'
            UNION ALL
            SELECT 'Half Day With OT'
            UNION ALL
            SELECT 'Full Day'
            UNION ALL
            SELECT 'Full Day With OT'
            UNION ALL
            SELECT 'Only OT 3Hr'
            UNION ALL
            SELECT 'Leave 2Hr'
            UNION ALL
            SELECT 'Leave 4Hr'
        ) AS categories
    LEFT JOIN
        smart.smart_man_working_status AS sr
        ON categories.title = sr.con_wk
    `;

    if (select_date !== "ALL") {
      queryStr += `
        AND sr.select_date = $${queryParams.length + 1}
      `;
      queryParams.push(select_date);
    }

    if (department !== "ALL") {
      queryStr += `
        AND sr.department = $${queryParams.length + 1}
      `;
      queryParams.push(department);
    }

    if (process !== "ALL") {
      queryStr += `
        AND sr.process = $${queryParams.length + 1}
      `;
      queryParams.push(process);
    }

    queryStr += `
    GROUP BY
        categories.title;
    `;

    const result = await pool.query(queryStr, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/result_total4", async (req, res) => {
  try {
    const { select_date, department, process } = req.query;

    let queryParams = [];
    let queryStr = ``;

    if (select_date !== "ALL") {
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
        select_date = $${queryParams.length + 1}
      `;
      queryParams.push(select_date);
    }

    if (department !== "ALL") {
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
        department = $${queryParams.length + 1}
      `;
      queryParams.push(department);
    }

    if (process !== "ALL") {
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
        process = $${queryParams.length + 1}
      `;
      queryParams.push(process);
    }

    const result = await pool.query(
      `
      SELECT
        'Working' AS title,
        SUM(CASE WHEN con_wk IN ('Normal Working','OT','Work on Holiday') THEN 1 ELSE 0 END) AS result
      FROM smart.smart_man_working_status
      ${queryStr}
      UNION ALL
      SELECT
        'Indirect' AS title,
        SUM(CASE WHEN con_wk IN ('Work Holiday','Roving','Work Indirect','OT Indirect') THEN 1 ELSE 0 END) AS result
      FROM smart.smart_man_working_status
      ${queryStr}
      UNION ALL
      SELECT
        'Support' AS title,
        SUM(CASE WHEN con_wk IN ('Half Day','Half Day With OT','Full Day','Full Day With OT','Only OT 3Hr') THEN 1 ELSE 0 END) AS result
      FROM smart.smart_man_working_status
      ${queryStr}
      UNION ALL
      SELECT
        'Leave' AS title,
        SUM(CASE WHEN con_wk IN ('Leave','Leave 2Hr','Leave 4Hr') THEN 1 ELSE 0 END) AS result
      FROM smart.smart_man_working_status
      ${queryStr}
      `,
      queryParams
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

router.get("/distinct_selectdate", async (req, res) => {
  try {
    const result = await pool.query(
      `
SELECT DISTINCT select_date
      FROM smart.smart_man_working_status srt
      ORDER BY select_date desc ;
        `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/table_view_data", async (req, res) => {
  try {
    const { select_date, department, con_wk } = req.query;

    let queryStr = `
select *
from smart.smart_man_working_status srt
`;
    let queryParams = [];
    if (select_date !== "ALL") {
      queryStr += `
WHERE select_date = $${queryParams.length + 1}
`;
      queryParams.push(select_date);
    }
    if (department !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
AND department = $${queryParams.length + 1}
`;
      } else {
        queryStr += `
WHERE department = $${queryParams.length + 1}
`;
      }
      queryParams.push(department);
    }

    if (con_wk !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
AND con_wk in ($${queryParams.length + 1})
`;
      } else {
        queryStr += `
WHERE con_wk in ($${queryParams.length + 1})
`;
      }
      queryParams.push(department);
    }
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/result_totalToday", async (req, res) => {
  try {
    const { select_date, department, process } = req.query;

    let queryParams = [];
    let queryStr = `
      SELECT
        categories.title,
        COALESCE(SUM(CASE WHEN sr.con_wk = categories.title THEN 1 ELSE 0 END), 0) AS result
      FROM
        (
          SELECT 'Normal Working' AS title
          UNION ALL
          SELECT 'OT'
          UNION ALL
          SELECT 'Work on Holiday'
        ) AS categories
      LEFT JOIN
        smart.smart_man_working_status AS sr
        ON categories.title = sr.con_wk
    `;

    if (select_date !== "ALL" || department !== "ALL" || process !== "ALL") {
      queryStr += `
        WHERE 1=1
      `;
    }

    if (select_date !== "ALL") {
      queryStr += `
        AND sr.select_date = $${queryParams.length + 1}
      `;
      queryParams.push(select_date);
    }

    if (department !== "ALL") {
      queryStr += `
        AND sr.department = $${queryParams.length + 1}
      `;
      queryParams.push(department);
    }

    if (process !== "ALL") {
      queryStr += `
        AND sr.process = $${queryParams.length + 1}
      `;
      queryParams.push(process);
    }

    queryStr += `
      GROUP BY
        categories.title;
    `;

    const result = await pool.query(queryStr, queryParams);

    const finalResult = result.rows.map((row) => {
      if (
        row.title !== "Normal Working" &&
        row.title !== "OT" &&
        row.title !== "Work on Holiday"
      ) {
        return { title: row.title, result: 0 };
      }
      return row;
    });

    res.json(finalResult);
    console.log("today");
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/result_totalIndirect", async (req, res) => {
  try {
    const { select_date, department, process } = req.query;

    let queryParams = [];
    let queryStr = `
      SELECT
        categories.title,
        COALESCE(SUM(CASE WHEN sr.con_wk = categories.title THEN 1 ELSE 0 END), 0) AS result
      FROM
        (
          SELECT 'Work Holiday' AS title
          UNION ALL
          SELECT 'Roving'
          UNION ALL
          SELECT 'OT Indirect'
          UNION ALL
          SELECT 'Work Indirect'
        ) AS categories
      LEFT JOIN
        smart.smart_man_working_status AS sr
        ON categories.title = sr.con_wk
    `;

    if (select_date !== "ALL" || department !== "ALL" || process !== "ALL") {
      queryStr += `
        WHERE 1=1
      `;
    }

    if (select_date !== "ALL") {
      queryStr += `
        AND sr.select_date = $${queryParams.length + 1}
      `;
      queryParams.push(select_date);
    }

    if (department !== "ALL") {
      queryStr += `
        AND sr.department = $${queryParams.length + 1}
      `;
      queryParams.push(department);
    }

    if (process !== "ALL") {
      queryStr += `
        AND sr.process = $${queryParams.length + 1}
      `;
      queryParams.push(process);
    }

    queryStr += `
      GROUP BY
        categories.title;
    `;

    const result = await pool.query(queryStr, queryParams);

    const finalResult = result.rows.map((row) => {
      if (
        row.title !== "Work Holiday" &&
        row.title !== "Roving" &&
        row.title !== "OT Indirect" &&
        row.title !== "Work Indirect"
      ) {
        return { title: row.title, result: 0 };
      }
      return row;
    });

    res.json(finalResult);
    console.log("today");
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/result_totalSupport", async (req, res) => {
  try {
    const { select_date, department, process } = req.query;

    let queryParams = [];
    let queryStr = `
      SELECT
        categories.title,
        COALESCE(SUM(CASE WHEN sr.con_wk = categories.title THEN 1 ELSE 0 END), 0) AS result
      FROM
        (
          SELECT 'Half Day' AS title
          UNION ALL
          SELECT 'Half Day With OT'
          UNION ALL
          SELECT 'Full Day'
          UNION ALL
          SELECT 'Full Day With OT'
          UNION ALL
          SELECT 'Only OT 3Hr'
        ) AS categories
      LEFT JOIN
        smart.smart_man_working_status AS sr
        ON categories.title = sr.con_wk
    `;

    if (select_date !== "ALL" || department !== "ALL" || process !== "ALL") {
      queryStr += `
        WHERE 1=1
      `;
    }

    if (select_date !== "ALL") {
      queryStr += `
        AND sr.select_date = $${queryParams.length + 1}
      `;
      queryParams.push(select_date);
    }

    if (department !== "ALL") {
      queryStr += `
        AND sr.department = $${queryParams.length + 1}
      `;
      queryParams.push(department);
    }

    if (process !== "ALL") {
      queryStr += `
        AND sr.process = $${queryParams.length + 1}
      `;
      queryParams.push(process);
    }

    queryStr += `
      GROUP BY
        categories.title;
    `;

    const result = await pool.query(queryStr, queryParams);

    // เปลี่ยนค่า result เป็น 0 หากไม่มีค่าตรงกับ Repair, Roving, Other, และ Work in Line
    const finalResult = result.rows.map((row) => {
      if (
        row.title !== "Half Day" &&
        row.title !== "Half Day With OT" &&
        row.title !== "Full Day" &&
        row.title !== "Full Day With OT" &&
        row.title !== "Only OT 3Hr"
      ) {
        return { title: row.title, result: 0 };
      }
      return row;
    });

    // Send the JSON response back to the client
    res.json(finalResult);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/result_totalLeave", async (req, res) => {
  try {
    const { select_date, department, process } = req.query;

    let queryParams = [];
    let queryStr = `
      SELECT
        categories.title,
        COALESCE(SUM(CASE WHEN sr.con_wk = categories.title THEN 1 ELSE 0 END), 0) AS result
      FROM
        (
          SELECT 'Leave' AS title
          UNION ALL
          SELECT 'Leave 2Hr'
          UNION ALL
          SELECT 'Leave 4Hr'
        ) AS categories
      LEFT JOIN
        smart.smart_man_working_status AS sr
        ON categories.title = sr.con_wk
    `;

    if (select_date !== "ALL" || department !== "ALL" || process !== "ALL") {
      queryStr += `
        WHERE 1=1
      `;
    }

    if (select_date !== "ALL") {
      queryStr += `
        AND sr.select_date = $${queryParams.length + 1}
      `;
      queryParams.push(select_date);
    }

    if (department !== "ALL") {
      queryStr += `
        AND sr.department = $${queryParams.length + 1}
      `;
      queryParams.push(department);
    }

    if (process !== "ALL") {
      queryStr += `
        AND sr.process = $${queryParams.length + 1}
      `;
      queryParams.push(process);
    }

    queryStr += `
      GROUP BY
        categories.title;
    `;

    const result = await pool.query(queryStr, queryParams);
    const finalResult = result.rows.map((row) => {
      if (
        row.title !== "Leave" &&
        row.title !== "Leave 2Hr" &&
        row.title !== "Leave 4Hr"
      ) {
        return { title: row.title, result: 0 };
      }
      return row;
    });

    // Send the JSON response back to the client
    res.json(finalResult);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table_data", async (req, res) => {
  try {
    const { select_date, department, con_wk, process } = req.query; // Use req.query to access query parameters

    let queryStr = `
      SELECT 
        id_code AS id,
        "name",
        surname,
        cost_center,
        ds_ns,
        con_wk,
        department,
        date_time,
        car_infor,
        stop_car,
        select_date,
        wk_hr,
        cc,
        process
      FROM
        smart.smart_man_working_status srt`;

    let queryParams = [];

    if (select_date !== "ALL") {
      queryStr += `
      WHERE select_date = $${queryParams.length + 1}`;
      queryParams.push(select_date);
    }

    if (department !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
        AND department = $${queryParams.length + 1}`;
      } else {
        queryStr += `
        WHERE department = $${queryParams.length + 1}`;
      }
      queryParams.push(department);
    }

    if (process !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
        AND process = $${queryParams.length + 1}`;
      } else {
        queryStr += `
        WHERE process = $${queryParams.length + 1}`;
      }
      queryParams.push(process);
    }

    if (
      con_wk !== "ALL" &&
      con_wk !== "Working" &&
      con_wk !== "Indirect" &&
      con_wk !== "Support" &&
      con_wk !== "Leave"
    ) {
      if (queryParams.length > 0) {
        queryStr += `
        AND con_wk IN ($${queryParams.length + 1})`;
      } else {
        queryStr += `
        WHERE con_wk IN ($${queryParams.length + 1})`;
      }
      queryParams.push(con_wk);
    } else if (con_wk === "Working") {
      if (queryParams.length > 0) {
        queryStr += `
        AND con_wk IN  ('Normal Working','OT','Work on Holiday')`;
      } else {
        queryStr += `
        WHERE con_wk IN ('Normal Working','OT','Work on Holiday')`;
      }
    } else if (con_wk === "Indirect") {
      if (queryParams.length > 0) {
        queryStr += `
        AND con_wk IN  ('Work Holiday','Roving','Work Indirect','OT Indirect')`;
      } else {
        queryStr += `
        WHERE con_wk IN ('Work Holiday','Roving','Work Indirect','OT Indirect')`;
      }
    } else if (con_wk === "Support") {
      if (queryParams.length > 0) {
        queryStr += `
        AND con_wk IN  ('Half Day','Half Day With OT','Full Day','Full Day With OT','Only OT 3Hr')`;
      } else {
        queryStr += `
        WHERE con_wk IN ('Half Day','Half Day With OT','Full Day','Full Day With OT','Only OT 3Hr')`;
      }
    } else if (con_wk === "Leave") {
      if (queryParams.length > 0) {
        queryStr += `
        AND con_wk IN  ('Leave','Leave 2Hr','Leave 4Hr')`;
      } else {
        queryStr += `
        WHERE con_wk IN ('Leave','Leave 2Hr','Leave 4Hr')`;
      }
    }

    console.log(queryParams);
    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table_Bus", async (req, res) => {
  try {
    const result = await pool.query(
      `
SELECT
    ROW_NUMBER() OVER () AS id,
    select_date,
    car_infor ,
    stop_car , 
    COUNT(DISTINCT "id_code") as count_bus,
    SUM(CASE
           WHEN con_wk IN ('OT', 'OT Indirect', 'Half Day With OT', 'Full Day With OT', 'Only OT 3Hr')
           THEN 1 ELSE 0
        END) AS OT_count,
    SUM(CASE
           WHEN con_wk IN ('Normal Working', 'Work Indirect', 'Half Day', 'Full Day', 'Roving')
           THEN 1 ELSE 0
        END) AS Normal_Working_count,
    SUM(CASE WHEN con_wk IN ('Work on Holiday','Work Holiday') THEN 1 ELSE 0 END) AS Work_on_Holiday_count
FROM
    smart.smart_man_working_status
GROUP BY
    select_date,
    car_infor ,
    stop_car 
ORDER BY
    select_date DESC,
    count_bus DESC
LIMIT 1000;
      `
    );

    // Send the JSON response back to the client with a 200 OK status code
    res.status(200).json(result.rows);
    console.log("table BUS");
  } catch (error) {
    console.error("Error executing query:", error);

    // Send a 500 Internal Server Error status code and the specific error message in the response
    res.status(500).json({ error: error.message }); // Use error.message to get the specific error message
  }
});

// router.get("/Chart", async (req, res) => {
//   try {
//     const { department, process } = req.query;

//     let sql = `
//       SELECT
//         select_date,
//         con_wk,
//         COUNT(id_code) AS man_count,
//         SUM(wk_hr) AS man_hour
//       FROM
//         smart.smart_man_working_status
//       WHERE
//         con_wk NOT IN ('Leave', 'Leave 2Hr', 'Leave 4Hr', 'Other', 'Repair')
//     `;

//     if (department === "ALL" && process === "ALL") {
//       sql += `
//     GROUP BY
//       select_date,
//       con_wk
//   `;
//     } else if (department !== "ALL" && process === "ALL") {
//       sql += `
//     AND department = '${department}'
//     GROUP BY
//       select_date,
//       con_wk,
//       department
//   `;
//     } else if (department === "ALL" && process !== "ALL") {
//       sql += `
//     AND process = '${process}'
//     GROUP BY
//       select_date,
//       con_wk,
//       process
//   `;
//     } else if (department !== "ALL" && process !== "ALL") {
//       sql += `
//     AND department = '${department}'
//     AND process = '${process}'
//     GROUP BY
//       select_date,
//       con_wk,
//       department,
//       process
//   `;
//     }

//     sql += `
//   ORDER BY
//     select_date ASC;

// `;

//     const result = await pool.query(sql);

//     console.log("Chart_Man");
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

router.get("/Chart", async (req, res) => {
  try {
    const { department, process } = req.query;

    let sql = `
      select
	select_date,
	con_wk,
	COUNT(id_code) as man_count,
	SUM(wk_hr) as man_hour
from
	smart.smart_man_working_status
where
	con_wk not in ('Leave', 'Leave 2Hr', 'Leave 4Hr', 'Other', 'Repair')
	and
    select_date >= TO_CHAR(CURRENT_DATE - interval '15 days',
	'YYYYMMDD') || '_DS'
	and select_date <= TO_CHAR(CURRENT_DATE,
	'YYYYMMDD') || '_DS'
    `;

    if (department === "ALL" && process === "ALL") {
      sql += `
    GROUP BY
      select_date,
      con_wk
  `;
    } else if (department !== "ALL" && process === "ALL") {
      sql += `
    AND department = '${department}'
    GROUP BY
      select_date,
      con_wk,
      department
  `;
    } else if (department === "ALL" && process !== "ALL") {
      sql += `
    AND process = '${process}'
    GROUP BY
      select_date,
      con_wk,
      process
  `;
    } else if (department !== "ALL" && process !== "ALL") {
      sql += `
    AND department = '${department}'
    AND process = '${process}'
    GROUP BY
      select_date,
      con_wk,
      department,
      process
  `;
    }

    sql += `
  ORDER BY
    select_date ASC;

`;

    const result = await pool.query(sql);

    console.log("Chart_Man");
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
