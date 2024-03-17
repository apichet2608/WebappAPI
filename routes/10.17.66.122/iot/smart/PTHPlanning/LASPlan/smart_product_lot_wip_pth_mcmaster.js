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

//! Get
router.get("/get_mc_grp", async (req, res) => {
  try {
    const { mc_grp } = req.query;

    let queryStr = `
        select
        process,
        machine,
        mc_grp
    from
        smart.smart_product_lot_wip_pth_mcmaster
        where 1=1
        `;

    const condition = [];
    const params = [];

    if (mc_grp && mc_grp !== "") {
      condition.push(`mc_grp = $${condition.length + 1}`);
      params.push(mc_grp);
    }

    if (condition.length > 0) {
      queryStr += ` AND ${condition.join(" AND ")}`;
    }

    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
