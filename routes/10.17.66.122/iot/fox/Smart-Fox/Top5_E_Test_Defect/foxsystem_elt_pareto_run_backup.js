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

router.get("/", async (req, res) => {
  try {
    const result = await query(
      `SELECT
  id,
  create_date,
  uut_stop,
  mc_code,
  product,
  channel,
  sn,
  retest_time,
  fail_mode,
  fail_detail,
  update_date
FROM
  fox.foxsystem_elt_pareto_run_backup;`
    );

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    }
    res
      .status(200)
      .json({ status: "OK", message: "Data found", data: result.rows });
  } catch (err) {
    console.error("Error running query " + err);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/distinct_product", async (req, res) => {
  const { start_date, end_date } = req.query;
  const params = [start_date, end_date];
  try {
    const result = await query(
      `SELECT DISTINCT product
       FROM fox.foxsystem_elt_pareto_run_backup
       WHERE to_char(uut_stop, 'yyyy-mm-dd') BETWEEN $1 AND $2`,
      params
    );

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (err) {
    console.error("Error running query " + err);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/distinct_machine", async (req, res) => {
  const { start_date, end_date, product } = req.query;
  const params = [start_date, end_date, product];
  try {
    const result = await query(
      `SELECT DISTINCT mc_code
       FROM fox.foxsystem_elt_pareto_run_backup
       WHERE to_char(uut_stop, 'yyyy-mm-dd') BETWEEN $1 AND $2
       AND product = $3`,
      params
    );

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (err) {
    console.error("Error running query " + err);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/distinct_fail_mode", async (req, res) => {
  const { start_date, end_date, product, mc_code } = req.query;
  let params = [start_date, end_date, product];
  let sql = ``;
  let machineCode = ``;
  if (mc_code === undefined || mc_code === null) {
    machineCode = "ALL";
  } else {
    machineCode = mc_code;
  }
  // if mc_code is ALL, then we don't need to filter by mc_code
  if (machineCode.toLocaleUpperCase() !== "ALL") {
    params = [start_date, end_date, product, mc_code];
    sql = `SELECT DISTINCT fail_mode
    FROM fox.foxsystem_elt_pareto_run_backup
    WHERE to_char(uut_stop, 'yyyy-mm-dd') BETWEEN $1 AND $2
    AND product = $3
    AND mc_code = $4`;
  } else {
    sql = `SELECT DISTINCT fail_mode
    FROM fox.foxsystem_elt_pareto_run_backup
    WHERE to_char(uut_stop, 'yyyy-mm-dd') BETWEEN $1 AND $2
    AND product = $3`;
  }
  try {
    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (err) {
    console.error("Error running query " + err);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/distinct_day", async (req, res) => {
  const { start_date, end_date, product, mc_code, fail_mode } = req.query;
  let params = [start_date, end_date, product, fail_mode];
  let sql = ``;
  let machineCode = ``;
  if (mc_code === undefined || mc_code === null) {
    machineCode = "ALL";
  } else {
    machineCode = mc_code;
  }
  // if mc_code is ALL, then we don't need to filter by mc_code
  if (machineCode.toLocaleUpperCase() !== "ALL") {
    params = [start_date, end_date, product, mc_code, fail_mode];
    sql = `SELECT DISTINCT to_char(uut_stop, 'yyyy-mm-dd') as date
    FROM fox.foxsystem_elt_pareto_run_backup
    WHERE to_char(uut_stop, 'yyyy-mm-dd') BETWEEN $1 AND $2
    AND product = $3
    AND mc_code = $4
    AND fail_mode = $5`;
  } else {
    sql = `SELECT DISTINCT to_char(uut_stop, 'yyyy-mm-dd') as date
    FROM fox.foxsystem_elt_pareto_run_backup
    WHERE to_char(uut_stop, 'yyyy-mm-dd') BETWEEN $1 AND $2
    AND product = $3
    AND fail_mode = $4`;
  }

  try {
    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (err) {
    console.error("Error running query " + err);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/paretobyday", async (req, res) => {
  const { start_date, end_date, product, mc_code, fail_mode, seledctday } =
    req.query;
  let params = [start_date, end_date, product, fail_mode, seledctday];
  let sql = ``;
  let machineCode = ``;
  if (mc_code === undefined || mc_code === null) {
    machineCode = "ALL";
  } else {
    machineCode = mc_code;
  }
  // if mc_code is ALL, then we don't need to filter by mc_code
  if (machineCode.toLocaleUpperCase() !== "ALL") {
    params = [start_date, end_date, product, mc_code, fail_mode, seledctday];
    sql = `
    select
	to_char (t.uut_stop, 'yyyy-mm-dd') as date
	, t.product
	, t.mc_code
	, t.fail_mode
	, t.fail_detail
	, count (*) as count_ng
from
	fox.foxsystem_elt_pareto_run_backup t
where
  to_char (t.uut_stop, 'yyyy-mm-dd') between $1 and $2
  and t.product = $3
  and t.mc_code = $4
  and t.fail_mode = $5
  and to_char (t.uut_stop, 'yyyy-mm-dd') = $6
group by
	to_char (t.uut_stop, 'yyyy-mm-dd')
	, t.product
	, t.mc_code
	, t.fail_mode
	, t.fail_detail
    `;
  } else {
    sql = `select
	to_char (t.uut_stop, 'yyyy-mm-dd') as date
	, t.product
	, t.fail_mode
	, t.fail_detail
	, count (*) as count_ng
from
	fox.foxsystem_elt_pareto_run_backup t
where
  to_char (t.uut_stop, 'yyyy-mm-dd') between $1 and $2
  and t.product = $3
  and t.fail_mode = $4
  and to_char (t.uut_stop, 'yyyy-mm-dd') = $5
group by
	to_char (t.uut_stop, 'yyyy-mm-dd')
	, t.product
	, t.fail_mode
	, t.fail_detail
    `;
  }
  try {
    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (err) {
    console.error("Error running query " + err);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/distinct_week", async (req, res) => {
  const { start_date, end_date, product, mc_code, fail_mode } = req.query;
  let params = [start_date, end_date, product, fail_mode];
  let sql = ``;
  let machineCode = ``;
  if (mc_code === undefined || mc_code === null) {
    machineCode = "ALL";
  } else {
    machineCode = mc_code;
  }
  // if mc_code is ALL, then we don't need to filter by mc_code

  if (machineCode.toLocaleUpperCase() !== "ALL") {
    params = [start_date, end_date, product, mc_code, fail_mode];

    sql = `with cte as (

      select
                          	  case
        		when extract (week from t.uut_stop) < 10 then '0' || extract (week from t.uut_stop)::varchar
        		else extract (week from t.uut_stop)::varchar
        	end as wk
        	, extract (year from t.uut_stop)::varchar as yr
        	, t.product
        	, t.fail_mode
        	, t.fail_detail
        from
                                                            	fox.foxsystem_elt_pareto_run_backup t
          where
            to_char (t.uut_stop, 'yyyy-mm-dd') between $1 and $2
            and t.product = $3
            and t.mc_code = $4
            and t.fail_mode = $5
            ),
            cte2 as (
            select
            	concat (sq.yr, ' Week',sq.wk) as wk_code
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            	, count (sq.*)  
            from
                                                          	cte sq  
            group by
                                                        	concat (sq.yr, ' Week',sq.wk)
              	, sq.product
              	, sq.fail_mode
              	, sq.fail_detail
              )             
            select
              	distinct sq2.wk_code
            from
                                    	cte2 sq2
            order by sq2.wk_code desc 
    `;
  } else {
    sql = `with cte as (
      select
                          	  case
        		when extract (week from t.uut_stop) < 10 then '0' || extract (week from t.uut_stop)::varchar
        		else extract (week from t.uut_stop)::varchar
        	end as wk
        	, extract (year from t.uut_stop)::varchar as yr
        	, t.product
        	, t.fail_mode
        	, t.fail_detail
        from
                                                            	fox.foxsystem_elt_pareto_run_backup t
          where
            to_char (t.uut_stop, 'yyyy-mm-dd') between $1 and $2
            and t.product = $3
            and t.fail_mode = $4
            ),
            cte2 as (
            select
            	concat (sq.yr, ' Week',sq.wk) as wk_code
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            	, count (sq.*)  
            from
                                                          	cte sq  
            group by
                                                        	concat (sq.yr, ' Week',sq.wk)
              	, sq.product
              	, sq.fail_mode
              	, sq.fail_detail
              )             
            select
              	distinct sq2.wk_code
            from
                                    	cte2 sq2
            order by sq2.wk_code desc 
    `;
  }
  try {
    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (err) {
    console.error("Error running query " + err);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/paretobyweek", async (req, res) => {
  const { start_date, end_date, product, mc_code, fail_mode, select_week } =
    req.query;
  let params = [start_date, end_date, product, fail_mode, select_week];
  let sql = ``;
  let machineCode = ``;
  if (mc_code === undefined || mc_code === null) {
    machineCode = "ALL";
  } else {
    machineCode = mc_code;
  }
  // if mc_code is ALL, then we don't need to filter by mc_code

  if (machineCode.toLocaleUpperCase() !== "ALL") {
    params = [start_date, end_date, product, mc_code, fail_mode, select_week];

    sql = `with cte as (

      select
                          	  case
        		when extract (week from t.uut_stop) < 10 then '0' || extract (week from t.uut_stop)::varchar
        		else extract (week from t.uut_stop)::varchar
        	end as wk
        	, extract (year from t.uut_stop)::varchar as yr
        	, t.product
        	, t.fail_mode
        	, t.fail_detail
        from
                                                            	fox.foxsystem_elt_pareto_run_backup t
          where
            to_char (t.uut_stop, 'yyyy-mm-dd') between $1 and $2
            and t.product = $3
            and t.mc_code = $4
            and t.fail_mode = $5
            ),
            cte2 as (
            select
            	concat (sq.yr, ' Week',sq.wk) as wk_code
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            	, count (sq.*)  
            from
                                                          	cte sq  
            group by
                                                        	concat (sq.yr, ' Week',sq.wk)
              	, sq.product
              	, sq.fail_mode
              	, sq.fail_detail
              )             
            select
              	 sq2.*
            from
                                    	cte2 sq2
            where
              sq2.wk_code = $6

    `;
  } else {
    sql = `with cte as (
      select
                          	  case
        		when extract (week from t.uut_stop) < 10 then '0' || extract (week from t.uut_stop)::varchar
        		else extract (week from t.uut_stop)::varchar
        	end as wk
        	, extract (year from t.uut_stop)::varchar as yr
        	, t.product
        	, t.fail_mode
        	, t.fail_detail
        from
                                                            	fox.foxsystem_elt_pareto_run_backup t
          where
            to_char (t.uut_stop, 'yyyy-mm-dd') between $1 and $2
            and t.product = $3
            and t.fail_mode = $4
            ),
            cte2 as (
            select
            	concat (sq.yr, ' Week',sq.wk) as wk_code
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            	, count (sq.*)  
            from
                                                          	cte sq  
            group by
                                                        	concat (sq.yr, ' Week',sq.wk)
              	, sq.product
              	, sq.fail_mode
              	, sq.fail_detail
              )             
            select
              	 sq2.*
            from
                                    	cte2 sq2
            where
              sq2.wk_code = $5
    `;
  }
  try {
    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (err) {
    console.error("Error running query " + err);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/distinct_month", async (req, res) => {
  const { start_date, end_date, product, mc_code, fail_mode } = req.query;

  let params = [start_date, end_date, product, fail_mode];
  let sql = ``;
  let machineCode = ``;
  if (mc_code === undefined || mc_code === null) {
    machineCode = "ALL";
  } else {
    machineCode = mc_code;
  }
  // if mc_code is ALL, then we don't need to filter by mc_code

  if (machineCode.toLocaleUpperCase() !== "ALL") {
    params = [start_date, end_date, product, mc_code, fail_mode];

    sql = `with cte as (
      select
                          	  case
        		when extract (month from t.uut_stop) < 10 then '0' || extract (month from t.uut_stop)::varchar
        		else extract (month from t.uut_stop)::varchar
        	end as mn
        	, extract (year from t.uut_stop)::varchar as yr
        	, t.product
        	, t.fail_mode
        	, t.fail_detail
        from
                                                            	fox.foxsystem_elt_pareto_run_backup t
          where
            to_char (t.uut_stop, 'yyyy-mm-dd') between $1 and $2
            and t.product = $3
            and t.mc_code = $4
            and t.fail_mode = $5
            ),
            cte2 as (
            select
            	concat (sq.yr, ' Month ',sq.mn) as month
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            	, count (sq.*)
            from
            	cte sq
            group by
            	concat (sq.yr, ' Month ',sq.mn)
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            )
            select
            	distinct sq2.month
            from
            	cte2 sq2
            order by sq2.month desc
    `;
  } else {
    sql = `with cte as (
      select
                          	  case
        		when extract (month from t.uut_stop) < 10 then '0' || extract (month from t.uut_stop)::varchar
        		else extract (month from t.uut_stop)::varchar
        	end as mn
        	, extract (year from t.uut_stop)::varchar as yr
        	, t.product
        	, t.fail_mode
        	, t.fail_detail
        from
                                                            	fox.foxsystem_elt_pareto_run_backup t
          where
            to_char (t.uut_stop, 'yyyy-mm-dd') between $1 and $2
            and t.product = $3
            and t.fail_mode = $4
            ),
            cte2 as (
            select
            	concat (sq.yr, ' Month ',sq.mn) as month
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            	, count (sq.*)
            from
            	cte sq
            group by
            	concat (sq.yr, ' Month ',sq.mn)
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            )
            select
            	distinct sq2.month
            from
            	cte2 sq2
            order by sq2.month desc
    `;
  }
  try {
    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (err) {
    console.error("Error running query " + err);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/paretobymonth", async (req, res) => {
  const { start_date, end_date, product, mc_code, fail_mode, select_month } =
    req.query;

  let params = [start_date, end_date, product, fail_mode, select_month];
  let sql = ``;
  let machineCode = ``;
  if (mc_code === undefined || mc_code === null) {
    machineCode = "ALL";
  } else {
    machineCode = mc_code;
  }
  // if mc_code is ALL, then we don't need to filter by mc_code

  if (machineCode.toLocaleUpperCase() !== "ALL") {
    params = [start_date, end_date, product, mc_code, fail_mode, select_month];

    sql = `with cte as (
      select
                          	  case
        		when extract (month from t.uut_stop) < 10 then '0' || extract (month from t.uut_stop)::varchar
        		else extract (month from t.uut_stop)::varchar
        	end as mn
        	, extract (year from t.uut_stop)::varchar as yr
        	, t.product
        	, t.fail_mode
        	, t.fail_detail
        from
                                                            	fox.foxsystem_elt_pareto_run_backup t
          where
            to_char (t.uut_stop, 'yyyy-mm-dd') between $1 and $2
            and t.product = $3
            and t.mc_code = $4
            and t.fail_mode = $5
            ),
            cte2 as (
            select
            	concat (sq.yr, ' Month ',sq.mn) as month
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            	, count (sq.*)
            from
            	cte sq
            group by
            	concat (sq.yr, ' Month ',sq.mn)
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            )
            select
            	 sq2.*
            from
            	cte2 sq2
            where
              sq2.month = $6
    `;
  } else {
    sql = `with cte as (
      select
                          	  case
        		when extract (month from t.uut_stop) < 10 then '0' || extract (month from t.uut_stop)::varchar
        		else extract (month from t.uut_stop)::varchar
        	end as mn
        	, extract (year from t.uut_stop)::varchar as yr
        	, t.product
        	, t.fail_mode
        	, t.fail_detail
        from
                                                            	fox.foxsystem_elt_pareto_run_backup t
          where
            to_char (t.uut_stop, 'yyyy-mm-dd') between $1 and $2
            and t.product = $3
            and t.fail_mode = $4
            ),
            cte2 as (
            select
            	concat (sq.yr, ' Month ',sq.mn) as month
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            	, count (sq.*)
            from
            	cte sq
            group by
            	concat (sq.yr, ' Month ',sq.mn)
            	, sq.product
            	, sq.fail_mode
            	, sq.fail_detail
            )
            select
            	 sq2.*
            from
            	cte2 sq2
            where
              sq2.month = $5

    `;
  }
  try {
    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (err) {
    console.error("Error running query " + err);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

module.exports = router;
