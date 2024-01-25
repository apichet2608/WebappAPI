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

router.get("/distinct_product", async (req, res) => {
  try {
    const { startdate, stopdate } = req.query;
    let query = `
    select
	distinct t.product
from
	(
with first_sub as (
	select
		t.update_date ,
		t.product,
		t.data_upload_date as create_date,
		t.id_topic,
		t.sub_lot,
		t.lot,
		h.report_phase,
		t.test_topic,
		t.status_file,
		(
		select
			sub.data_upload_date
		from
			smart.smart_ok2s_status_summary sub
		where
			sub.update_date = t.update_date
			and sub.product = t.product
			and sub.id_topic = t.id_topic
			and sub.sub_lot = t.sub_lot
			and sub.lot = t.lot
			and sub.test_topic = t.test_topic
			and sub.data_upload_date is not null
		limit 1

    ) as first_non_null_date
	from
		smart.smart_ok2s_status_summary t
	inner join

    smart.smart_ok2s_status_header h

    on
		t.id_topic = h.id_topic
	order by
		t.sub_lot asc,
		t.id_topic asc

)

,
	second_sub as (
	select
		sq1.update_date ,
		sq1.product ,
		sq1.id_topic ,
		sq1.sub_lot ,
		sq1.lot ,
		sq1.report_phase ,
		sq1.test_topic ,
		sq1.first_non_null_date as create_date ,
		sq1.status_file ,
		count(*) over (

      partition by sq1.update_date,
		sq1.product,
		sq1.id_topic,
		sq1.sub_lot,
		sq1.lot,
		sq1.report_phase,
		coalesce (sq1.first_non_null_date,
		'1900-01-01')

    ) as count
	from
		first_sub sq1
	group by
		sq1.update_date ,
		sq1.product ,
		sq1.id_topic ,
		sq1.sub_lot ,
		sq1.lot ,
		sq1.report_phase ,
		sq1.test_topic ,
		sq1.first_non_null_date ,
		sq1.status_file
	order by
		sq1.sub_lot asc,
		sq1.id_topic asc

)

,
	third_sub as (
	select
		distinct 

sq2.update_date ,
		sq2.product ,
		sq2.create_date ,
		sq2.id_topic ,
		sq2.sub_lot ,
		sq2.lot ,
		sq2.report_phase ,
		sq2.test_topic ,
		sq2.count
	from
		second_sub sq2
	order by
		sq2.sub_lot asc ,
		sq2.id_topic asc 

)

,
	forth_sub as (
	select
		sq3.update_date ,
		sq3.product ,
		sq3.create_date ,
		sq3.id_topic ,
		sq3.sub_lot ,
		sq3.lot ,
		sq3.report_phase ,
		sq3.test_topic ,
		case
			when sq3.count > 1
				and sq3.create_date is not null then 'wait'
				when sq3.count = 1
				and sq3.create_date is not null then 'finished'
				else 'wait'
			end as status
		from
			third_sub sq3
		order by
			sq3.sub_lot asc ,
			sq3.id_topic asc 

)

,
	fifth_sub as (
	select
		sq4.* ,
		case
			when sq4.report_phase = 'First report'
				and sq4.status = 'finished' then 'finished'
				else 'wait'
			end as first_report ,
			case
				when sq4.report_phase = 'Final report'
				and sq4.status = 'finished' then 'finished'
				else 'wait'
			end as final_report
		from
			forth_sub sq4
		order by
			sq4.sub_lot asc ,
			sq4.id_topic asc 

)

,
	sixth_sub as (
	select
		sq5.update_date ,
		sq5.product ,
		sq5.sub_lot ,
		sq5.lot ,
		sq5.status ,
		sq5.first_report ,
		sq5.final_report ,
		count (*) over (partition by sq5.update_date,
		sq5.product,
		sq5.sub_lot,
		sq5.lot ) as count_status ,
		count (*) over (partition by sq5.update_date,
		sq5.product,
		sq5.sub_lot,
		sq5.lot,
		sq5.first_report ) as count_first ,
		count (*) over (partition by sq5.update_date,
		sq5.product,
		sq5.sub_lot,
		sq5.lot,
		sq5.final_report ) as count_final
	from
		fifth_sub sq5
	group by
		sq5.update_date ,
		sq5.product ,
		sq5.sub_lot ,
		sq5.lot ,
		sq5.status ,
		sq5.first_report ,
		sq5.final_report 

)
	select
		sq6.update_date ,
		sq6.product ,
		sq6.sub_lot ,
		sq6.lot ,
		case
			when sq6.status = 'finished'
			and sq6.count_status = 1 then 'finished'
			else 'wait'
		end as status ,
		case
			when sq6.first_report = 'finished'
			and sq6.count_first = 1 then 'finished'
			else 'wait'
		end as first_report ,
		case
			when sq6.final_report = 'finished'
			and sq6.count_final = 1 then 'finished'
			else 'wait'
		end as final_report
	from
		sixth_sub sq6
	order by
		sq6.update_date desc
) as t
where
	t.update_date::date >= $1
	and t.update_date::date <= $2
order by
	t.product desc;

    `;

    const queryParams = [startdate, stopdate];

    // console.log(query);
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table_Summary_report", async (req, res) => {
  try {
    const { startdate, stopdate, product } = req.query;
    let query = `
    select
	row_number() over () as id,
	*
from
	(
with first_sub as (
	select
		t.update_date ,
		t.product,
		t.data_upload_date as create_date,
		t.id_topic,
		t.sub_lot,
		t.lot,
		h.report_phase,
		t.test_topic,
		t.status_file,
		(
		select
			sub.data_upload_date
		from
			smart.smart_ok2s_status_summary sub
		where
			sub.update_date = t.update_date
			and sub.product = t.product
			and sub.id_topic = t.id_topic
			and sub.sub_lot = t.sub_lot
			and sub.lot = t.lot
			and sub.test_topic = t.test_topic
			and sub.data_upload_date is not null
		limit 1

    ) as first_non_null_date
	from
		smart.smart_ok2s_status_summary t
	inner join

    smart.smart_ok2s_status_header h

    on
		t.id_topic = h.id_topic
	order by
		t.sub_lot asc,
		t.id_topic asc

)

,
	second_sub as (
	select
		sq1.update_date ,
		sq1.product ,
		sq1.id_topic ,
		sq1.sub_lot ,
		sq1.lot ,
		sq1.report_phase ,
		sq1.test_topic ,
		sq1.first_non_null_date as create_date ,
		sq1.status_file ,
		count(*) over (

      partition by sq1.update_date,
		sq1.product,
		sq1.id_topic,
		sq1.sub_lot,
		sq1.lot,
		sq1.report_phase,
		coalesce (sq1.first_non_null_date,
		'1900-01-01')

    ) as count
	from
		first_sub sq1
	group by
		sq1.update_date ,
		sq1.product ,
		sq1.id_topic ,
		sq1.sub_lot ,
		sq1.lot ,
		sq1.report_phase ,
		sq1.test_topic ,
		sq1.first_non_null_date ,
		sq1.status_file
	order by
		sq1.sub_lot asc,
		sq1.id_topic asc

)

,
	third_sub as (
	select
		distinct 

sq2.update_date ,
		sq2.product ,
		sq2.create_date ,
		sq2.id_topic ,
		sq2.sub_lot ,
		sq2.lot ,
		sq2.report_phase ,
		sq2.test_topic ,
		sq2.count
	from
		second_sub sq2
	order by
		sq2.sub_lot asc ,
		sq2.id_topic asc 

)

,
	forth_sub as (
	select
		sq3.update_date ,
		sq3.product ,
		sq3.create_date ,
		sq3.id_topic ,
		sq3.sub_lot ,
		sq3.lot ,
		sq3.report_phase ,
		sq3.test_topic ,
		case
			when sq3.count > 1
				and sq3.create_date is not null then 'wait'
				when sq3.count = 1
				and sq3.create_date is not null then 'finished'
				else 'wait'
			end as status
		from
			third_sub sq3
		order by
			sq3.sub_lot asc ,
			sq3.id_topic asc 

)

,
	fifth_sub as (
	select
		sq4.* ,
		case
			when sq4.report_phase = 'First report'
				and sq4.status = 'finished' then 'finished'
				else 'wait'
			end as first_report ,
			case
				when sq4.report_phase = 'Final report'
				and sq4.status = 'finished' then 'finished'
				else 'wait'
			end as final_report
		from
			forth_sub sq4
		order by
			sq4.sub_lot asc ,
			sq4.id_topic asc 

)

,
	sixth_sub as (
	select
		sq5.update_date ,
		sq5.product ,
		sq5.sub_lot ,
		sq5.lot ,
		sq5.status ,
		sq5.first_report ,
		sq5.final_report ,
		count (*) over (partition by sq5.update_date,
		sq5.product,
		sq5.sub_lot,
		sq5.lot ) as count_status ,
		count (*) over (partition by sq5.update_date,
		sq5.product,
		sq5.sub_lot,
		sq5.lot,
		sq5.first_report ) as count_first ,
		count (*) over (partition by sq5.update_date,
		sq5.product,
		sq5.sub_lot,
		sq5.lot,
		sq5.final_report ) as count_final
	from
		fifth_sub sq5
	group by
		sq5.update_date ,
		sq5.product ,
		sq5.sub_lot ,
		sq5.lot ,
		sq5.status ,
		sq5.first_report ,
		sq5.final_report 

)
	select
		sq6.update_date ,
		sq6.product ,
		sq6.sub_lot ,
		sq6.lot ,
		case
			when sq6.status = 'finished'
			and sq6.count_status = 1 then 'finished'
			else 'wait'
		end as status ,
		case
			when sq6.first_report = 'finished'
			and sq6.count_first = 1 then 'finished'
			else 'wait'
		end as first_report ,
		case
			when sq6.final_report = 'finished'
			and sq6.count_final = 1 then 'finished'
			else 'wait'
		end as final_report
	from
		sixth_sub sq6
	order by
		sq6.update_date desc
) as t
where
	t.update_date::date >= $1
	and t.update_date::date <= $2
    `;

    const queryParams = [startdate, stopdate];
    if (product && product !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` t.product = $${queryParams.length + 1}
      `;
      queryParams.push(product);
    }

    query += `
    order by
	t.product desc
    `;

    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table_Status_detail", async (req, res) => {
  try {
    const { sub_lot } = req.query;
    let query = `
    select
	row_number() over () as id,
	*
from
	(
with first_sub as (
	select
		t.update_date ,
		t.product,
		t.data_upload_date as create_date,
		t.id_topic,
		t.sub_lot,
		t.lot,
		h.report_phase,
		t.test_topic,
		t.status_file,
		(
		select
			sub.data_upload_date
		from
			smart.smart_ok2s_status_summary sub
		where
			sub.update_date = t.update_date
			and sub.product = t.product
			and sub.id_topic = t.id_topic
			and sub.sub_lot = t.sub_lot
			and sub.lot = t.lot
			and sub.test_topic = t.test_topic
			and sub.data_upload_date is not null
		limit 1

    ) as first_non_null_date
	from
		smart.smart_ok2s_status_summary t
	inner join

    smart.smart_ok2s_status_header h

    on
		t.id_topic = h.id_topic
	order by
		t.sub_lot asc,
		t.id_topic asc

)
,
	second_sub as (
	select
		sq1.update_date ,
		sq1.product ,
		sq1.id_topic ,
		sq1.sub_lot ,
		sq1.lot ,
		sq1.report_phase ,
		sq1.test_topic ,
		sq1.first_non_null_date as create_date ,
		sq1.status_file ,
		count(*) over (

      partition by sq1.update_date,
		sq1.product,
		sq1.id_topic,
		sq1.sub_lot,
		sq1.lot,
		sq1.report_phase,
		coalesce (sq1.first_non_null_date,
		'1900-01-01')

    ) as count
	from
		first_sub sq1
	group by
		sq1.update_date ,
		sq1.product ,
		sq1.id_topic ,
		sq1.sub_lot ,
		sq1.lot ,
		sq1.report_phase ,
		sq1.test_topic ,
		sq1.first_non_null_date ,
		sq1.status_file
	order by
		sq1.sub_lot asc,
		sq1.id_topic asc

)
,
	third_sub as (
	select
		distinct 

sq2.update_date ,
		sq2.product ,
		sq2.create_date ,
		sq2.id_topic ,
		sq2.sub_lot ,
		sq2.lot ,
		sq2.report_phase ,
		sq2.test_topic ,
		sq2.count
	from
		second_sub sq2
	order by
		sq2.sub_lot asc ,
		sq2.id_topic asc 

)
,
	forth_sub as (
	select
		sq3.update_date ,
		sq3.product ,
		sq3.create_date ,
		sq3.id_topic ,
		sq3.sub_lot ,
		sq3.lot ,
		sq3.report_phase ,
		sq3.test_topic ,
		case
			when sq3.count > 1
				and sq3.create_date is not null then 'wait'
				when sq3.count = 1
				and sq3.create_date is not null then 'finished'
				else 'wait'
			end as status
		from
			third_sub sq3
		order by
			sq3.sub_lot asc ,
			sq3.id_topic asc 
)
	select
		sq4.* ,
		case
			when sq4.report_phase = 'First report'
			and sq4.status = 'finished' then 'finished'
			else 'wait'
		end as first_report ,
		case
			when sq4.report_phase = 'Final report'
			and sq4.status = 'finished' then 'finished'
			else 'wait'
		end as final_report
	from
		forth_sub sq4
	order by
		sq4.sub_lot asc ,
		sq4.id_topic asc 
) as t

    `;

    const queryParams = [];

	 if (sub_lot && sub_lot !== "") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` t.sub_lot = $${queryParams.length + 1}
      `;
      queryParams.push(sub_lot);
    }

    query += `
    order by
	t.product desc;
    `;

    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table_Status_Page_detail", async (req, res) => {
  try {
    const { sub_lot ,test_topic } = req.query;
    let query = `
    select
	row_number() over () as id,
t.sub_lot ,
t.id_topic ,
t.test_topic ,
t.ipqc_code ,
t.side ,
t.proc_order ,
t.status_file ,
t.data_upload_date 
from 
smart.smart_ok2s_status_summary t

    `;

    const queryParams = [];

	 if (sub_lot && sub_lot !== "") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` t.sub_lot = $${queryParams.length + 1}
      `;
      queryParams.push(sub_lot);
    }
	 if (test_topic && test_topic !== "") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` t.test_topic = $${queryParams.length + 1}
      `;
      queryParams.push(test_topic);
    }
    query += `
    order by
	t.product desc;
    `;

    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});


module.exports = router;
