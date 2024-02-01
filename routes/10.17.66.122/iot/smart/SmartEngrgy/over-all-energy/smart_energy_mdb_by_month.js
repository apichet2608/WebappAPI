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

router.get("/count-status", async (req, res) => {
  try {
    const result = await query(`
    with aggregated_data as (
        select
            month_code,
            building,
            SUM(diff_energy_usage) as total_diff_energy_usage,
            SUM(energy_cost_baht) as total_energy_cost_baht
        from
            smart.smart_energy_mdb_by_month
        where
            not exists (
            select
                1
            from
                smart.smart_energy_mdb_by_month as t2
            where
                t2.building = smart.smart_energy_mdb_by_month.building
                and t2.month_code > smart.smart_energy_mdb_by_month.month_code
                  )
        group by
            month_code,
            building
          )
        select
            month_code,
            building,
            SUM(total_diff_energy_usage) as total_diff_energy_usage,
            SUM(total_energy_cost_baht) as total_energy_cost_baht
        from
            aggregated_data
        group by
            month_code,
            building
        union all
        select
            month_code,
            'total' as building,
            SUM(total_diff_energy_usage) as total_diff_energy_usage,
            SUM(total_energy_cost_baht) as total_energy_cost_baht
        from
            aggregated_data
        group by
            month_code
        order by
            month_code,
            building;    
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plotlineChart", async (req, res) => {
  try {
    const { build } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      month_code,
      SUM(diff_energy_usage) as total_diff_energy_usage,
      SUM(energy_cost_baht) as total_energy_cost_baht
  from
      smart.smart_energy_mdb_by_month
  group by
      month_code
  order by
      month_code asc
        `;
    } else {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      month_code,
      building,
      SUM(diff_energy_usage) as total_diff_energy_usage,
      SUM(energy_cost_baht) as total_energy_cost_baht
  from
      smart.smart_energy_mdb_by_month
  where
      building = $1
  group by
      month_code,
      building
  order by
      month_code asc
        `;
      queryParams = [build];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plotBarChart", async (req, res) => {
  try {
    const { build } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      CONCAT(area, '-', building) AS area,
	month_code,
	building,
	SUM(diff_energy_usage) as total_diff_energy_usage
from
	smart.smart_energy_mdb_by_month
where
	month_code = (SELECT MAX(month_code) FROM smart.smart_energy_mdb_by_month)
group by
	area,
	month_code,
	building
order by
	month_code desc,
	total_diff_energy_usage desc
limit 10
        `;
    } else {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      CONCAT(area, '-', building) AS area,
      month_code,
      building,
      SUM(diff_energy_usage) as total_diff_energy_usage
    from
      smart.smart_energy_mdb_by_month
    where
      month_code = (SELECT MAX(month_code) FROM smart.smart_energy_mdb_by_month)
      and building = $1
    group by
      area,
      month_code,
      building
    order by
      month_code desc,
      total_diff_energy_usage desc
    limit 10
        `;
      queryParams = [build];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page2/table", async (req, res) => {
  try {
    const { build } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
	row_number() over (
	order by month_code asc) as id,
		load_type,
		building,
		month_code,
		sum(diff_energy_usage) as diff_energy_usage_count
from
	smart.smart_energy_mdb_by_month
where
	month_code = (
	select
		MAX(month_code)
	from
		smart.smart_energy_mdb_by_month)
group by 
		load_type,
		building,
		month_code
order by
diff_energy_usage_count desc,
		 load_type desc
        `;
    } else {
      queryStr = `
      select
	row_number() over (
	order by month_code asc) as id,
		load_type,
		building,
		month_code,
		sum(diff_energy_usage) as diff_energy_usage_count
from
	smart.smart_energy_mdb_by_month
where
	month_code = (
	select
		MAX(month_code)
	from
		smart.smart_energy_mdb_by_month)
    and building = $1
group by 
		load_type,
		building,
		month_code
order by
diff_energy_usage_count desc,
		 load_type desc
        `;
      queryParams = [build];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page2/distinctarea", async (req, res) => {
  try {
    const { build, loadtype } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
	distinct area 
from
	smart.smart_energy_mdb_by_month
        `;
    } else {
      queryStr = `
      select
      distinct area 
    from
      smart.smart_energy_mdb_by_month
    where 
      building = $1
      and
      load_type = $2
        `;
      queryParams = [build, loadtype];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page2/table2", async (req, res) => {
  try {
    const { build, loadtype, area } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
      *
    from
      smart.smart_energy_mdb_by_month
    order by
    energy_cost_baht desc
        `;
    } else {
      queryStr = `
      select
      *
    from
      smart.smart_energy_mdb_by_month
    where
      month_code = (
      select
        MAX(month_code)
      from
        smart.smart_energy_mdb_by_month)
      and
      building = $1
      and
      load_type = $2
      and 
      area = $3
    order by
    energy_cost_baht desc
        `;
      queryParams = [build, loadtype, area];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page2/plot2", async (req, res) => {
  try {
    const { build, loadtype, area, mdb_code } = req.query;

    let queryStr = `
      SELECT
        month_code,
        sum(diff_energy_usage) AS diff_energy_usage
      FROM
        smart.smart_energy_mdb_by_month
      WHERE`;

    let queryParams = [];

    if (build === "ALL") {
      queryStr += `
        load_type = $1
        AND
        area = $2
        GROUP BY
          month_code
        ORDER BY
          month_code ASC;
      `;
      queryParams = [loadtype, area];
    } else {
      queryStr += `
        building = $1
        AND
        load_type = $2
        AND
        area = $3
        ${mdb_code !== undefined ? "AND mdb_code = $4" : ""}
        GROUP BY
          month_code
        ORDER BY
          month_code ASC;
      `;
      queryParams =
        mdb_code !== undefined
          ? [build, loadtype, area, mdb_code]
          : [build, loadtype, area];
    }
    console.log(queryStr);
    console.log(queryParams);

    const result = await query(queryStr, queryParams);
    console.log(result);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page3/distinctDept", async (req, res) => {
  try {
    const result = await query(`
    SELECT distinct dept_2 
FROM smart.smart_energy_mdb_by_month
order by dept_2 asc
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page3/table", async (req, res) => {
  try {
    const { dept } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (dept === "ALL") {
      queryStr = `
      select
	ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
	month_code,
	load_type,
	dept_2,
	sum(diff_energy_usage) as diff_energy_usage,
	sum(energy_cost_baht) as energy_cost_baht
from
	smart.smart_energy_mdb_by_month
where
	month_code = (
	select
		MAX(month_code)
	from
		smart.smart_energy_mdb_by_month)
group by
	month_code,
	dept_2,
	load_type
order by
	month_code asc
        `;
    } else {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      month_code,
      load_type,
      dept_2,
      sum(diff_energy_usage) as diff_energy_usage,
      sum(energy_cost_baht) as energy_cost_baht
    from
      smart.smart_energy_mdb_by_month
    where
      month_code = (
      select
        MAX(month_code)
      from
        smart.smart_energy_mdb_by_month)
      and dept_2 = $1
    group by
      month_code,
      dept_2,
      load_type
    order by
      month_code asc
        `;
      queryParams = [dept];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page3/distinctbuild", async (req, res) => {
  try {
    const { dept, loadtype } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (dept === "ALL") {
      queryStr = `
      select
	distinct building 
from
	smart.smart_energy_mdb_by_month
where 
      load_type = $1
        `;
      queryParams = [loadtype];
    } else {
      queryStr = `
      select
      distinct building 
    from
      smart.smart_energy_mdb_by_month
    where 
      dept_2 = $1
      and
      load_type = $2
        `;
      queryParams = [dept, loadtype];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page3/table2", async (req, res) => {
  try {
    const { dept, loadtype, build } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
      select
      *
    from
      smart.smart_energy_mdb_by_month
    where 
      dept_2 = $1
      and
      load_type = $2
      and
      building = $3
    order by
         "month" asc
        `;
    queryParams = [dept, loadtype, build];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page3/plot2", async (req, res) => {
  try {
    const { build, loadtype, dept } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (dept === "ALL") {
      queryStr = `
      select
      month_code,
      sum(diff_energy_usage) as diff_energy_usage
    from
      smart.smart_energy_mdb_by_month
    where 
      building = $1
      and
      load_type = $2
    group by 
      month_code 
    order by
         month_code asc
        `;
      queryParams = [build, loadtype];
    } else {
      queryStr = `
      select
      month_code,
      sum(diff_energy_usage) as diff_energy_usage
    from
      smart.smart_energy_mdb_by_month
    where 
      building = $1
      and
      load_type = $2
      and 
      dept_2 = $3
    group by 
      month_code 
    order by
         month_code asc
        `;
      queryParams = [build, loadtype, dept];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page5/plot", async (req, res) => {
  try {
    const { dept, build } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    SELECT
    ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
    month_code,
    load_type,
    area,
    dept_2,
    building,
    sum(diff_energy_usage) AS diff_energy_usage,
    ${
      build !== "ALL"
        ? "concat(load_type, ',', area) AS area_load_type"
        : "concat(load_type, ',', building , ',', area) AS area_load_type"
    }
FROM 
    smart.smart_energy_mdb_by_month
WHERE
    month_code = (
        SELECT MAX(month_code)
        FROM smart.smart_energy_mdb_by_month
    )
    AND dept_2 = $1
    ${build !== "ALL" ? "AND building = $2" : ""}
GROUP BY
    month_code,
    dept_2,
    load_type,
    area,
    building
ORDER BY
    month_code ASC;
    `;
    queryParams = build !== "ALL" ? [dept, build] : [dept];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page5/distinctloadtype", async (req, res) => {
  try {
    const { dept, build } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
    distinct load_type  
  from
    smart.smart_energy_mdb_by_month
  where
    dept_2 = $1
    and building = $2
        `;
    queryParams = [dept, build];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page5/distinctarea", async (req, res) => {
  try {
    const { dept, build, load_type } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
    distinct  area 
  from
    smart.smart_energy_mdb_by_month
  where
    dept_2 = $1
    and building = $2
    and load_type = $3
        `;
    queryParams = [dept, build, load_type];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page5/plotbyarea", async (req, res) => {
  try {
    const { dept, build, load_type, area } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    SELECT
  month_code,
  SUM(diff_energy_usage) AS diff_energy_usage
FROM
  smart.smart_energy_mdb_by_month
WHERE
  dept_2 = $1
  AND building = $2
  AND load_type = $3
  AND area = $4
GROUP BY
  month_code
ORDER BY
  month_code ASC;
    `;
    queryParams =
      build !== "ALL"
        ? [dept, build, load_type, area]
        : [dept, load_type, area];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


module.exports = router;
