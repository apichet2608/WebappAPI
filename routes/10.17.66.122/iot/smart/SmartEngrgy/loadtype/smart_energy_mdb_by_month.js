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

router.get("/tableselectbuild", async (req, res) => {
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

router.get("/distinctarea", async (req, res) => {
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

router.get("/tableselectArea", async (req, res) => {
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

router.get("/plotBar", async (req, res) => {
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

module.exports = router;
