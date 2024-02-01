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

//!Get
//*Main Table
router.get("/get_main_table", async (req, res) => {
  try {
    const { year, fpc_audit_title, process, scoring } = req.query;

    let queryStr = `SELECT * FROM smart.smart_audit_checklist`;

    const condition = [];
    const queryParam = [];

    if (year && year !== "") {
      condition.push(`year = $${condition.length + 1}`);
      queryParam.push(year);
    }
    if (fpc_audit_title && fpc_audit_title !== "") {
      condition.push(`fpc_audit_title = $${condition.length + 1}`);
      queryParam.push(fpc_audit_title);
    }
    if (process && process !== "") {
      condition.push(`process = $${condition.length + 1}`);
      queryParam.push(process);
    }
    if (scoring && scoring !== "") {
      condition.push(`scoring = $${condition.length + 1}`);
      queryParam.push(scoring);
    }

    if (condition.length > 0) {
      queryStr += ` WHERE ${condition.join(" AND ")}`;
    }
    queryStr += ` ORDER BY fpc_audit_title ASC, no ASC, scoring DESC`;

    const result = await query(queryStr, queryParam);
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

//*Count Scoring Main Card
router.get("/get_count_scoring_main_card", async (req, res) => {
  try {
    const queryStr = `WITH ScoreCounts AS (
        SELECT scoring, imp_etc_req, COUNT(*) as count
        FROM smart.smart_audit_checklist
        WHERE scoring IN ('0', '50', '100', '250', '500')
        GROUP BY scoring, imp_etc_req
    )
    SELECT 
        sc.scoring,
        sc.imp_etc_req,
        sc.count,
        ROUND((sc.count * 100.0 / total.total_count), 2) AS percent
    FROM ScoreCounts sc
    JOIN (
        SELECT COUNT(*) AS total_count
        FROM smart.smart_audit_checklist
        WHERE scoring IN ('0', '50', '100', '250', '500')
    ) total ON 1=1
    ORDER BY sc.scoring ASC;`;

    const result = await query(queryStr);
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//!Insert

//!Update
router.put("/update_main_table/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { link, scoring, comments } = req.body;

    const queryStr = `UPDATE smart.smart_audit_checklist
                        SET link = $1, scoring = $2, comments = $3
                        WHERE id = $4;`;

    const result = await query(queryStr, [link, scoring, comments, id]);
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//!Delete

module.exports = router;
