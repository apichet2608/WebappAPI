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

router.get("/get_std_time", async (req, res) => {
  try {
    const { pds_mc } = req.query;

    let queryStr = `
      SELECT
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
        t.process_end,
        t.pds_mc,
        CASE
          WHEN t.adj_ot IS NOT NULL OR t.adj_mc_clean IS NOT NULL OR t.adj_mc_problem IS NOT NULL OR t.adj_oths IS NOT NULL THEN
            h.scan_in
            + t.std_las_to_rpds_min * INTERVAL '1 minute'
            + t.adj_ot * INTERVAL '1 minute'
            + t.adj_mc_clean * INTERVAL '1 minute'
            + t.adj_mc_problem * INTERVAL '1 minute'
            + t.adj_oths * INTERVAL '1 minute'
        END AS pln_las_to_rpds,
        CASE
          WHEN t.adj_ot IS NOT NULL OR t.adj_mc_clean IS NOT NULL OR t.adj_mc_problem IS NOT NULL OR t.adj_oths IS NOT NULL THEN
            h.scan_in
            + t.std_las_to_rpds_min * INTERVAL '1 minute'
            + t.adj_ot * INTERVAL '1 minute'
            + t.adj_mc_clean * INTERVAL '1 minute'
            + t.adj_mc_problem * INTERVAL '1 minute'
            + t.adj_oths * INTERVAL '1 minute'
            + m.std_tim_min * INTERVAL '1 minute'
        END AS est_rpds_fin,
        t.std_las_to_rpds_min,
        t.adj_ot,
        t.adj_mc_clean,
        t.adj_mc_problem,
        t.adj_oths,
        t.las_stop,
        t.pds_stop
      FROM
        smart.smart_product_lot_wip_pth_plan t
      INNER JOIN
        smart.smart_product_lot_wip_holdingtime h
      ON
        t.lot = h.lot::VARCHAR
      LEFT JOIN
        smart.smart_product_lot_wip_pth_pln_stdmaster m
      ON
        h.product_name = m.product_name
      AND
        t.process_end = m.process_pos
      WHERE
        t.pds_stop IS NULL
    `;

    const conditions = [];
    const params = [];

    if (pds_mc && pds_mc !== "") {
      conditions.push(`AND t.pds_mc = $${params.length + 1}`);
      params.push(pds_mc);
    }

    if (conditions.length > 0) {
      queryStr += ` ${conditions.join(" ")}`;
    }

    // Move the ORDER BY clause here
    queryStr += ` ORDER BY pln_las_to_rpds DESC`;

    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//* Get all from master
router.get("/get_master", async (req, res) => {
  try {
    const { product_name, process_pos } = req.query;

    let queryStr = `
      SELECT * FROM smart.smart_product_lot_wip_pth_pln_stdmaster
      WHERE 1 = 1
    `;

    const conditions = [];
    const params = [];

    if (product_name && product_name !== "") {
      conditions.push(`product_name = $${params.length + 1}`);
      params.push(product_name);
    }

    if (process_pos && process_pos !== "") {
      conditions.push(`process_pos LIKE $${params.length + 1}`);
      params.push(`%${process_pos}%`);
    }

    if (conditions.length > 0) {
      queryStr += ` AND ${conditions.join(" AND ")}`;
    }

    // Add the ORDER BY clause at the end
    queryStr += ` ORDER BY id DESC`;

    const result = await query(queryStr, params); // pass query parameters if needed
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//* +Plan Dialog
router.get("/get_lot", async (req, res) => {
  try {
    const { product_name, proc_grp_name } = req.query;

    let queryStr = `
      SELECT *
      FROM smart.smart_product_lot_wip_holdingtime
      WHERE 1 = 1`;

    const conditions = [];
    const params = [];

    if (product_name && product_name !== "") {
      conditions.push(`product_name = $${params.length + 1}`);
      params.push(product_name);
    }

    if (proc_grp_name && proc_grp_name !== "") {
      const procGrpConditions = proc_grp_name
        .split(",")
        .map((_, index) => `$${params.length + index + 1}`);

      conditions.push(`proc_grp_name IN (${procGrpConditions.join(", ")})`);
      params.push(...proc_grp_name.split(","));
    }

    if (conditions.length > 0) {
      queryStr += ` AND ${conditions.join(" AND ")}`;
    }

    // Add the ORDER BY clause at the end
    queryStr += ` ORDER BY id DESC`;

    const result = await query(queryStr, params); // pass query parameters if needed
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//* Get all from machine master
router.get("/get_mc_master", async (req, res) => {
  try {
    const { process } = req.query;

    let queryStr = `
      SELECT * FROM smart.smart_product_lot_wip_pth_mcmaster
      WHERE 1 = 1
    `;
    const conditions = [];
    const params = [];

    if (process && process !== "") {
      conditions.push(`process = $${params.length + 1}`);
      params.push(process);
    }

    if (conditions.length > 0) {
      queryStr += ` AND ${conditions.join(" AND ")}`;
    }

    // Add the ORDER BY clause at the end
    queryStr += ` ORDER BY id DESC`;

    const result = await query(queryStr, params); // pass query parameters if needed
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//! Post

router.post("/post_add_plan", async (req, res) => {
  try {
    const rowsData = req.body; // Assuming req.body is an array of objects
    console.log(rowsData);
    // Construct the SQL query with multiple insert statements
    let sqlQuery = `
    INSERT INTO smart.smart_product_lot_wip_pth_plan(
      create_at,
      product_name,
      lot,
      process_start,
      las_mc,
      process_end,
      pds_mc,
      std_las_to_rpds_min,
      adj_ot,
      adj_mc_clean,
      adj_mc_problem,
      adj_oths,
      las_stop,
      pds_stop
    )
    VALUES ${rowsData
      .map(
        (row, index) =>
          `(
            $${index * 14 + 1}, $${index * 14 + 2}, $${index * 14 + 3},
            $${index * 14 + 4}, $${index * 14 + 5}, $${index * 14 + 6},
            $${index * 14 + 7}, $${index * 14 + 8}, $${index * 14 + 9},
            $${index * 14 + 10}, $${index * 14 + 11}, $${index * 14 + 12},
            $${index * 14 + 13}, $${index * 14 + 14}
          )`
      )
      .join(",")}
  `;

    // Flatten the values array and create the query parameters array
    const queryParams = rowsData.flatMap((row) => [
      row.create_at,
      row.product_name,
      row.lot,
      row.process_start,
      row.las_mc,
      row.process_end,
      row.pds_mc,
      row.std_las_to_rpds_min,
      row.adj_ot,
      row.adj_mc_clean,
      row.adj_mc_problem,
      row.adj_oths,
      row.las_stop,
      row.pds_stop,
    ]);

    // Execute the database query
    const result = await pool.query(sqlQuery, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});
// router.post("/post_add_plan", async (req, res) => {
//   try {
//     const rowsData = req.body; // Assuming req.body is an array of objects
//     console.log(rowsData);
//     // Construct the SQL query with multiple insert statements
//     let sqlQuery = `
//       INSERT INTO smart.smart_product_lot_wip_pth_plan(
//         product_name,
//         lot,
//         process_start,
//         las_mc,
//         process_end,
//         pds_mc,
//         std_las_to_rpds_min,
//         adj_ot,
//         adj_mc_clean,
//         adj_mc_problem,
//         adj_oths,
//         las_stop,
//         pds_stop
//       )
//       VALUES ${rowsData
//         .map(
//           (row, index) =>
//             `($${index * 13 + 1}, $${index * 13 + 2}, $${index * 13 + 3}, $${
//               index * 13 + 4
//             }, $${index * 13 + 5}, $${index * 13 + 6}, $${index * 13 + 7}, $${
//               index * 13 + 8
//             }, $${index * 13 + 9}, $${index * 13 + 10}, $${index * 13 + 11}, $${
//               index * 13 + 12
//             }, $${index * 13 + 13})`
//         )
//         .join(",")}
//     `;

//     // Flatten the values array and create the query parameters array
//     const queryParams = rowsData.flatMap((row) => [
//       row.product_name,
//       row.lot,
//       row.process_start,
//       row.las_mc,
//       row.process_end,
//       row.pds_mc,
//       row.std_las_to_rpds_min,
//       row.adj_ot,
//       row.adj_mc_clean,
//       row.adj_mc_problem,
//       row.adj_oths,
//       row.las_stop,
//       row.pds_stop,
//     ]);

//     // Execute the database query
//     const result = await pool.query(sqlQuery, queryParams);

//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.sendStatus(500);
//   }
// });

module.exports = router;
