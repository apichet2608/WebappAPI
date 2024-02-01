const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.111",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

// router.get("/fox-summary", async (req, res) => {
//   try {
//     const result = await query(
//       `select
//  	ROW_NUMBER() OVER (ORDER BY production_date) AS id,
//     production_date,
//     sendresultdetails_product,
//     MAX(CASE WHEN station_process = 'TEST15_spi_ky' THEN percent_yield END) AS test15_spi_ky,
//     MAX(CASE WHEN station_process = 'TEST15_spi_ky' THEN total_count END) AS test15_spi_ky_total_count,
//     MAX(CASE WHEN station_process = 'TEST15_spi_ky' THEN result_pass END) AS test15_spi_ky_result_pass,
//     MAX(CASE WHEN station_process = 'TEST15_spi_ky' THEN result_fail END) AS test15_spi_ky_result_fail,
//     MAX(CASE WHEN station_process = 'TEST18_aoi' THEN percent_yield END) AS test18_aoi,
//     MAX(CASE WHEN station_process = 'TEST18_aoi' THEN total_count END) AS test18_aoi_total_count,
//     MAX(CASE WHEN station_process = 'TEST18_aoi' THEN result_pass END) AS test18_aoi_result_pass,
//     MAX(CASE WHEN station_process = 'TEST18_aoi' THEN result_fail END) AS test18_aoi_result_fail,
//     MAX(CASE WHEN station_process = 'TEST27_holding_time_27' THEN percent_yield END) AS test27_holding_time,
//     MAX(CASE WHEN station_process = 'TEST27_holding_time_27' THEN total_count END) AS test27_holding_time_total_count,
//     MAX(CASE WHEN station_process = 'TEST27_holding_time_27' THEN result_pass END) AS test27_holding_time_result_pass,
//     MAX(CASE WHEN station_process = 'TEST27_holding_time_27' THEN result_fail END) AS test27_holding_time_result_fail,
//     MAX(CASE WHEN station_process = 'TEST12_xray' THEN percent_yield END) AS test12_xray,
//     MAX(CASE WHEN station_process = 'TEST12_xray' THEN total_count END) AS test12_xray_total_count,
//     MAX(CASE WHEN station_process = 'TEST12_xray' THEN result_pass END) AS test12_xray_result_pass,
//     MAX(CASE WHEN station_process = 'TEST12_xray' THEN result_fail END) AS test12_xray_result_fail,
//     MAX(CASE WHEN station_process = 'IQC-FLEX3_et' THEN percent_yield END) AS iqc_flex3_et,
//     MAX(CASE WHEN station_process = 'IQC-FLEX3_et' THEN total_count END) AS iqc_flex3_et_total_count,
//     MAX(CASE WHEN station_process = 'IQC-FLEX3_et' THEN result_pass END) AS iqc_flex3_et_result_pass,
//     MAX(CASE WHEN station_process = 'IQC-FLEX3_et' THEN result_fail END) AS iqc_flex3_et_result_fail,
//     MAX(CASE WHEN station_process = 'TEST42_oqc_et' THEN percent_yield END) AS test42_oqc_et,
//     MAX(CASE WHEN station_process = 'TEST42_oqc_et' THEN total_count END) AS test42_oqc_et_total_count,
//     MAX(CASE WHEN station_process = 'TEST42_oqc_et' THEN result_pass END) AS test42_oqc_et_result_pass,
//     MAX(CASE WHEN station_process = 'TEST42_oqc_et' THEN result_fail END) AS test42_oqc_et_result_fail,
//     MAX(CASE WHEN station_process = 'TEST21_avi' THEN percent_yield END) AS test21_avi_percent_yield,
//     MAX(CASE WHEN station_process = 'TEST21_avi' THEN total_count END) AS test21_avi_total_count,
//     MAX(CASE WHEN station_process = 'TEST21_avi' THEN result_pass END) AS test21_avi_result_pass,
//     MAX(CASE WHEN station_process = 'TEST21_avi' THEN result_fail END) AS test21_avi_result_fail,
//     MAX(CASE WHEN station_process = 'TEST13_oqc_fai' THEN percent_yield END) AS test13_oqc_fai,
//     MAX(CASE WHEN station_process = 'TEST13_oqc_fai' THEN total_count END) AS test13_oqc_fai_total_count,
//     MAX(CASE WHEN station_process = 'TEST13_oqc_fai' THEN result_pass END) AS test13_oqc_fai_result_pass,
//     MAX(CASE WHEN station_process = 'TEST13_oqc_fai' THEN result_fail END) AS test13_oqc_fai_result_fail,
//     MAX(CASE WHEN station_process = 'TEST39_holding_time_39' THEN percent_yield END) AS test39_holding_time,
//     MAX(CASE WHEN station_process = 'TEST39_holding_time_39' THEN total_count END) AS test39_holding_time_total_count,
//     MAX(CASE WHEN station_process = 'TEST39_holding_time_39' THEN result_pass END) AS test39_holding_time_result_pass,
//     MAX(CASE WHEN station_process = 'TEST39_holding_time_39' THEN result_fail END) AS test39_holding_time_result_fail,
//     MAX(CASE WHEN station_process = 'TEST74_holding_time_74' THEN percent_yield END) AS test74_holding_time,
//     MAX(CASE WHEN station_process = 'TEST74_holding_time_74' THEN total_count END) AS test74_holding_time_total_count,
//     MAX(CASE WHEN station_process = 'TEST74_holding_time_74' THEN result_pass END) AS test74_holding_time_result_pass,
//     MAX(CASE WHEN station_process = 'TEST74_holding_time_74' THEN result_fail END) AS test74_holding_time_result_fail
// FROM
//     foxsystem_json_backup_header_summary
// GROUP BY
//     production_date,
//     sendresultdetails_product`
//     );

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

// router.get("/data-fix", async (req, res) => {
//   try {
//     const { process, startdate, stopdate, product } = req.query;

//     const result = await query(
//       `select
//       id,
//       production_date,
//       station_process,
//       sendresultdetails_product,
//       lss_lot_no,
//       total_count,
//       result_pass,
//       result_fail,
//       percent_yield
//     from
//       public.foxsystem_summary_bylot
//     where
//       station_process = $1
//       and production_date >= $2
//       and DATE_TRUNC('day',
//       production_date) <= DATE_TRUNC('day',
//       $3::TIMESTAMP)
//       and sendresultdetails_product = $4
//     order by production_date  asc`,
//       [process, startdate, stopdate, product]
//     );

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

// router.get("/data-all", async (req, res) => {
//   try {
//     const { startdate, stopdate, product } = req.query;

//     const result = await query(
//       `select
//       row_number() over (
//     order by
//       production_date) as id,
//       production_date,
//       sendresultdetails_product,
//       MAX(case when station_process = 'TEST15_spi_ky' then percent_yield end) as test15_spi_ky,
//       MAX(case when station_process = 'TEST15_spi_ky' then total_count end) as test15_spi_ky_total_count,
//       MAX(case when station_process = 'TEST15_spi_ky' then result_pass end) as test15_spi_ky_result_pass,
//       MAX(case when station_process = 'TEST15_spi_ky' then result_fail end) as test15_spi_ky_result_fail,
//       MAX(case when station_process = 'TEST15_spi_ckd' then percent_yield end) as test15_spi_ckd,
//       MAX(case when station_process = 'TEST15_spi_ckd' then total_count end) as test15_spi_ckd_total_count,
//       MAX(case when station_process = 'TEST15_spi_ckd' then result_pass end) as test15_spi_ckd_result_pass,
//       MAX(case when station_process = 'TEST15_spi_ckd' then result_fail end) as test15_spi_ckd_result_fail,
//       MAX(case when station_process = 'TEST18_aoi' then percent_yield end) as test18_aoi,
//       MAX(case when station_process = 'TEST18_aoi' then total_count end) as test18_aoi_total_count,
//       MAX(case when station_process = 'TEST18_aoi' then result_pass end) as test18_aoi_result_pass,
//       MAX(case when station_process = 'TEST18_aoi' then result_fail end) as test18_aoi_result_fail,
//       MAX(case when station_process = 'TEST27_holding_time_27' then percent_yield end) as test27_holding_time,
//       MAX(case when station_process = 'TEST27_holding_time_27' then total_count end) as test27_holding_time_total_count,
//       MAX(case when station_process = 'TEST27_holding_time_27' then result_pass end) as test27_holding_time_result_pass,
//       MAX(case when station_process = 'TEST27_holding_time_27' then result_fail end) as test27_holding_time_result_fail,
//       MAX(case when station_process = 'TEST12_xray' then percent_yield end) as test12_xray,
//       MAX(case when station_process = 'TEST12_xray' then total_count end) as test12_xray_total_count,
//       MAX(case when station_process = 'TEST12_xray' then result_pass end) as test12_xray_result_pass,
//       MAX(case when station_process = 'TEST12_xray' then result_fail end) as test12_xray_result_fail,
//       MAX(case when station_process = 'IQC-FLEX3_et' then percent_yield end) as iqc_flex3_et,
//       MAX(case when station_process = 'IQC-FLEX3_et' then total_count end) as iqc_flex3_et_total_count,
//       MAX(case when station_process = 'IQC-FLEX3_et' then result_pass end) as iqc_flex3_et_result_pass,
//       MAX(case when station_process = 'IQC-FLEX3_et' then result_fail end) as iqc_flex3_et_result_fail,
//       MAX(case when station_process = 'TEST42_oqc_et' then percent_yield end) as test42_oqc_et,
//       MAX(case when station_process = 'TEST42_oqc_et' then total_count end) as test42_oqc_et_total_count,
//       MAX(case when station_process = 'TEST42_oqc_et' then result_pass end) as test42_oqc_et_result_pass,
//       MAX(case when station_process = 'TEST42_oqc_et' then result_fail end) as test42_oqc_et_result_fail,
//       MAX(case when station_process = 'TEST21_avi' then percent_yield end) as test21_avi_percent_yield,
//       MAX(case when station_process = 'TEST21_avi' then total_count end) as test21_avi_total_count,
//       MAX(case when station_process = 'TEST21_avi' then result_pass end) as test21_avi_result_pass,
//       MAX(case when station_process = 'TEST21_avi' then result_fail end) as test21_avi_result_fail,
//       MAX(case when station_process = 'TEST13_oqc_fai' then percent_yield end) as test13_oqc_fai,
//       MAX(case when station_process = 'TEST13_oqc_fai' then total_count end) as test13_oqc_fai_total_count,
//       MAX(case when station_process = 'TEST13_oqc_fai' then result_pass end) as test13_oqc_fai_result_pass,
//       MAX(case when station_process = 'TEST13_oqc_fai' then result_fail end) as test13_oqc_fai_result_fail,
//       MAX(case when station_process = 'TEST39_holding_time_39' then percent_yield end) as test39_holding_time,
//       MAX(case when station_process = 'TEST39_holding_time_39' then total_count end) as test39_holding_time_total_count,
//       MAX(case when station_process = 'TEST39_holding_time_39' then result_pass end) as test39_holding_time_result_pass,
//       MAX(case when station_process = 'TEST39_holding_time_39' then result_fail end) as test39_holding_time_result_fail,
//       MAX(case when station_process = 'TEST74_holding_time_74' then percent_yield end) as test74_holding_time,
//       MAX(case when station_process = 'TEST74_holding_time_74' then total_count end) as test74_holding_time_total_count,
//       MAX(case when station_process = 'TEST74_holding_time_74' then result_pass end) as test74_holding_time_result_pass,
//       MAX(case when station_process = 'TEST74_holding_time_74' then result_fail end) as test74_holding_time_result_fail
//     from
//       foxsystem_summary_bylot
//     where
//       production_date >= $1
//       and DATE_TRUNC('day',
//       production_date) <= DATE_TRUNC('day',
//       $2::TIMESTAMP)
//       and sendresultdetails_product = $3
//     group by
//       production_date,
//       sendresultdetails_product
//     order by
//       production_date asc`,
//       [startdate, stopdate, product]
//     );

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/data-fix", async (req, res) => {
  try {
    const { process, startdate, stopdate, product } = req.query;

    let query = `
    select
      id,
      production_date,
      station_process,
      sendresultdetails_product,
      lss_lot_no,
      total_count,
      result_pass,
      result_fail,
      percent_yield
    from
      public.foxsystem_summary_bylot
    where
      production_date >= $1
      and DATE_TRUNC('day',
      production_date) <= DATE_TRUNC('day',
      $2::TIMESTAMP)
    `;

    const queryParams = [startdate, stopdate];

    if (product && product !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` sendresultdetails_product = $${queryParams.length + 1}
      `;
      queryParams.push(product);
    }

    if (process && process !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` station_process = $${queryParams.length + 1}
      `;
      queryParams.push(process);
    }
    query += `
    order by production_date  asc
    `;
    // console.log(query);
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/data-all", async (req, res) => {
  try {
    const { startdate, stopdate, product } = req.query;

    let query = `
    select
      row_number() over (
    order by
      production_date) as id,
      production_date,
      sendresultdetails_product,
      MAX(case when station_process = 'TEST15_spi_ky' then percent_yield end) as test15_spi_ky,
      MAX(case when station_process = 'TEST15_spi_ky' then total_count end) as test15_spi_ky_total_count,
      MAX(case when station_process = 'TEST15_spi_ky' then result_pass end) as test15_spi_ky_result_pass,
      MAX(case when station_process = 'TEST15_spi_ky' then result_fail end) as test15_spi_ky_result_fail,
      MAX(case when station_process = 'TEST15_spi_ckd' then percent_yield end) as test15_spi_ckd,
      MAX(case when station_process = 'TEST15_spi_ckd' then total_count end) as test15_spi_ckd_total_count,
      MAX(case when station_process = 'TEST15_spi_ckd' then result_pass end) as test15_spi_ckd_result_pass,
      MAX(case when station_process = 'TEST15_spi_ckd' then result_fail end) as test15_spi_ckd_result_fail,
      MAX(case when station_process = 'TEST18_aoi' then percent_yield end) as test18_aoi,
      MAX(case when station_process = 'TEST18_aoi' then total_count end) as test18_aoi_total_count,
      MAX(case when station_process = 'TEST18_aoi' then result_pass end) as test18_aoi_result_pass,
      MAX(case when station_process = 'TEST18_aoi' then result_fail end) as test18_aoi_result_fail,
      MAX(case when station_process = 'TEST27_holding_time_27' then percent_yield end) as test27_holding_time,
      MAX(case when station_process = 'TEST27_holding_time_27' then total_count end) as test27_holding_time_total_count,
      MAX(case when station_process = 'TEST27_holding_time_27' then result_pass end) as test27_holding_time_result_pass,
      MAX(case when station_process = 'TEST27_holding_time_27' then result_fail end) as test27_holding_time_result_fail,
      MAX(case when station_process = 'TEST12_xray' then percent_yield end) as test12_xray,
      MAX(case when station_process = 'TEST12_xray' then total_count end) as test12_xray_total_count,
      MAX(case when station_process = 'TEST12_xray' then result_pass end) as test12_xray_result_pass,
      MAX(case when station_process = 'TEST12_xray' then result_fail end) as test12_xray_result_fail,
      MAX(case when station_process = 'IQC-FLEX3_et' then percent_yield end) as iqc_flex3_et,
      MAX(case when station_process = 'IQC-FLEX3_et' then total_count end) as iqc_flex3_et_total_count,
      MAX(case when station_process = 'IQC-FLEX3_et' then result_pass end) as iqc_flex3_et_result_pass,
      MAX(case when station_process = 'IQC-FLEX3_et' then result_fail end) as iqc_flex3_et_result_fail,
      MAX(case when station_process = 'TEST42_oqc_et' then percent_yield end) as test42_oqc_et,
      MAX(case when station_process = 'TEST42_oqc_et' then total_count end) as test42_oqc_et_total_count,
      MAX(case when station_process = 'TEST42_oqc_et' then result_pass end) as test42_oqc_et_result_pass,
      MAX(case when station_process = 'TEST42_oqc_et' then result_fail end) as test42_oqc_et_result_fail,
      MAX(case when station_process = 'TEST21_avi' then percent_yield end) as test21_avi_percent_yield,
      MAX(case when station_process = 'TEST21_avi' then total_count end) as test21_avi_total_count,
      MAX(case when station_process = 'TEST21_avi' then result_pass end) as test21_avi_result_pass,
      MAX(case when station_process = 'TEST21_avi' then result_fail end) as test21_avi_result_fail,
      MAX(case when station_process = 'TEST13_oqc_fai' then percent_yield end) as test13_oqc_fai,
      MAX(case when station_process = 'TEST13_oqc_fai' then total_count end) as test13_oqc_fai_total_count,
      MAX(case when station_process = 'TEST13_oqc_fai' then result_pass end) as test13_oqc_fai_result_pass,
      MAX(case when station_process = 'TEST13_oqc_fai' then result_fail end) as test13_oqc_fai_result_fail,
      MAX(case when station_process = 'TEST39_holding_time_39' then percent_yield end) as test39_holding_time,
      MAX(case when station_process = 'TEST39_holding_time_39' then total_count end) as test39_holding_time_total_count,
      MAX(case when station_process = 'TEST39_holding_time_39' then result_pass end) as test39_holding_time_result_pass,
      MAX(case when station_process = 'TEST39_holding_time_39' then result_fail end) as test39_holding_time_result_fail,
      MAX(case when station_process = 'TEST74_holding_time_74' then percent_yield end) as test74_holding_time,
      MAX(case when station_process = 'TEST74_holding_time_74' then total_count end) as test74_holding_time_total_count,
      MAX(case when station_process = 'TEST74_holding_time_74' then result_pass end) as test74_holding_time_result_pass,
      MAX(case when station_process = 'TEST74_holding_time_74' then result_fail end) as test74_holding_time_result_fail
    from
      foxsystem_summary_bylot
    where
      production_date >= $1
      and DATE_TRUNC('day',
      production_date) <= DATE_TRUNC('day',
      $2::TIMESTAMP)
    `;

    const queryParams = [startdate, stopdate];

    if (product && product !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` sendresultdetails_product = $${queryParams.length + 1}
      `;
      queryParams.push(product);
    }

    query += `
    group by
      production_date,
      sendresultdetails_product
    order by
      production_date asc
    `;
    // console.log(query);
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/distinct-station_process", async (req, res) => {
//   try {
//     const { product } = req.query;
//     const result = await query(
//       `
//     select
//     distinct station_process
//   from
//     public.foxsystem_summary_bylot
//   where sendresultdetails_product = $1
//   order by
//   station_process asc
//     `,
//       [product]
//     );
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/distinct-station_process", async (req, res) => {
  try {
    const { startdate, stopdate, product } = req.query;
    let query = `
    select
    distinct station_process
  from
    public.foxsystem_summary_bylot
    where
     production_date >= $1
      and DATE_TRUNC('day',
      production_date) <= DATE_TRUNC('day',
      $2::TIMESTAMP)
    `;

    const queryParams = [startdate, stopdate];
    if (product && product !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` sendresultdetails_product = $${queryParams.length + 1}
      `;
      queryParams.push(product);
    }

    query += `
    order by station_process asc
    `;
    console.log(query);
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/distinct-product", async (req, res) => {
//   try {
//     const result = await query(`
//     select
//     distinct sendresultdetails_product
//   from
//     public.foxsystem_summary_bylot
//     `);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/distinct-product", async (req, res) => {
  try {
    const { startdate, stopdate } = req.query;
    let query = `
    select
    distinct sendresultdetails_product
  from
    public.foxsystem_summary_bylot
    where
     production_date >= $1
      and DATE_TRUNC('day',
      production_date) <= DATE_TRUNC('day',
      $2::TIMESTAMP)
    `;

    const queryParams = [startdate, stopdate];

    query += `
    order by sendresultdetails_product asc
    `;
    // console.log(query);
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
