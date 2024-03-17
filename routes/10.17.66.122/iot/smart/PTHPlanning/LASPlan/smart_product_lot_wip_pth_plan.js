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
router.get("/get_main", async (req, res) => {
  try {
    const { las_mc } = req.query;

    let queryStr = `
        WITH PlanData AS (
          SELECT
            t.id,
            t.create_at,
            h.product_name,
            t.lot,
            h.proc_grp_name,
            h.proc_disp AS current_process,
            h.lot_status,
            h.scan_desc,
            h.scan_in,
            h.holding_time_mins,
            t.process_start,
            t.las_mc,
            t.las2_mc,
            t.process_end,
            t.pds_mc,
            CASE
              WHEN t.adj_ot IS NOT NULL OR t.adj_mc_clean IS NOT NULL OR t.adj_mc_problem IS NOT NULL OR t.adj_oths IS NOT NULL THEN
                t.las_start 
                + t.std_las_to_rpds_min * interval '1 minute'
                + m.std_tim_min * interval '1 minute'
                + t.adj_ot * interval '1 minute'
                + t.adj_mc_clean * interval '1 minute'
                + t.adj_mc_problem * interval '1 minute'
                + t.adj_oths * interval '1 minute'
            END AS pln_las_to_rpds,
            CASE
              WHEN t.adj_ot IS NOT NULL OR t.adj_mc_clean IS NOT NULL OR t.adj_mc_problem IS NOT NULL OR t.adj_oths IS NOT NULL THEN
                t.pds_start
                + m.std_tim_min * interval '1 minute'
            END AS est_rpds_fin,
            t.std_las_to_rpds_min,
            t.adj_ot,
            t.adj_mc_clean,
            t.adj_mc_problem,
            t.adj_oths,
            t.las_start,
            t.las_stop,
            t.las2_start,
            t.las2_stop,
            t.pds_start,
            t.pds_stop,
            t.package_id
          FROM
            smart.smart_product_lot_wip_pth_plan t
          INNER JOIN
            smart.smart_product_lot_wip_holdingtime h
          ON
            t.lot = h.lot
          INNER JOIN
            smart.smart_product_lot_wip_pth_pln_stdmaster m
          ON
            h.product_name = m.product_name
          AND
            t.process_end = m.process_pos
          WHERE
            t.las_stop IS NULL
          ${las_mc ? `AND t.las_mc = $1` : ""}
          ORDER BY las_start ASC, las2_start ASC, create_at ASC
        )
        SELECT
        ROW_NUMBER() OVER () AS row_id,
          PlanData.*,
          CASE
            WHEN LAG(est_rpds_fin) OVER (PARTITION BY product_name ORDER BY process_end) IS NOT NULL THEN
              EXTRACT(EPOCH FROM (pln_las_to_rpds - LAG(est_rpds_fin) OVER (PARTITION BY product_name ORDER BY process_end))) / 60 -- Convert to minutes
          END AS diff_time_rpds,
          EXTRACT(EPOCH FROM (NOW() AT TIME ZONE 'Asia/Bangkok' - las_start AT TIME ZONE 'Asia/Bangkok')) / 60 AS lead_time_laser_to_plasma -- Lead time from Laser to plasma
        FROM
          PlanData
        `;

    const params = [];
    if (las_mc && las_mc !== "") {
      params.push(las_mc);
    }

    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//* Get count product name
router.get("/get_count_product_name", async (req, res) => {
  try {
    const { las_mc, product_name } = req.query;

    let queryStr = `
    SELECT 
        DATE_TRUNC('day', create_at - INTERVAL '8 hours') AS create_at_grouped,
        COUNT(product_name) AS total,
        SUM(CASE WHEN las_stop IS NOT NULL THEN 1 ELSE 0 END) AS finish,
        SUM(CASE WHEN las_stop IS NULL THEN 1 ELSE 0 END) AS wait
    FROM 
        smart.smart_product_lot_wip_pth_plan
    `;

    const conditions = [];
    const params = [];

    if (las_mc && las_mc !== "") {
      conditions.push(`las_mc = $${params.length + 1}`);
      params.push(las_mc);
    }

    if (product_name && product_name !== "") {
      conditions.push(`product_name = $${params.length + 1}`);
      params.push(product_name);
    }

    if (conditions.length > 0) {
      queryStr += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryStr += `
    GROUP BY
        DATE_TRUNC('day', create_at - INTERVAL '8 hours')
    ORDER BY
        create_at_grouped DESC`;

    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
