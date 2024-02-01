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

const query = (text, params) => pool.query(text, params);

router.get("/pm_master", async (req, res) => {
  try {
    const { mc_code } = req.query;

    let queryString = `
        SELECT
          *
        FROM
          smart.smart_pte_pm_header_master
    `;

    const queryParams = [];

    if (mc_code && mc_code !== "ALL") {
      queryString += ` WHERE mc_code = $1`;
      queryParams.push(mc_code);
    }

    queryString += ` ORDER BY id ASC`;

    const result = await query(queryString, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
