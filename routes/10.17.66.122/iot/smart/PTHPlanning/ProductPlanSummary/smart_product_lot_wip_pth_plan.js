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
router.get("/get_prd_count", async (req, res) => {
  try {
    const { product_name, proc_disp } = req.query;

    let queryText = `SELECT
    ROW_NUMBER() OVER () AS id,
        DATE_TRUNC('day', p.create_at - INTERVAL '8 hours') AS day_group,
        p.product_name,
        h.proc_disp,
        COUNT(CASE WHEN p.pds_stop IS NULL THEN p.product_name END) AS pln_prd_count,
        COUNT(CASE WHEN p.pds_stop IS NOT NULL THEN p.product_name END) AS fin_prd_count
    FROM
        smart.smart_product_lot_wip_pth_plan p
    INNER JOIN
    smart.smart_product_lot_wip_holdingtime h ON p.lot = h.lot
          WHERE 1 = 1`;

    const conditon = [];
    const values = [];

    if (product_name && product_name !== "") {
      conditon.push(`p.product_name = $${conditon.length + 1}`);
      values.push(product_name);
    }

    if (proc_disp && proc_disp !== "") {
      conditon.push(`h.proc_disp = $${conditon.length + 1}`);
      values.push(proc_disp);
    }

    if (conditon.length > 0) {
      queryText = `${queryText} AND ${conditon.join(" AND ")}`;
    }

    queryText += `
          GROUP BY
            day_group, p.product_name, h.proc_disp
          ORDER BY
          day_group desc, pln_prd_count desc;`;

    const result = await query(queryText, values);
    res.status(200).send(result.rows);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error occurred while fetching data from database" });
  }
});

module.exports = router;
