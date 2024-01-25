const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});

const query = (text, params) => pool.query(text, params);

router.get("/Fpca-AOI/distinctmaster_sheet_no", async (req, res) => {
  try {
    const { start_date, stop_date } = req.query;

    const queryStr = `
  SELECT DISTINCT master_sheet_no
  FROM smt.smt_goldenmaster_zaoi_aoi
  WHERE
    aoi_inspect_date::date >= $1
    AND aoi_inspect_date::date <= $2
`;

    const queryParams = [start_date, stop_date];
    const resultRows = await query(queryStr, queryParams);
    res.status(200).json(resultRows.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/Fpca-AOI/distinctmachine_no", async (req, res) => {
  try {
    const { master_sheet_no, start_date, stop_date } = req.query;

    const queryStr = `
      select
        distinct machine_no
      from
        smt.smt_goldenmaster_zaoi_aoi
      where master_sheet_no = $1
    and aoi_inspect_date :: date >= $2 
    and aoi_inspect_date :: date <= $3 
      order by machine_no desc
    `;

    const queryParams = [master_sheet_no, start_date, stop_date];

    const resultRows = await query(queryStr, queryParams);
    res.status(200).json(resultRows.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// router.get("/page1/distinctfixture_code", async (req, res) => {
//   try {
//     const { sheet_no } = req.query;

//     const queryStr = `
//     select
//     distinct fixture_code
//   from
//     public.smart_master_fin_fost_verify
//   where sheet_no = $1
//   order by fixture_code desc
//     `;
//     const queryParams = [sheet_no];

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/Fpca-AOI/tableverify", async (req, res) => {
  try {
    const { master_sheet_no, start_date, stop_date, machine_no } = req.query;
    if (machine_no === "ALL") {
      queryStr = `
      SELECT
      ROW_NUMBER() OVER () AS id,
  t.aoi_inspect_date,
  t.master_sheet_no,
  t.aoi_inspect_count,
  t.machine_no,
  CASE
  WHEN NOT EXISTS (
  SELECT 1
  FROM smt.smt_goldenmaster_zaoi_aoi sub
  WHERE sub.aoi_inspect_date = t.aoi_inspect_date
  AND sub.master_sheet_no = t.master_sheet_no
  AND sub.aoi_inspect_count = t.aoi_inspect_count
  AND sub.judgement <> 'PASS'
  ) THEN 'PASS'
  ELSE 'FAIL'
  END AS judgement
  FROM 
  smt.smt_goldenmaster_zaoi_aoi t
  where 
      master_sheet_no = $1
      and aoi_inspect_date :: date >= $2 
      and aoi_inspect_date :: date <= $3 
  GROUP BY
  t.aoi_inspect_date,
  t.master_sheet_no,
  t.aoi_inspect_count,
  t.machine_no
  ORDER BY
  t.aoi_inspect_date desc,
  t.aoi_inspect_count desc;   
          `;
      queryParams = [master_sheet_no, start_date, stop_date];
    } else {
      queryStr = `
  SELECT
  ROW_NUMBER() OVER () AS id,
t.aoi_inspect_date,
t.master_sheet_no,
t.aoi_inspect_count,
t.machine_no,
CASE
WHEN NOT EXISTS (
SELECT 1
FROM smt.smt_goldenmaster_zaoi_aoi sub
WHERE sub.aoi_inspect_date = t.aoi_inspect_date
AND sub.master_sheet_no = t.master_sheet_no
AND sub.aoi_inspect_count = t.aoi_inspect_count
AND sub.judgement <> 'PASS'
) THEN 'PASS'
ELSE 'FAIL'
END AS judgement
FROM 
smt.smt_goldenmaster_zaoi_aoi t
where 
  master_sheet_no = $1
  and aoi_inspect_date :: date >= $2 
  and aoi_inspect_date :: date <= $3 
  and machine_no = $4
GROUP BY
t.aoi_inspect_date,
t.master_sheet_no,
t.aoi_inspect_count,
t.machine_no
ORDER BY
t.aoi_inspect_date desc,
t.aoi_inspect_count desc;   
      `;
      queryParams = [master_sheet_no, start_date, stop_date, machine_no];
    }
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/Fpca-AOI/tablemasterverify", async (req, res) => {
  try {
    const { master_sheet_no, aoi_inspect_count, time, machine_no } = req.query;

    if (machine_no === "ALL") {
      queryStr = `
      select
      ROW_NUMBER() OVER () AS id,
      t.aoi_inspect_date ,
      t.master_sheet_no ,
      t.aoi_inspect_count ,
      t."position" ,
      t.master_component ,
      t.verify_component ,
      t.verify_result ,
      t.verify_item ,
      t.master_result ,
      t.master_item ,
      judgement
    from
      smt.smt_goldenmaster_zaoi_aoi t
    where
      master_sheet_no = $1
      and aoi_inspect_date :: date = $2
      and aoi_inspect_count = $3
    order by
      t.aoi_inspect_date desc ,
      t.aoi_inspect_count desc ,
      t."position" asc ,
      t.master_component asc`;
      queryParams = [master_sheet_no, time, aoi_inspect_count];
    } else {
      queryStr = `
      select
      ROW_NUMBER() OVER () AS id,
      t.aoi_inspect_date ,
      t.master_sheet_no ,
      t.aoi_inspect_count ,
      t."position" ,
      t.master_component ,
      t.verify_component ,
      t.verify_result ,
      t.verify_item ,
      t.master_result ,
      t.master_item ,
      judgement
    from
      smt.smt_goldenmaster_zaoi_aoi t
where 
master_sheet_no = $1
  and aoi_inspect_date :: date = $2
and aoi_inspect_count = $3
and machine_no = $4
order by
t.aoi_inspect_date desc ,
t.aoi_inspect_count desc ,
t."position" asc ,
t.master_component asc`;
      queryParams = [master_sheet_no, time, aoi_inspect_count, machine_no];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
