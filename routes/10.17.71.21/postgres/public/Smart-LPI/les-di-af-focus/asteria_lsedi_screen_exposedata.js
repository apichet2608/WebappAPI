const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.71.21",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/page5/plot", async (req, res) => {
  try {
    const { mc_code, data_file } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }
    let queryStr = "";
    let queryParams = [];

    if (data_file !== "ALL") {
      //   queryStr = `
      //   SELECT
      //   processing_start_time,
      //   processing_end_time,
      //   data_file,
      //   mc_code,
      //   re_head1_focus,
      //   re_head2_focus,
      //   re_head3_focus,
      //   re_head4_focus,
      //   re_head5_focus,
      //   re_head6_focus,
      //   (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6 AS avg_row,
      //   SQRT(
      //     POW(re_head1_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head2_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head3_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head4_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head5_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head6_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2)
      //   ) / SQRT(6) AS stdev_row,
      //   ((re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6) - (SQRT(
      //     POW(re_head1_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head2_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head3_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head4_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head5_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head6_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2)
      //   ) / SQRT(6)) AS min_control,
      //   ((re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6) + (SQRT(
      //     POW(re_head1_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head2_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head3_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head4_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head5_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head6_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2)
      //   ) / SQRT(6)) AS max_control
      // FROM (
      //   SELECT
      //     processing_start_time,
      //     processing_end_time,
      //     data_file,
      //     mc_code,
      //     re_head1_focus::numeric,
      //     re_head2_focus::numeric,
      //     re_head3_focus::numeric,
      //     re_head4_focus::numeric,
      //     re_head5_focus::numeric,
      //     re_head6_focus::numeric
      //   FROM
      //     asteria.asteria_lsedi_screen_exposedata
      //   WHERE
      //     mc_code = $1
      //     AND data_file = $2
      //     AND re_error_module = '"AF OVER  "'
      //     AND processing_end_time::timestamp >= (NOW() - INTERVAL '${hours}' HOUR)
      // ) subquery
      // ORDER BY
      //   processing_end_time ASC;
      //   `;
      queryStr = `
      select
      processing_start_time,
      processing_end_time,
      data_file,
      mc_code,
      re_head1_focus,
      re_head2_focus,
      re_head3_focus,
      re_head4_focus,
      re_head5_focus,
      re_head6_focus,
      (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6 as avg_row,
      SQRT(
        POW(re_head1_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6,
      2) +
        POW(re_head2_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6,
      2) +
        POW(re_head3_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6,
      2) +
        POW(re_head4_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6,
      2) +
        POW(re_head5_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6,
      2) +
        POW(re_head6_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6,
      2)
      ) / SQRT(6) as stdev_row,
      ((re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6) - 200 as min_control,
      ((re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6) + 200 as max_control
    from
      (
      select
        processing_start_time,
        processing_end_time,
        data_file,
        mc_code,
        re_head1_focus::numeric,
        re_head2_focus::numeric,
        re_head3_focus::numeric,
        re_head4_focus::numeric,
        re_head5_focus::numeric,
        re_head6_focus::numeric
      from
        asteria.asteria_lsedi_screen_exposedata
      where
        mc_code = $1
        and data_file = $2
        and re_error_module = '"AF OVER  "'
        and processing_end_time::timestamp >= (NOW() - interval '${hours}' hour)
    ) subquery
    order by
      processing_end_time asc;
    `;
      queryParams = [mc_code, data_file];
    } else {
      //   queryStr = `
      //   SELECT
      //   processing_start_time,
      //   processing_end_time,
      //   data_file,
      //   mc_code,
      //   re_head1_focus,
      //   re_head2_focus,
      //   re_head3_focus,
      //   re_head4_focus,
      //   re_head5_focus,
      //   re_head6_focus,
      //   (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6 AS avg_row,
      //   SQRT(
      //     POW(re_head1_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head2_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head3_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head4_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head5_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head6_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2)
      //   ) / SQRT(6) AS stdev_row,
      //   ((re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6) - (SQRT(
      //     POW(re_head1_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head2_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head3_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head4_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head5_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head6_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2)
      //   ) / SQRT(6)) AS min_control,
      //   ((re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6) + (SQRT(
      //     POW(re_head1_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head2_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head3_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head4_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head5_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2) +
      //     POW(re_head6_focus - (re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6, 2)
      //   ) / SQRT(6)) AS max_control
      // FROM (
      //   SELECT
      //     processing_start_time,
      //     processing_end_time,
      //     data_file,
      //     mc_code,
      //     re_head1_focus::numeric,
      //     re_head2_focus::numeric,
      //     re_head3_focus::numeric,
      //     re_head4_focus::numeric,
      //     re_head5_focus::numeric,
      //     re_head6_focus::numeric
      //   FROM
      //     asteria.asteria_lsedi_screen_exposedata
      //   WHERE
      //     mc_code = $1
      //     AND re_error_module = '"AF OVER  "'
      //     AND processing_end_time::timestamp >= (NOW() - INTERVAL '${hours}' HOUR)
      // ) subquery
      // ORDER BY
      //   processing_end_time ASC;
      //   `;
      queryStr = `
      select
	processing_start_time,
	processing_end_time,
	data_file,
	mc_code,
	re_head1_focus,
	re_head2_focus,
	re_head3_focus,
	re_head4_focus,
	re_head5_focus,
	re_head6_focus,
	(re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6 as avg_row,
	((re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6) - 200 as min_control,
	((re_head1_focus + re_head2_focus + re_head3_focus + re_head4_focus + re_head5_focus + re_head6_focus) / 6) + 200 as max_control
from
	(
	select
		processing_start_time,
		processing_end_time,
		data_file,
		mc_code,
		re_head1_focus::numeric,
		re_head2_focus::numeric,
		re_head3_focus::numeric,
		re_head4_focus::numeric,
		re_head5_focus::numeric,
		re_head6_focus::numeric
	from
		asteria.asteria_lsedi_screen_exposedata
	where
		mc_code = $1
		and re_error_module = '"AF OVER  "'
		and processing_end_time::timestamp >= (NOW() - interval '${hours}' hour)
) subquery
order by
	processing_end_time asc;
      `;
      queryParams = [mc_code];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctMachine", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct mc_code
    from
      asteria.asteria_lsedi_screen_exposedata`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctdata_file", async (req, res) => {
  try {
    const { mc_code } = req.query;
    const result = await query(
      `select
      distinct data_file 
    from
      asteria.asteria_lsedi_screen_exposedata
    where mc_code = $1`,
      [mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
