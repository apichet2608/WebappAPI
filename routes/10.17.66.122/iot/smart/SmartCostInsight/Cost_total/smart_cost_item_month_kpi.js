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



router.get("/ParetoTotalByMonth", async (req, res) => {
  try {
    const {cost_type,year_month} = req.query;

    let queryParams = [];
    let queryStr = `
    select
    ROW_NUMBER() OVER () AS id,
	sq1.*
from
	(
	select
		t.factory ,
		t.year_month ,
		t.cost_type ,
		t.item_code ,
		t.item_desc ,
		sum (expense_plan) as expense_plan ,
		sum (expense_result) as expense_result
	from
		smart.smart_cost_item_month_kpi t
    where
		t.factory = 'A1'
    `;

      if (cost_type !== "ALL") {
      queryStr += `
        AND t.cost_type = $${queryParams.length + 1}
      `;
      queryParams.push(cost_type);
    }
    if (year_month !== "ALL") {
      queryStr += `
        AND TO_DATE(year_month, 'YYYY-MM-DD') = $${queryParams.length + 1}
      `;
      queryParams.push(year_month);
    }
  
  
    queryStr += `
	and division  is not null 
    group by
		t.factory ,
		t.year_month ,
		t.cost_type ,
		t.item_code ,
		t.item_desc
)sq1
order by
	sq1.year_month desc ,
	sq1.expense_result desc
limit 20
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/ParetoTotalByMonthTable", async (req, res) => {
  try {
    const {cost_type,year_month} = req.query;

    let queryParams = [];
    let queryStr = `
    select
    ROW_NUMBER() OVER () AS id,
	sq1.*
from
	(
	select
		t.factory ,
		t.year_month ,
		t.cost_type ,
		t.item_code ,
		t.item_desc ,
		sum (expense_plan) as expense_plan ,
		sum (expense_result) as expense_result
	from
		smart.smart_cost_item_month_kpi t
    where
		t.factory = 'A1'
    `;

      if (cost_type !== "ALL") {
      queryStr += `
        AND t.cost_type = $${queryParams.length + 1}
      `;
      queryParams.push(cost_type);
    }
    if (year_month !== "ALL") {
      queryStr += `
        AND TO_DATE(year_month, 'YYYY-MM-DD') = $${queryParams.length + 1}
      `;
      queryParams.push(year_month);
    }
  
  
    queryStr += `
	and division  is not null 
    group by
		t.factory ,
		t.year_month ,
		t.cost_type ,
		t.item_code ,
		t.item_desc
)sq1
order by
	sq1.year_month desc ,
	sq1.expense_result desc
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/ParetoTotalByMonthPlotArea", async (req, res) => {
  try {
    const { item_code } =
      req.query;

    let queryStr = "";
    let queryParams = [];

      queryStr = `
      SELECT
      CONCAT('ITEM - ', item_code) AS item_code,
      year_month,
      SUM(expense_plan) AS total_expense_plan,
      SUM(expense_result) AS total_expense_result
    FROM
      smart.smart_cost_item_month_kpi
    WHERE
      factory = 'A1'
      and item_code = $1
	  and division  is not null 
    GROUP BY
      item_code,
      year_month
    ORDER BY
      year_month asc;
        `;
      queryParams = [item_code];
    

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


router.get("/ParetoTotalByquarter", async (req, res) => {
//   try {
//     const {cost_type,year_month} = req.query;

//     let queryParams = [];
//     let queryStr = `
//     select
//     ROW_NUMBER() OVER () AS id,
// 	sq1.*
// from
// 	(
// 	select
// 		t.factory,
// 		case
// 			when extract(month
// 		from
// 			to_date(t.year_month,
// 			'YYYY-MM-DD')) in (4, 5, 6) then concat(extract(year
// 		from
// 			to_date(t.year_month,
// 			'YYYY-MM-DD')),
// 			'-Q1')
// 			when extract(month
// 		from
// 			to_date(t.year_month,
// 			'YYYY-MM-DD')) in (7, 8, 9) then concat(extract(year
// 		from
// 			to_date(t.year_month,
// 			'YYYY-MM-DD')),
// 			'-Q2')
// 			when extract(month
// 		from
// 			to_date(t.year_month,
// 			'YYYY-MM-DD')) in (10, 11, 12) then concat(extract(year
// 		from
// 			to_date(t.year_month,
// 			'YYYY-MM-DD')),
// 			'-Q3')
// 			when extract(month
// 		from
// 			to_date(t.year_month,
// 			'YYYY-MM-DD')) in (1, 2, 3) then concat(extract(year
// 		from
// 			to_date(t.year_month,
// 			'YYYY-MM-DD')) - 1,
// 			'-Q4')
// 		end as quarter,
// 		t.cost_type,
// 		t.item_code,
// 		t.item_desc,
// 		sum(expense_plan) as expense_plan,
// 		sum(expense_result) as expense_result
// 	from
// 		smart.smart_cost_item_month_kpi t
// 	where
// 		t.factory = 'A1'
//     `;

//       if (cost_type !== "ALL") {
//       queryStr += `
//         AND t.cost_type = $${queryParams.length + 1}
//       `;
//       queryParams.push(cost_type);
//     }
//     if (year_month !== "ALL") {
//       queryStr += `
//         AND TO_DATE(year_month, 'YYYY-MM-DD') = $${queryParams.length + 1}
//       `;
//       queryParams.push(year_month);
//     }
  
  
//     queryStr += `
//     group by
// 		t.factory,
// 		quarter,
// 		t.cost_type,
// 		t.item_code,
// 		t.item_desc

// ) as sq1
// order by
// 	quarter desc,
// 	sq1.expense_result desc
// limit 20
//     `;

//     const result = await pool.query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
try {
    const {cost_type,year_month} = req.query;

    let queryParams = [];
    let queryStr = `
    select
	sq2.*
from
	(
	select
		distinct

sq1.factory,
		sq1.quarter,
		sq1.year_month,
		sq1.cost_type,
		sq1.item_code,
		sq1.item_desc,
		sum(sq1.expense_plan) over(partition by sq1.factory, sq1.quarter, sq1.cost_type, sq1.item_code, sq1.item_desc) as expense_plan,
		sum(sq1.expense_result) over(partition by sq1.factory, sq1.quarter, sq1.cost_type, sq1.item_code, sq1.item_desc) as expense_result
	from
		(
		select
			t.factory,
			case
				when extract(month
			from
				to_date(t.year_month,
				'yyyy-mm-dd')) in (4, 5, 6) then concat(extract(year
			from
				to_date(t.year_month,
				'yyyy-mm-dd')),
				'-Q1')
				when extract(month
			from
				to_date(t.year_month,
				'yyyy-mm-dd')) in (7, 8, 9) then concat(extract(year
			from
				to_date(t.year_month,
				'yyyy-mm-dd')),
				'-Q2')
				when extract(month
			from
				to_date(t.year_month,
				'yyyy-mm-dd')) in (10, 11, 12) then concat(extract(year
			from
				to_date(t.year_month,
				'yyyy-mm-dd')),
				'-Q3')
				when extract(month
			from
				to_date(t.year_month,
				'yyyy-mm-dd')) in (1, 2, 3) then concat(extract(year
			from
				to_date(t.year_month,
				'yyyy-mm-dd')) - 1,
				'-Q4')
			end as quarter,
			t.year_month,
			t.cost_type,
			t.item_code,
			t.item_desc,
			t.expense_plan,
			t.expense_result
		from
			smart.smart_cost_item_month_kpi t

) sq1

)sq2
where
1=1
    `;

      if (cost_type !== "ALL") {
      queryStr += `
        AND sq2.cost_type = $${queryParams.length + 1}
      `;
      queryParams.push(cost_type);
    }
    if (year_month !== "ALL") {
      queryStr += `
        AND TO_DATE(sq2.year_month, 'YYYY-MM-DD') = $${queryParams.length + 1}
      `;
      queryParams.push(year_month);
    }
  
  
    queryStr += `
limit 20
    `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/TableByquarter", async (req, res) => {
try {
    const {cost_type,year_month} = req.query;

    let queryParams = [];
    let queryStr = `
   select
	factory,
	division,
	department,
	sub_department,
	cost_center,
	cost_center_name,
	item_code,
	cost_type,
	year_month,
	expense_plan,
	expense_result,
	create_at,
	item_desc,
	update_date,
	id
from
	smart.smart_cost_item_month_kpi
where
1=1
    `;

      if (cost_type !== "ALL") {
      queryStr += `
        AND cost_type = $${queryParams.length + 1}
      `;
      queryParams.push(cost_type);
    }
    if (year_month !== "ALL") {
      queryStr += `
        AND TO_DATE(year_month, 'YYYY-MM-DD') = $${queryParams.length + 1}
      `;
      queryParams.push(year_month);
    }
  
  
//     queryStr += `
// limit 20
//     `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/csvbycosttype", async (req, res) => {
try {
    const {cost_type,year_month} = req.query;

    let queryParams = [];
    let queryStr = `
   select
	factory,
	division,
	department,
	sub_department,
	cost_center,
	cost_center_name,
	item_code,
	cost_type,
	year_month,
	expense_plan,
	expense_result,
	create_at,
	item_desc,
	update_date,
	id
from
	smart.smart_cost_item_month_kpi
where
1=1
    `;

      if (cost_type !== "ALL") {
      queryStr += `
        AND cost_type = $${queryParams.length + 1}
      `;
      queryParams.push(cost_type);
    }
    // if (year_month !== "ALL") {
    //   queryStr += `
    //     AND TO_DATE(year_month, 'YYYY-MM-DD') = $${queryParams.length + 1}
    //   `;
    //   queryParams.push(year_month);
    // }
  
  
//     queryStr += `
// limit 20
//     `;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
