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

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "fujikura",
//   database: "postgres", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
// });

const query = (text, params) => pool.query(text, params);

router.get("/distinctjwpv_dept", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct t.jwpv_dept
    from
      smart.smart_jv_parameter_calling t`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctjwpv_proc_group", async (req, res) => {
  try {
    const { jwpv_dept } = req.query;
    let queryStr = "";
    let queryParams = [];

    queryStr = `
      select
      distinct t.jwpv_proc_group
    from
      smart.smart_jv_parameter_calling t
        `;

    if (jwpv_dept !== "ALL") {
      queryStr += `
        where t.jwpv_dept = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_dept);
    }
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctjwpv_job_type", async (req, res) => {
  try {
    const { jwpv_dept, jwpv_proc_group } = req.query;
    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
    distinct t.jwpv_job_type
  from
    smart.smart_jv_parameter_calling t
  where 1 = 1
        `;

    if (jwpv_dept !== "ALL") {
      queryStr += `
        and t.jwpv_dept = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_dept);
    }

    if (jwpv_proc_group !== "ALL") {
      queryStr += `
        and t.jwpv_proc_group = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_proc_group);
    }

    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctjwpv_mc_code", async (req, res) => {
  try {
    const { jwpv_dept, jwpv_proc_group, jwpv_job_type } = req.query;
    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
	distinct t.jwpv_mc_code
from
	smart.smart_jv_parameter_calling t
where
    1 = 1`;

    if (jwpv_dept !== "ALL") {
      queryStr += `
            and t.jwpv_dept = $${queryParams.length + 1}
        `;
      queryParams.push(jwpv_dept);
    }
    if (jwpv_proc_group !== "ALL") {
      queryStr += `
            and t.jwpv_proc_group = $${queryParams.length + 1}
        `;
      queryParams.push(jwpv_proc_group);
    }
    if (jwpv_job_type !== "ALL") {
      queryStr += `
                and t.jwpv_job_type = $${queryParams.length + 1}
            `;
      queryParams.push(jwpv_job_type);
    }
    // queryParams = [jwpv_dept, jwpv_proc_group, jwpv_job_type];
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// router.get("/TableView", async (req, res) => {
//   try {
//     const { jwpv_dept, jwpv_proc_group, jwpv_mc_code, jwpv_job_type } =
//       req.query;

//     let queryParams = [];
//     let queryStr = `
//     -- Common Table Expression (CTE) to retrieve EOL Date data
// with eol_date_query as (
//     select
//         t.jwpv_dept as dept,
//         t.jwpv_proc_group as process_group,
//         to_char(t.update_file, 'yyyy-mm-dd') as verify_test_time,
//         t.jwpv_mc_code as machine_code,
//         t.jwpv_job_type as job_type,
//         t.jwpv_param_tvalue as eol_date
//     from
//         smart.smart_jv_parameter_calling t
//     where
//        t.jwpv_param_title in ('EOL Date','Next Due','Weekly-Uniformity Next Due','Next time')
// )

// -- Main Query
// select
//     distinct
//     t.jwpv_dept as dept,
//     t.jwpv_proc_group as process_group,
//     to_char(t.update_file, 'yyyy-mm-dd') as verify_test_time,
//     t.jwpv_mc_code as machine_code,
//     t.jwpv_job_type as job_type,
//     t.jwpv_param_tvalue as verify_result,
//     eol_date_query.eol_date
// from
//     smart.smart_jv_parameter_calling t
// left join
//     eol_date_query
//     on
//         t.jwpv_dept = eol_date_query.dept
//         and t.jwpv_proc_group = eol_date_query.process_group
//         and to_char(t.update_file, 'yyyy-mm-dd') = eol_date_query.verify_test_time
//         and t.jwpv_mc_code = eol_date_query.machine_code
//         and t.jwpv_job_type = eol_date_query.job_type
// where
//     t.jwpv_param_tvalue in ('PASS', 'FAIL')
//     `;

//     if (jwpv_dept !== "ALL") {
//       queryStr += `
//         AND dept = $${queryParams.length + 1}
//       `;
//       queryParams.push(jwpv_dept);
//     }
//     if (jwpv_proc_group !== "ALL") {
//       queryStr += `
//         AND process_group = $${queryParams.length + 1}
//       `;
//       queryParams.push(jwpv_proc_group);
//     }
//     if (jwpv_mc_code !== "ALL") {
//       queryStr += `
//         AND machine_code = $${queryParams.length + 1}
//       `;
//       queryParams.push(jwpv_mc_code);
//     }
//     if (jwpv_job_type !== "ALL") {
//       queryStr += `
//         AND job_type = $${queryParams.length + 1}
//       `;
//       queryParams.push(jwpv_job_type);
//     }

//     queryStr += `
//     order by
//     verify_test_time desc,
//     machine_code asc,
//     job_type asc;
//     `;

//     const result = await pool.query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

router.get("/TableView", async (req, res) => {
  try {
    const { jwpv_dept, jwpv_proc_group, jwpv_mc_code, jwpv_job_type } =
      req.query;

    let queryParams = [];
    let queryStr = `
    WITH eol_date_query AS (
    SELECT
        t.jwpv_dept AS dept,
        t.jwpv_proc_group AS process_group,
        TO_CHAR(t.update_file, 'yyyy-mm-dd') AS verify_test_time,
        t.jwpv_mc_code AS machine_code,
        t.jwpv_job_type AS job_type,
        t.jwpv_param_tvalue AS eol_date
    FROM
        smart.smart_jv_parameter_calling t
    WHERE
        t.jwpv_param_title in ('EOL Date','Next Due','Weekly-Uniformity Next Due','Next time')
)
SELECT
    DISTINCT
    t.jwpv_dept AS dept,
    t.jwpv_proc_group AS process_group,
    TO_CHAR(t.update_file, 'yyyy-mm-dd') AS verify_test_time,
    t.jwpv_mc_code AS machine_code,
    t.jwpv_job_type AS job_type,
    t.jwpv_param_tvalue AS verify_result,
    eol_date_query.eol_date
FROM
    smart.smart_jv_parameter_calling t
LEFT JOIN
    eol_date_query ON t.jwpv_dept = eol_date_query.dept
    and t.jwpv_proc_group = eol_date_query.process_group
    AND TO_CHAR(t.update_file, 'yyyy-mm-dd') = eol_date_query.verify_test_time
    AND t.jwpv_mc_code = eol_date_query.machine_code
    AND t.jwpv_job_type = eol_date_query.job_type
WHERE
    t.jwpv_param_tvalue IN ('PASS', 'FAIL')
    `;

    if (jwpv_dept !== "ALL") {
      queryStr += `
        AND t.jwpv_dept = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_dept);
    }
    if (jwpv_proc_group !== "ALL") {
      queryStr += `
        AND t.jwpv_proc_group = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_proc_group);
    }
    if (jwpv_mc_code !== "ALL") {
      queryStr += `
        AND t.jwpv_mc_code = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_mc_code);
    }
    if (jwpv_job_type !== "ALL") {
      queryStr += `
        AND t.jwpv_job_type = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_job_type);
    }

    queryStr += `
    ORDER BY
    verify_test_time DESC,
    machine_code ASC,
    job_type ASC;
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/tablefull", async (req, res) => {
  try {
    const {
      jwpv_dept,
      jwpv_proc_group,
      jwpv_mc_code,
      jwpv_job_type,
      update_file,
    } = req.query;

    let queryParams = [];
    let queryStr = `
    SELECT
     ROW_NUMBER() OVER () AS id,
	t.update_file AS verify_test_time ,
	/*show in report*/
	t.jwpv_dept ,
	/*drop down*/
	t.jwpv_proc_group ,
	/*drop down*/
	t.jwpv_mc_code ,
	/*drop down (all) + show in report*/
	t.jwpv_job_type ,
	/*drop down (all) + show in report*/
	t.jwpv_param_code ,
	t.jwpv_param_title ,
	/*show in report*/
	t.jwpv_param_value ,
	/*show in report*/
	t.jwpv_param_tvalue /*show in report*/
FROM
	smart.smart_jv_parameter_calling t
WHERE 1=1
    `;

    if (jwpv_dept !== "ALL") {
      queryStr += `
        AND t.jwpv_dept = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_dept);
    }
    if (jwpv_proc_group !== "ALL") {
      queryStr += `
        AND t.jwpv_proc_group = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_proc_group);
    }
    if (jwpv_mc_code !== "ALL") {
      queryStr += `
        AND t.jwpv_mc_code = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_mc_code);
    }
    if (jwpv_job_type !== "ALL") {
      queryStr += `
        AND t.jwpv_job_type = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_job_type);
    }
    //   if (update_file !== "ALL") {
    //   queryStr += `
    //     AND t.update_file::timestamp = $${queryParams.length + 1}
    //   `;
    //   queryParams.push(update_file);
    // }
    queryStr += `
    ORDER BY
	verify_test_time DESC ,
	t.jwpv_proc_group ASC ,
	t.jwpv_mc_code ASC ,
	t.jwpv_param_code ASC
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/plotdata", async (req, res) => {
  try {
    const {
      jwpv_dept,
      jwpv_proc_group,
      jwpv_mc_code,
      jwpv_job_type,
      update_file,
    } = req.query;
    const update_file_start = `${update_file}.000`;
    const update_file_stop = `${update_file}.999999`;

    let queryParams = [];
    let queryStr = `
   select
	create_at,
	update_at,
	jwpv_dept,
	jwpv_proc_group,
	jwpv_job_type,
	jwpv_graph_label,
	jwpv_graph_value,
	jwpv_check_time,
	jwpv_time,
	jwpv_graph_lsl,
	jwpv_graph_usl,
	jwpv_graph_lcl,
	jwpv_graph_ucl,
	jwpv_graph_target,
	jwpv_mc_code,
	id,
	update_file
from
	smart.smart_jv_parameter_calling_chart
WHERE 1=1
and update_file >= '${update_file_start}'::timestamp
AND update_file < '${update_file_stop}'::timestamp
    `;

    if (jwpv_dept !== "ALL") {
      queryStr += `
        AND jwpv_dept = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_dept);
    }
    if (jwpv_proc_group !== "ALL") {
      queryStr += `
        AND jwpv_proc_group = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_proc_group);
    }
    if (jwpv_mc_code !== "ALL") {
      queryStr += `
        AND jwpv_mc_code = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_mc_code);
    }
    if (jwpv_job_type !== "ALL") {
      queryStr += `
        AND jwpv_job_type = $${queryParams.length + 1}
      `;
      queryParams.push(jwpv_job_type);
    }

    queryStr += `
    order by
	id asc,
	jwpv_time asc
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
