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
    with PlanData as (
      with cte as (
      select
          t.id,
          h.product_name,
          t.lot,
          h.proc_grp_name,
          h.proc_disp as current_process,
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
          case
              when t.adj_ot is not null
              or t.adj_mc_clean is not null
              or t.adj_mc_problem is not null
              or t.adj_oths is not null then
             t.pds_start
              + m.std_tim_min * interval '1 minute'
          end as est_rpds_fin,
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
          t.package_id
      from
          smart.smart_product_lot_wip_pth_plan t
      inner join
          smart.smart_product_lot_wip_holdingtime h
        on
          t.lot = h.lot
      inner join
          smart.smart_product_lot_wip_pth_pln_stdmaster m
        on
          h.product_name = m.product_name
          and
          t.process_end = m.process_pos
      where
          t.pds_stop is null
      )
      , cte2 as (
          select 
              sq.*,
              (
                  select 
                      max(case
                          when t.adj_ot is not null
                              or t.adj_mc_clean is not null
                              or t.adj_mc_problem is not null
                              or t.adj_oths is not null then
                              m.std_tim_min
                          else 0  -- handle NULL case
                      end) as pln_1
                  from  
                      smart.smart_product_lot_wip_pth_plan t
                  inner join 
                      smart.smart_product_lot_wip_holdingtime h
                      on t.lot = h.lot
                  inner join 
                      smart.smart_product_lot_wip_pth_pln_stdmaster m
                      on h.product_name = m.product_name 
                          and t.process_start = m.process_pos
                  where 
                      t.lot = sq.lot
              ) as std_las1,
              (
                  select 
                      max(case
                          when t.adj_ot is not null
                              or t.adj_mc_clean is not null
                              or t.adj_mc_problem is not null
                              or t.adj_oths is not null then
                              m.std_las_to_rpds_min
                          else 0  -- handle NULL case
                      end) as pln_1
                  from  
                      smart.smart_product_lot_wip_pth_plan t
                  inner join 
                      smart.smart_product_lot_wip_holdingtime h
                      on t.lot = h.lot
                  inner join 
                      smart.smart_product_lot_wip_pth_pln_stdmaster m
                      on h.product_name = m.product_name 
                          and t.process_start = m.process_pos
                  where 
                      t.lot = sq.lot
              ) as std_las1_to_pds,
              (
                  select 
                      max(case
                          when t.adj_ot is not null
                              or t.adj_mc_clean is not null
                              or t.adj_mc_problem is not null
                              or t.adj_oths is not null then
                              m.std_tim_min
                          else 0  -- handle NULL case
                      end) as pln_1
                  from  
                      smart.smart_product_lot_wip_pth_plan t
                  inner join 
                      smart.smart_product_lot_wip_holdingtime h
                      on t.lot = h.lot
                  inner join 
                      smart.smart_product_lot_wip_pth_pln_stdmaster m
                      on h.product_name = m.product_name 
                          and t.process2_start = m.process_pos
                  where 
                      t.lot = sq.lot
              ) as std_las2
          from 
              cte sq
      )
      select 
          sq2.id,
          sq2.product_name,
          sq2.lot,
          sq2.proc_grp_name,
          sq2.current_process,
          sq2.lot_status,
          sq2.scan_desc,
          sq2.scan_in,
          sq2.holding_time_mins,
          sq2.process_start,
          sq2.las_mc,
          sq2.process2_start,
          sq2.las2_mc,
          sq2.process_end,
          sq2.pds_mc,
          case 
              when 
                  sq2.adj_ot is not null
              or sq2.adj_mc_clean is not null
              or sq2.adj_mc_problem is not null
              or sq2.adj_oths is not null then
              sq2.las_start  
              + sq2.std_las1_to_pds * interval '1 minute'
              + sq2.std_las1 * interval '1 minute'
              + coalesce(sq2.std_las2 * interval '1 minute','0')
              + sq2.adj_ot * interval '1 minute'
              + sq2.adj_mc_clean * interval '1 minute'
              + sq2.adj_mc_problem * interval '1 minute'
              + sq2.adj_oths * interval '1 minute'
          end as pln_las_to_rpds,
          sq2.est_rpds_fin,
          sq2.std_las_to_rpds_min,
          sq2.adj_ot,
          sq2.adj_mc_clean,
          sq2.adj_mc_problem,
          sq2.adj_oths,
          sq2.las_start,
          sq2.las2_start,
          sq2.las_stop,
          sq2.las2_stop,
          sq2.pds_start,
          sq2.pds_stop,
          sq2.package_id,
          CASE 
          WHEN sq2.pds_start IS NOT NULL AND sq2.pds_stop IS NOT NULL THEN
                  EXTRACT(EPOCH FROM (sq2.pds_stop - sq2.pds_start)) / 60.0 -- Convert to minutes
          END AS act_pds_tim
      from 
          cte2 sq2
          ${pds_mc ? `where sq2.pds_mc = $1` : ""}
      order by
          pds_start asc, pln_las_to_rpds asc
      ),
      WithTimeDifference as (
        select
            PlanData.*,
            case
                when lag(pln_las_to_rpds) over (order by pds_start desc, pln_las_to_rpds desc) is not null then
                    extract(epoch from (pln_las_to_rpds - lag(pln_las_to_rpds) over (order by pds_start asc, pln_las_to_rpds asc))) / 60
                -- Convert to minutes
            end as diff_act_pds_start
        from
            PlanData
    )
    SELECT
        WithTimeDifference.*,
        CASE
            WHEN (ABS(diff_act_pds_start) < 1 OR diff_act_pds_start IS NULL) THEN
                NULL
            ELSE
                CASE
                    WHEN LAG(est_rpds_fin) OVER (ORDER BY pds_start ASC, pln_las_to_rpds ASC) IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (pln_las_to_rpds - LAG(est_rpds_fin) OVER (ORDER BY pds_start ASC, pln_las_to_rpds ASC))) / 60
                        -- Convert to minutes
                END
        END AS diff_time_rpds,
        EXTRACT(EPOCH FROM (NOW() - las_start)) / 60 AS lead_time_laser_to_plasma
    FROM
        WithTimeDifference  
        order by pds_start asc, pln_las_to_rpds asc
    `;

    const params = [];
    if (pds_mc && pds_mc !== "") {
      params.push(pds_mc);
    }

    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// router.get("/get_std_time", async (req, res) => {
//   try {
//     const { pds_mc } = req.query;

//     let queryStr = `
//     with PlanData as (
//       with cte as (
//       select
//           t.id,
//           h.product_name,
//           t.lot,
//           h.proc_grp_name,
//           h.proc_disp as current_process,
//           h.lot_status,
//           h.scan_desc,
//           h.scan_in,
//           h.holding_time_mins,
//           t.process_start,
//           t.las_mc,
//           t.process2_start,
//           t.las2_mc,
//           t.process_end,
//           t.pds_mc,
//           case
//               when t.adj_ot is not null
//               or t.adj_mc_clean is not null
//               or t.adj_mc_problem is not null
//               or t.adj_oths is not null then
//              t.pds_start
//               + m.std_tim_min * interval '1 minute'
//           end as est_rpds_fin,
//           t.std_las_to_rpds_min,
//           t.adj_ot,
//           t.adj_mc_clean,
//           t.adj_mc_problem,
//           t.adj_oths,
//           t.las_start,
//           t.las2_start,
//           t.las_stop,
//           t.las2_stop,
//           t.pds_start,
//           t.pds_stop,
//           t.package_id
//       from
//           smart.smart_product_lot_wip_pth_plan t
//       inner join
//           smart.smart_product_lot_wip_holdingtime h
//         on
//           t.lot = h.lot
//       inner join
//           smart.smart_product_lot_wip_pth_pln_stdmaster m
//         on
//           h.product_name = m.product_name
//           and
//           t.process_end = m.process_pos
//       where
//           t.pds_stop is null
//       )
//       , cte2 as (
//           select
//               sq.*,
//               (
//                   select
//                       max(case
//                           when t.adj_ot is not null
//                               or t.adj_mc_clean is not null
//                               or t.adj_mc_problem is not null
//                               or t.adj_oths is not null then
//                               m.std_tim_min
//                           else 0  -- handle NULL case
//                       end) as pln_1
//                   from
//                       smart.smart_product_lot_wip_pth_plan t
//                   inner join
//                       smart.smart_product_lot_wip_holdingtime h
//                       on t.lot = h.lot
//                   inner join
//                       smart.smart_product_lot_wip_pth_pln_stdmaster m
//                       on h.product_name = m.product_name
//                           and t.process_start = m.process_pos
//                   where
//                       t.lot = sq.lot
//               ) as std_las1,
//               (
//                   select
//                       max(case
//                           when t.adj_ot is not null
//                               or t.adj_mc_clean is not null
//                               or t.adj_mc_problem is not null
//                               or t.adj_oths is not null then
//                               m.std_las_to_rpds_min
//                           else 0  -- handle NULL case
//                       end) as pln_1
//                   from
//                       smart.smart_product_lot_wip_pth_plan t
//                   inner join
//                       smart.smart_product_lot_wip_holdingtime h
//                       on t.lot = h.lot
//                   inner join
//                       smart.smart_product_lot_wip_pth_pln_stdmaster m
//                       on h.product_name = m.product_name
//                           and t.process_start = m.process_pos
//                   where
//                       t.lot = sq.lot
//               ) as std_las1_to_pds,
//               (
//                   select
//                       max(case
//                           when t.adj_ot is not null
//                               or t.adj_mc_clean is not null
//                               or t.adj_mc_problem is not null
//                               or t.adj_oths is not null then
//                               m.std_tim_min
//                           else 0  -- handle NULL case
//                       end) as pln_1
//                   from
//                       smart.smart_product_lot_wip_pth_plan t
//                   inner join
//                       smart.smart_product_lot_wip_holdingtime h
//                       on t.lot = h.lot
//                   inner join
//                       smart.smart_product_lot_wip_pth_pln_stdmaster m
//                       on h.product_name = m.product_name
//                           and t.process2_start = m.process_pos
//                   where
//                       t.lot = sq.lot
//               ) as std_las2
//           from
//               cte sq
//       )
//       select
//           sq2.id,
//           sq2.product_name,
//           sq2.lot,
//           sq2.proc_grp_name,
//           sq2.current_process,
//           sq2.lot_status,
//           sq2.scan_desc,
//           sq2.scan_in,
//           sq2.holding_time_mins,
//           sq2.process_start,
//           sq2.las_mc,
//           sq2.process2_start,
//           sq2.las2_mc,
//           sq2.process_end,
//           sq2.pds_mc,
//           case
//               when
//                   sq2.adj_ot is not null
//               or sq2.adj_mc_clean is not null
//               or sq2.adj_mc_problem is not null
//               or sq2.adj_oths is not null then
//               sq2.las_start
//               + sq2.std_las1_to_pds * interval '1 minute'
//               + sq2.std_las1 * interval '1 minute'
//               + coalesce(sq2.std_las2 * interval '1 minute','0')
//               + sq2.adj_ot * interval '1 minute'
//               + sq2.adj_mc_clean * interval '1 minute'
//               + sq2.adj_mc_problem * interval '1 minute'
//               + sq2.adj_oths * interval '1 minute'
//           end as pln_las_to_rpds,
//           sq2.est_rpds_fin,
//           sq2.std_las_to_rpds_min,
//           sq2.adj_ot,
//           sq2.adj_mc_clean,
//           sq2.adj_mc_problem,
//           sq2.adj_oths,
//           sq2.las_start,
//           sq2.las2_start,
//           sq2.las_stop,
//           sq2.las2_stop,
//           sq2.pds_start,
//           sq2.pds_stop,
//           sq2.package_id
//       from
//           cte2 sq2
//           ${pds_mc ? `where sq2.pds_mc = $1` : ""}
//       order by
//           pds_start asc, pln_las_to_rpds asc
//       )
//       select
//           row_number() over () as row_id,
//         PlanData.*,
//         case
//           when lag(est_rpds_fin) over (partition by product_name
//         order by
//           process_end) is not null then
//             extract(EPOCH
//         from
//           (pln_las_to_rpds - lag(est_rpds_fin) over (partition by product_name
//         order by
//           process_end))) / 60
//         end as diff_time_rpds,
//         extract(EPOCH
//       from
//         (NOW() - las_start)) / 60 as lead_time_laser_to_plasma
//       from
//         PlanData
//         order by pds_start asc, pln_las_to_rpds asc
//     `;

//     const params = [];
//     if (pds_mc && pds_mc !== "") {
//       params.push(pds_mc);
//     }

//     const result = await pool.query(queryStr, params);
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });

// router.get("/get_std_time", async (req, res) => {
//   try {
//     const { pds_mc } = req.query;

//     let queryStr = `
//       SELECT
//         h.product_name,
//         t.lot,
//         h.proc_grp_name,
//         h.proc_disp AS current_process,
//         h.lot_status,
//         h.scan_desc,
//         h.scan_in,
//         h.holding_time_mins,
//         t.process_start,
//         t.las_mc,
//         t.process_end,
//         t.pds_mc,
//         CASE
//           WHEN t.adj_ot IS NOT NULL OR t.adj_mc_clean IS NOT NULL OR t.adj_mc_problem IS NOT NULL OR t.adj_oths IS NOT NULL THEN
//             h.scan_in
//             + t.std_las_to_rpds_min * INTERVAL '1 minute'
//             + t.adj_ot * INTERVAL '1 minute'
//             + t.adj_mc_clean * INTERVAL '1 minute'
//             + t.adj_mc_problem * INTERVAL '1 minute'
//             + t.adj_oths * INTERVAL '1 minute'
//         END AS pln_las_to_rpds,
//         CASE
//           WHEN t.adj_ot IS NOT NULL OR t.adj_mc_clean IS NOT NULL OR t.adj_mc_problem IS NOT NULL OR t.adj_oths IS NOT NULL THEN
//             h.scan_in
//             + t.std_las_to_rpds_min * INTERVAL '1 minute'
//             + t.adj_ot * INTERVAL '1 minute'
//             + t.adj_mc_clean * INTERVAL '1 minute'
//             + t.adj_mc_problem * INTERVAL '1 minute'
//             + t.adj_oths * INTERVAL '1 minute'
//             + m.std_tim_min * INTERVAL '1 minute'
//         END AS est_rpds_fin,
//         t.std_las_to_rpds_min,
//         t.adj_ot,
//         t.adj_mc_clean,
//         t.adj_mc_problem,
//         t.adj_oths,
//         t.las_stop,
//         t.pds_stop
//       FROM
//         smart.smart_product_lot_wip_pth_plan t
//       INNER JOIN
//         smart.smart_product_lot_wip_holdingtime h
//       ON
//         t.lot = h.lot::VARCHAR
//       LEFT JOIN
//         smart.smart_product_lot_wip_pth_pln_stdmaster m
//       ON
//         h.product_name = m.product_name
//       AND
//         t.process_end = m.process_pos
//       WHERE
//         t.pds_stop IS NULL
//     `;

//     const conditions = [];
//     const params = [];

//     if (pds_mc && pds_mc !== "") {
//       conditions.push(`AND t.pds_mc = $${params.length + 1}`);
//       params.push(pds_mc);
//     }

//     if (conditions.length > 0) {
//       queryStr += ` ${conditions.join(" ")}`;
//     }

//     // Move the ORDER BY clause here
//     queryStr += ` ORDER BY pln_las_to_rpds ASC`;

//     const result = await pool.query(queryStr, params);
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });

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
    const { product_name, proc_grp_name, scan_desc } = req.query;

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
      conditions.push(`proc_grp_name LIKE $${params.length + 1}`);
      params.push(`%${proc_grp_name}%`);
    }

    if (scan_desc && scan_desc !== "") {
      conditions.push(`scan_desc = $${params.length + 1}`);
      params.push(scan_desc);
    }

    if (conditions.length > 0) {
      queryStr += ` AND ${conditions.join(" AND ")}`;
    }

    // Add the ORDER BY clause at the end
    queryStr += ` ORDER BY proc_disp ASC, holding_time_mins DESC, scan_desc ASC`;

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
      conditions.push(`process like $${params.length + 1}`);
      params.push(`%${process}%`);
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

//* Get stdTimMin
router.get("/get_std_tim_min", async (req, res) => {
  try {
    const { product_name, process_pos } = req.query;

    let queryStr = `
      SELECT process_pos, std_tim_min
      FROM smart.smart_product_lot_wip_pth_pln_stdmaster
      WHERE 1=1`;

    const conditions = [];
    const params = [];

    if (product_name && product_name !== "") {
      conditions.push(`product_name = $${params.length + 1}`);
      params.push(product_name);
    }

    if (process_pos && process_pos !== "") {
      conditions.push(`process_pos = $${params.length + 1}`);
      params.push(process_pos);
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

//* Get count product name
router.get("/get_count_product_name", async (req, res) => {
  try {
    const { pds_mc, product_name } = req.query;

    let queryStr = `
    SELECT 
        DATE_TRUNC('day', create_at - INTERVAL '8 hours') AS create_at_grouped,
        COUNT(product_name) AS total,
        SUM(CASE WHEN pds_stop IS NOT NULL THEN 1 ELSE 0 END) AS finish,
        SUM(CASE WHEN pds_stop IS NULL THEN 1 ELSE 0 END) AS wait
    FROM 
        smart.smart_product_lot_wip_pth_plan
    `;

    const conditions = [];
    const params = [];

    if (pds_mc && pds_mc !== "") {
      conditions.push(`pds_mc = $${params.length + 1}`);
      params.push(pds_mc);
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

//* Get all from plan to prevent lot duplicate
router.get("/get_plan", async (req, res) => {
  try {
    const { product_name } = req.query;

    const queryStr = `
      SELECT *
      FROM smart.smart_product_lot_wip_pth_plan
      WHERE product_name = $1
    `;

    const result = await pool.query(queryStr, [product_name]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//* Get count product name related with ProductPlanSummary page
router.get("/get_prd_count", async (req, res) => {
  try {
    const { product_name, proc_disp, create_at } = req.query;

    let queryText = `
      SELECT
          ROW_NUMBER() OVER () AS id,
          DATE_TRUNC('day', p.create_at - INTERVAL '8 hours') AS day_group,
          COUNT(CASE WHEN p.pds_stop IS NULL THEN p.product_name END) AS pln_prd_count,
          COUNT(CASE WHEN p.pds_stop IS NOT NULL THEN p.product_name END) AS fin_prd_count
      FROM
          smart.smart_product_lot_wip_pth_plan p
      INNER JOIN
          smart.smart_product_lot_wip_holdingtime h ON p.lot = h.lot
      WHERE 1 = 1`;

    const conditions = [];
    const values = [];

    if (product_name && product_name !== "") {
      conditions.push(`p.product_name = $${conditions.length + 1}`);
      values.push(product_name);
    }

    if (proc_disp && proc_disp !== "") {
      conditions.push(`h.proc_disp = $${conditions.length + 1}`);
      values.push(proc_disp);
    }

    if (create_at && create_at !== "") {
      conditions.push(
        `DATE_TRUNC('day', p.create_at - INTERVAL '8 hours') = $${
          conditions.length + 1
        }`
      );
      values.push(create_at);
    }

    if (conditions.length > 0) {
      queryText += ` AND ${conditions.join(" AND ")}`;
    }

    queryText += `
    GROUP BY
        DATE_TRUNC('day', p.create_at - INTERVAL '8 hours')
    ORDER BY
        day_group DESC, pln_prd_count DESC`;

    const result = await query(queryText, values);
    res.status(200).send(result.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Error occurred while fetching data from database" });
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
      pds_stop,
      process2_start,
      las2_mc,
      las2_start,
      las2_stop,
      package_id
    )
    VALUES ${rowsData
      .map(
        (row, index) =>
          `(
            $${index * 18 + 1}, $${index * 18 + 2}, $${index * 18 + 3},
            $${index * 18 + 4}, $${index * 18 + 5}, $${index * 18 + 6},
            $${index * 18 + 7}, $${index * 18 + 8}, $${index * 18 + 9},
            $${index * 18 + 10}, $${index * 18 + 11}, $${index * 18 + 12},
            $${index * 18 + 13}, $${index * 18 + 14}, $${index * 18 + 15},
            $${index * 18 + 16}, $${index * 18 + 17}, $${index * 18 + 18},
            $${index * 18 + 19}
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
      row.process2_start, // New column
      row.las2_mc, // New column
      row.las2_start, // New column
      row.las2_stop, // New column
      row.package_id, // Updated package_id field
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
//     INSERT INTO smart.smart_product_lot_wip_pth_plan(
//       create_at,
//       product_name,
//       lot,
//       process_start,
//       las_mc,
//       process_end,
//       pds_mc,
//       std_las_to_rpds_min,
//       adj_ot,
//       adj_mc_clean,
//       adj_mc_problem,
//       adj_oths,
//       las_stop,
//       pds_stop,
//       process2_start,
//       las2_mc,
//       las2_start,
//       las2_stop
//     )
//     VALUES ${rowsData
//       .map(
//         (row, index) =>
//           `(
//             $${index * 18 + 1}, $${index * 18 + 2}, $${index * 18 + 3},
//             $${index * 18 + 4}, $${index * 18 + 5}, $${index * 18 + 6},
//             $${index * 18 + 7}, $${index * 18 + 8}, $${index * 18 + 9},
//             $${index * 18 + 10}, $${index * 18 + 11}, $${index * 18 + 12},
//             $${index * 18 + 13}, $${index * 18 + 14}, $${index * 18 + 15},
//             $${index * 18 + 16}, $${index * 18 + 17}, $${index * 18 + 18}
//           )`
//       )
//       .join(",")}
//   `;

//     // Flatten the values array and create the query parameters array
//     const queryParams = rowsData.flatMap((row) => [
//       row.create_at,
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
//       row.process2_start, // New column
//       row.las2_mc, // New column
//       row.las2_start, // New column
//       row.las2_stop, // New column
//     ]);

//     // Execute the database query
//     const result = await pool.query(sqlQuery, queryParams);

//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.sendStatus(500);
//   }
// });

//! Put
//* Update adj_ot, adj_mc_clean, adj_mc_problem, adj_oths
router.put("/put_update_plan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      las_mc,
      las2_mc,
      pds_mc,
      adj_ot,
      adj_mc_clean,
      adj_mc_problem,
      adj_oths,
    } = req.body;

    const queryStr = `
      UPDATE smart.smart_product_lot_wip_pth_plan
      SET
        create_at = now() at time zone 'Asia/Bangkok',
        las_mc = $1,
        las2_mc = $2,
        pds_mc = $3,
        adj_ot = $4,
        adj_mc_clean = $5,
        adj_mc_problem = $6,
        adj_oths = $7
      WHERE id = $8
    `;

    const params = [
      las_mc,
      las2_mc,
      pds_mc,
      adj_ot,
      adj_mc_clean,
      adj_mc_problem,
      adj_oths,
      id,
    ];

    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//* Update PDS_MC
router.put("/update_pds_mc", async (req, res) => {
  try {
    const { lot, pds_mc, process_end, package_id } = req.body;

    if (!lot || !Array.isArray(lot) || !pds_mc || !process_end || !package_id) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Construct the SQL query dynamically using parameterized query
    let sqlQuery = `
      UPDATE smart.smart_product_lot_wip_pth_plan
      SET pds_mc = $1,
          process_end = $2
      WHERE lot IN (${lot.map((_, index) => `$${index + 3}`).join(", ")})
      AND package_id = $${lot.length + 3};
    `;

    // Extracting values to be bound to parameters
    const values = [pds_mc, process_end, ...lot, package_id];

    // Execute the SQL query with parameterized values
    await pool.query(sqlQuery, values);

    res.json({
      success: true,
      message: "PDS_MC and process_end updated successfully",
    });
  } catch (error) {
    console.error("Error updating PDS_MC and process_end:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//* Update PDS_MC for split mc
router.put("/update_pds_mc_split", async (req, res) => {
  try {
    const { lot, pds_mc, process_end, package_id } = req.body;

    if (!lot || !Array.isArray(lot) || !pds_mc || !process_end || !package_id) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Construct the SQL query dynamically using parameterized query
    let sqlQuery = `
      UPDATE smart.smart_product_lot_wip_pth_plan
      SET pds_mc = $1,
          process_end = $2
      WHERE lot IN (${lot.map((_, index) => `$${index + 3}`).join(", ")})
      AND package_id = $${lot.length + 3};
    `;

    // Extracting values to be bound to parameters
    const values = [pds_mc, process_end, ...lot, package_id];

    // Execute the SQL query with parameterized values
    await pool.query(sqlQuery, values);

    res.json({
      success: true,
      message: "PDS_MC and process_end updated successfully",
    });
  } catch (error) {
    console.error("Error updating PDS_MC and process_end:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//! Delete
router.delete("/delete_plan/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const queryStr = `
      DELETE FROM smart.smart_product_lot_wip_pth_plan
      WHERE id = $1
    `;

    const result = await pool.query(queryStr, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
