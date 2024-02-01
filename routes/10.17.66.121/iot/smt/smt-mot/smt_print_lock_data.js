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

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "postgres",
//   database: "postgres",
// });

const query = (text, params) => pool.query(text, params);

router.get("/distinct_line", async (req, res) => {
  try {
    const result = await pool.query(
      `
select distinct line , machine
from smt.smt_print_lock_data spld
order by line desc
        `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_machine", async (req, res) => {
  try {
    const result = await pool.query(
      `
select distinct machine  
from smt.smt_print_lock_data; 
        `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Chart", async (req, res) => {
  try {
    let { select_line, hour } = req.query;
    select_line = select_line || "ALL"; // ใช้ค่าเริ่มต้นเป็น "ALL" ถ้าไม่ระบุ

    let queryStr = `
     SELECT
        id,
        "line" AS line,
        create_at,
        temp_pv,
        humid_pv
      FROM
        smt.smt_print_lock_data spld
      WHERE create_at >= NOW() - interval '${hour} hours'
`;

    const queryParams = [];
    if (select_line !== "ALL") {
      queryStr += ` AND "line" = $1`;
      queryParams.push(select_line);
    }

    queryStr += `
      ORDER BY
        create_at ASC;
    `;

    const result = await pool.query(queryStr, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
