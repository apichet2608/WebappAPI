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
//* Get diff time for "las_stop, las2_stop, pds_start, pds_stop"
//*Chart
router.get("/get_diff_time_chart", async (req, res) => {
  try {
    const { start_date, end_date, product_name } = req.query;

    let queryText = `
      WITH PlanData AS (
        WITH cte AS (
          SELECT
            t.create_at,
            t.id,
            h.product_name,
            t.lot,
            h.proc_grp_name,
            h.proc_disp,
            h.lot_status,
            h.scan_desc,
            h.scan_in,
            h.holding_time_mins,
            t.process_start,
            t.las_mc,
            t.process2_start,
            t.las2_mc,
            t.process_end,
            t.pds_mc,
            CASE
              WHEN t.adj_ot IS NOT NULL
                  OR t.adj_mc_clean IS NOT NULL
                  OR t.adj_mc_problem IS NOT NULL
                  OR t.adj_oths IS NOT NULL THEN
                  t.pds_start
                  + m.std_tim_min * interval '1 minute'
            END AS est_rpds_stop,
            t.std_las_to_rpds_min,
            t.adj_ot,
            t.adj_mc_clean,
            t.adj_mc_problem,
            t.adj_oths,
            t.las_start,
            t.las2_start,
            t.las_stop,
            t.las2_stop,
            t.pds_start,
            t.pds_stop,
            t.package_id,
            CASE
            WHEN t.las_start IS NOT NULL THEN
                t.las_start + COALESCE(
                    (SELECT MAX(m.std_tim_min) 
                    FROM smart.smart_product_lot_wip_pth_plan t2
                    INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t2.lot = h.lot
                    INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name 
                        AND t2.process_start = m.process_pos
                    WHERE t2.lot = t.lot), 0) * INTERVAL '1 minute'
            END AS est_las_stop,
            CASE
                WHEN t.las2_start IS NOT NULL THEN
                    t.las2_start + COALESCE(
                        (SELECT MAX(m.std_tim_min) 
                        FROM smart.smart_product_lot_wip_pth_plan t3
                        INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t3.lot = h.lot
                        INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name 
                            AND t3.process2_start = m.process_pos
                        WHERE t3.lot = t.lot), 0) * INTERVAL '1 minute'
            END AS est_las2_stop
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
            AND t.process_end = m.process_pos
          WHERE
            t.pds_stop IS not NULL
        )
        SELECT
          sq.create_at,
          sq.id,
          sq.product_name,
          sq.lot,
          sq.proc_grp_name,
          sq.proc_disp,
          sq.lot_status,
          sq.scan_desc,
          sq.scan_in,
          round(sq.holding_time_mins) as holding_time_mins,
          sq.process_start,
          sq.las_mc,
          sq.las_start,
          sq.est_las_stop, --Est las stop
          sq.las_stop,
          sq.process2_start,
          sq.las2_mc,
          sq.las2_start,
          sq.est_las2_stop, --Est las 2 stop
          sq.las2_stop,
          sq.process_end,
          sq.pds_mc,
          CASE
            WHEN sq.adj_ot IS NOT NULL
                OR sq.adj_mc_clean IS NOT NULL
                OR sq.adj_mc_problem IS NOT NULL
                OR sq.adj_oths IS NOT NULL THEN
                sq.las_start
                + COALESCE((SELECT MAX(m.std_tim_min) FROM smart.smart_product_lot_wip_pth_plan t
                            INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t.lot = h.lot
                            INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name
                                AND t.process_start = m.process_pos
                            WHERE t.lot = sq.lot), 0) * interval '1 minute'
                + COALESCE((SELECT MAX(m.std_las_to_rpds_min) FROM smart.smart_product_lot_wip_pth_plan t
                            INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t.lot = h.lot
                            INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name
                                AND t.process_start = m.process_pos
                            WHERE t.lot = sq.lot), 0) * interval '1 minute'
                + COALESCE((SELECT MAX(m.std_tim_min) FROM smart.smart_product_lot_wip_pth_plan t
                            INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t.lot = h.lot
                            INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name
                                AND t.process2_start = m.process_pos
                            WHERE t.lot = sq.lot), 0) * interval '1 minute'
                + COALESCE(sq.adj_ot * interval '1 minute', interval '0 minute')
                + COALESCE(sq.adj_mc_clean * interval '1 minute', interval '0 minute')
                + COALESCE(sq.adj_mc_problem * interval '1 minute', interval '0 minute')
                + COALESCE(sq.adj_oths * interval '1 minute', interval '0 minute')
          END AS est_rpds_start,
          sq.pds_start,
          sq.est_rpds_stop,
          sq.pds_stop,
          sq.std_las_to_rpds_min,
          sq.adj_ot,
          sq.adj_mc_clean,
          sq.adj_mc_problem,
          sq.adj_oths,
          sq.package_id
        FROM
          cte sq
      )
      SELECT
          ROUND(EXTRACT(EPOCH FROM (est_las_stop - las_stop)) / 60.0) AS diff_las_stop_min,
          ROUND(EXTRACT(EPOCH FROM (est_las2_stop - las2_stop)) / 60.0) AS diff_las2_stop_min,
          ROUND(EXTRACT(EPOCH FROM (est_rpds_start - pds_start)) / 60.0) AS diff_pds_start_min,
          ROUND(EXTRACT(EPOCH FROM (est_rpds_stop - pds_stop)) / 60.0) AS diff_pds_stop_min,
          *
      FROM
        PlanData`;

    const values = [];

    if ((start_date && start_date !== "") || (end_date && end_date !== "")) {
      queryText += ` WHERE DATE(create_at) BETWEEN $1 AND $2`;
      values.push(start_date, end_date);
    }

    if (product_name && product_name !== "") {
      queryText += `${
        start_date || end_date ? " AND" : " WHERE"
      } product_name = $${values.length + 1}`;
      values.push(product_name);
    }

    queryText += ` ORDER BY create_at ASC`;

    const result = await pool.query(queryText, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res
      .status(500)
      .json({ error: "An error occurred while executing the query" });
  }
});

//*Table
router.get("/get_diff_time_table", async (req, res) => {
  try {
    const { start_date, end_date, product_name } = req.query;

    let queryText = `
      WITH PlanData AS (
        WITH cte AS (
          SELECT
            t.create_at,
            t.id,
            h.product_name,
            t.lot,
            h.proc_grp_name,
            h.proc_disp,
            h.lot_status,
            h.scan_desc,
            h.scan_in,
            h.holding_time_mins,
            t.process_start,
            t.las_mc,
            t.process2_start,
            t.las2_mc,
            t.process_end,
            t.pds_mc,
            CASE
              WHEN t.adj_ot IS NOT NULL
                  OR t.adj_mc_clean IS NOT NULL
                  OR t.adj_mc_problem IS NOT NULL
                  OR t.adj_oths IS NOT NULL THEN
                  t.pds_start
                  + m.std_tim_min * interval '1 minute'
            END AS est_rpds_stop,
            t.std_las_to_rpds_min,
            t.adj_ot,
            t.adj_mc_clean,
            t.adj_mc_problem,
            t.adj_oths,
            t.las_start,
            t.las2_start,
            t.las_stop,
            t.las2_stop,
            t.pds_start,
            t.pds_stop,
            t.package_id,
            CASE
            WHEN t.las_start IS NOT NULL THEN
                t.las_start + COALESCE(
                    (SELECT MAX(m.std_tim_min) 
                    FROM smart.smart_product_lot_wip_pth_plan t2
                    INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t2.lot = h.lot
                    INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name 
                        AND t2.process_start = m.process_pos
                    WHERE t2.lot = t.lot), 0) * INTERVAL '1 minute'
            END AS est_las_stop,
            CASE
                WHEN t.las2_start IS NOT NULL THEN
                    t.las2_start + COALESCE(
                        (SELECT MAX(m.std_tim_min) 
                        FROM smart.smart_product_lot_wip_pth_plan t3
                        INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t3.lot = h.lot
                        INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name 
                            AND t3.process2_start = m.process_pos
                        WHERE t3.lot = t.lot), 0) * INTERVAL '1 minute'
            END AS est_las2_stop
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
            AND t.process_end = m.process_pos
          WHERE
            t.pds_stop IS not NULL
        )
        SELECT
          sq.create_at,
          sq.id,
          sq.product_name,
          sq.lot,
          sq.proc_grp_name,
          sq.proc_disp,
          sq.lot_status,
          sq.scan_desc,
          sq.scan_in,
          round(sq.holding_time_mins) as holding_time_mins,
          sq.process_start,
          sq.las_mc,
          sq.las_start,
          sq.est_las_stop, --Est las stop
          sq.las_stop,
          sq.process2_start,
          sq.las2_mc,
          sq.las2_start,
          sq.est_las2_stop, --Est las 2 stop
          sq.las2_stop,
          sq.process_end,
          sq.pds_mc,
          CASE
            WHEN sq.adj_ot IS NOT NULL
                OR sq.adj_mc_clean IS NOT NULL
                OR sq.adj_mc_problem IS NOT NULL
                OR sq.adj_oths IS NOT NULL THEN
                sq.las_start
                + COALESCE((SELECT MAX(m.std_tim_min) FROM smart.smart_product_lot_wip_pth_plan t
                            INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t.lot = h.lot
                            INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name
                                AND t.process_start = m.process_pos
                            WHERE t.lot = sq.lot), 0) * interval '1 minute'
                + COALESCE((SELECT MAX(m.std_las_to_rpds_min) FROM smart.smart_product_lot_wip_pth_plan t
                            INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t.lot = h.lot
                            INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name
                                AND t.process_start = m.process_pos
                            WHERE t.lot = sq.lot), 0) * interval '1 minute'
                + COALESCE((SELECT MAX(m.std_tim_min) FROM smart.smart_product_lot_wip_pth_plan t
                            INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t.lot = h.lot
                            INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name
                                AND t.process2_start = m.process_pos
                            WHERE t.lot = sq.lot), 0) * interval '1 minute'
                + COALESCE(sq.adj_ot * interval '1 minute', interval '0 minute')
                + COALESCE(sq.adj_mc_clean * interval '1 minute', interval '0 minute')
                + COALESCE(sq.adj_mc_problem * interval '1 minute', interval '0 minute')
                + COALESCE(sq.adj_oths * interval '1 minute', interval '0 minute')
          END AS est_rpds_start,
          sq.pds_start,
          sq.est_rpds_stop,
          sq.pds_stop,
          sq.std_las_to_rpds_min,
          sq.adj_ot,
          sq.adj_mc_clean,
          sq.adj_mc_problem,
          sq.adj_oths,
          sq.package_id
        FROM
          cte sq
      )
      SELECT
          ROUND(EXTRACT(EPOCH FROM (est_las_stop - las_stop)) / 60.0) AS diff_las_stop_min,
          ROUND(EXTRACT(EPOCH FROM (est_las2_stop - las2_stop)) / 60.0) AS diff_las2_stop_min,
          ROUND(EXTRACT(EPOCH FROM (est_rpds_start - pds_start)) / 60.0) AS diff_pds_start_min,
          ROUND(EXTRACT(EPOCH FROM (est_rpds_stop - pds_stop)) / 60.0) AS diff_pds_stop_min,
          *
      FROM
        PlanData`;

    const values = [];

    if ((start_date && start_date !== "") || (end_date && end_date !== "")) {
      queryText += ` WHERE DATE(create_at) BETWEEN $1 AND $2`;
      values.push(start_date, end_date);
    }

    if (product_name && product_name !== "") {
      queryText += `${
        start_date || end_date ? " AND" : " WHERE"
      } product_name = $${values.length + 1}`;
      values.push(product_name);
    }

    queryText += ` ORDER BY create_at desc`;

    const result = await pool.query(queryText, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res
      .status(500)
      .json({ error: "An error occurred while executing the query" });
  }
});

// router.get("/get_diff_time", async (req, res) => {
//   try {
//     const { create_at, product_name } = req.query;

//     let queryText = `
//         WITH PlanData AS (
//   WITH cte AS (
//     SELECT
//       t.create_at,
//       t.id,
//       h.product_name,
//       t.lot,
//       h.proc_grp_name,
//       h.proc_disp,
//       h.lot_status,
//       h.scan_desc,
//       h.scan_in,
//       h.holding_time_mins,
//       t.process_start,
//       t.las_mc,
//       t.process2_start,
//       t.las2_mc,
//       t.process_end,
//       t.pds_mc,
//       CASE
//         WHEN t.adj_ot IS NOT NULL
//             OR t.adj_mc_clean IS NOT NULL
//             OR t.adj_mc_problem IS NOT NULL
//             OR t.adj_oths IS NOT NULL THEN
//             t.pds_start
//             + m.std_tim_min * interval '1 minute'
//       END AS est_rpds_stop,
//       t.std_las_to_rpds_min,
//       t.adj_ot,
//       t.adj_mc_clean,
//       t.adj_mc_problem,
//       t.adj_oths,
//       t.las_start,
//       t.las2_start,
//       t.las_stop,
//       t.las2_stop,
//       t.pds_start,
//       t.pds_stop,
//       t.package_id,
//       CASE
//         WHEN t.las_start IS NOT NULL THEN
//             t.las_start + m.std_tim_min * interval '1 minute'
//       END AS est_las_stop,
//       CASE
//         WHEN t.las2_start IS NOT NULL THEN
//             t.las2_start + m.std_tim_min * interval '1 minute'
//       END AS est_las2_stop
//     FROM
//       smart.smart_product_lot_wip_pth_plan t
//     INNER JOIN
//       smart.smart_product_lot_wip_holdingtime h
//     ON
//       t.lot = h.lot
//     INNER JOIN
//       smart.smart_product_lot_wip_pth_pln_stdmaster m
//     ON
//       h.product_name = m.product_name
//       AND t.process_end = m.process_pos
//   )
//   SELECT
//     sq.create_at,
//     sq.id,
//     sq.product_name,
//     sq.lot,
//     sq.proc_grp_name,
//     sq.proc_disp,
//     sq.lot_status,
//     sq.scan_desc,
//     sq.scan_in,
//     round(sq.holding_time_mins) as holding_time_mins,
//     sq.process_start,
//     sq.las_mc,
//     sq.las_start,
//     sq.est_las_stop, --Est las stop
//     sq.las_stop,
//     sq.process2_start,
//     sq.las2_mc,
//     sq.las2_start,
//     sq.est_las2_stop, --Est las 2 stop
//     sq.las2_stop,
//     sq.process_end,
//     sq.pds_mc,
//     CASE
//       WHEN sq.adj_ot IS NOT NULL
//           OR sq.adj_mc_clean IS NOT NULL
//           OR sq.adj_mc_problem IS NOT NULL
//           OR sq.adj_oths IS NOT NULL THEN
//           sq.las_start
//           + COALESCE((SELECT MAX(m.std_tim_min) FROM smart.smart_product_lot_wip_pth_plan t
//                       INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t.lot = h.lot
//                       INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name
//                           AND t.process_start = m.process_pos
//                       WHERE t.lot = sq.lot), 0) * interval '1 minute'
//           + COALESCE((SELECT MAX(m.std_las_to_rpds_min) FROM smart.smart_product_lot_wip_pth_plan t
//                       INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t.lot = h.lot
//                       INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name
//                           AND t.process_start = m.process_pos
//                       WHERE t.lot = sq.lot), 0) * interval '1 minute'
//           + COALESCE((SELECT MAX(m.std_tim_min) FROM smart.smart_product_lot_wip_pth_plan t
//                       INNER JOIN smart.smart_product_lot_wip_holdingtime h ON t.lot = h.lot
//                       INNER JOIN smart.smart_product_lot_wip_pth_pln_stdmaster m ON h.product_name = m.product_name
//                           AND t.process2_start = m.process_pos
//                       WHERE t.lot = sq.lot), 0) * interval '1 minute'
//           + COALESCE(sq.adj_ot * interval '1 minute', interval '0 minute')
//           + COALESCE(sq.adj_mc_clean * interval '1 minute', interval '0 minute')
//           + COALESCE(sq.adj_mc_problem * interval '1 minute', interval '0 minute')
//           + COALESCE(sq.adj_oths * interval '1 minute', interval '0 minute')
//     END AS est_rpds_start,
//     sq.pds_start,
//     sq.est_rpds_stop,
//     sq.std_las_to_rpds_min,
//     sq.adj_ot,
//     sq.adj_mc_clean,
//     sq.adj_mc_problem,
//     sq.adj_oths,
//     sq.package_id
//   FROM
//     cte sq
// )
// SELECT
//     ROUND(EXTRACT(EPOCH FROM (est_las_stop - las_stop)) / 60.0) AS diff_las_stop_min,
//     ROUND(EXTRACT(EPOCH FROM (est_las2_stop - las2_stop)) / 60.0) AS diff_las2_stop_min,
//     ROUND(EXTRACT(EPOCH FROM (est_rpds_start - pds_start)) / 60.0) AS diff_pds_start_min,
//     ROUND(EXTRACT(EPOCH FROM (est_rpds_stop - plandata.las_stop)) / 60.0) AS diff_pds_stop_min,
//     *
// FROM
//   PlanData`;

//     const values = [];

//     if (create_at && create_at !== "") {
//       // Assuming 'create_at' is in ISO format (e.g., '2024-02-20')
//       queryText += ` WHERE DATE(create_at) = $1`;
//       values.push(create_at);
//     }

//     if (product_name && product_name !== "") {
//       queryText += `${create_at ? " AND" : " WHERE"} product_name = $${
//         values.length + 1
//       }`;
//       values.push(product_name);
//     }

//     const result = await pool.query(queryText, values);

//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while executing the query" });
//   }
// });

module.exports = router;
