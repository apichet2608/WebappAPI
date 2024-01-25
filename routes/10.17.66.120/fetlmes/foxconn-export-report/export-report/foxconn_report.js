const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.120",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "fetlmes",
});

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "fujikura",
//   database: "postgres", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
// });

const query = (text, params) => pool.query(text, params);



router.get("/csv1", async (req, res) => {
  try {
    const { lot_no,box_fjk_no } = req.query;

    let queryStr = `
   select
	'Detail' as "Detail" ,
	b.box_id as "Box No." ,
	b.mfg as "MPN" ,
	b.apn as "APN" ,
	concat ('D', replace(b.box_date_code, ',', ',D')) as "DC of BoxID" ,
	concat ('L', replace(b.lot_no, ',', ',L')) as "LC of BoxID" ,
	b.box_good_qty as "QTY of BoxID" ,
	l.pkg_id as "PKG ID" ,
	l.good_qty as "QTY of PKG ID" ,
	r.pack_sht_qty as "PQTY of PKG ID" ,
	concat ('D', replace(l.date_code , ',', ',D')) as "DC of PKG ID" ,
	concat ('L', replace(l.lot_no , ',', ',L')) as "LC of PKG ID" ,
	l.bin as "BIN" ,
	r.sheet_no as "Sheet barcode No." ,
	r.lc_of_panel_sn as "LC of Panel SN" ,
	r.good_qty as "X-up" ,
	r.fail_qty as "X-out" ,
	round (r.td_1_2::numeric ,3) as "TD1,2" ,
	round (r.md_1_2::numeric ,3) as "MD1,2" ,
	r.invoice_no as "Invoice No."
from
	foxconn.foxconn_report r
left join foxconn.foxconn_label l
	on r.pack_wh = l.key_1
left join foxconn.foxconn_label_box b
	on r.box_fjk_no = b.key_2
  and r.lot_no = b.lot_no
where  
	r.pack_wh is not null
	and r.box_fjk_no is not null
`;

    let queryParams = [];

    if (lot_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND r.lot_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          AND r.lot_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(lot_no);
    }

        if (box_fjk_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND r.box_fjk_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          AND r.box_fjk_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(box_fjk_no);
    }


    queryStr += `
      order by
	b.box_id asc ,
	l.pkg_id asc;
    `;

    // console.log(queryStr);
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/csv2", async (req, res) => {
  try {
    const { lot_no,box_fjk_no } = req.query;

    let queryStr = `
   select
	'Detail' as "Detail",
	t.lot_no as "Lot No." ,
	t.fail_qty as "X-out" ,
	t.sheet_no as "Sheet barcode No.",
	r.td_1 as "TD1" ,
	r.td_2 as "TD2" ,
	r.md_1 as "MD1" ,
	r.md_2 as "MD2" ,
	t.bin as "BIN" ,
	b.box_id as "Box No." ,
	l.pkg_id as "PKG ID" ,
	t.invoice_no as "Invoice No."
from
	foxconn.foxconn_report t
inner join
	foxconn.foxconn_3d_raw r
		on t.sheet_no = r.sheet_no
inner join
	foxconn.foxconn_label_box b
		on t.box_fjk_no = b.key_2
    and r.lot_no = b.lot_no
inner join
	foxconn.foxconn_label l
		on t.pack_wh = l.key_1
where  
	t.pack_wh is not null
	and t.box_fjk_no is not null
`;

    let queryParams = [];

    if (lot_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND t.lot_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          AND t.lot_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(lot_no);
    }

            if (box_fjk_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND t.box_fjk_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          AND t.box_fjk_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(box_fjk_no);
    }


    queryStr += `
      order by
	b.box_id asc ,
	l.pkg_id asc ,
	t.fail_qty desc
    `;

    // console.log(queryStr);
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/csv3", async (req, res) => {
  try {
    const { lot_no ,box_fjk_no } = req.query;
    const queryParams = [lot_no,box_fjk_no];
    
    const queryStr = `
      with recursive numberseq as (
select	
		0 as row_num ,
		(
	select
			max (r.total_qty)
	from
		foxconn.foxconn_report r
	where
			r.pack_wh is not null
		and r.box_fjk_no is not null
		and r.lot_no = $1
		and r.box_fjk_no = $2
		) as max_qty_lot
union all
select
		row_num + 1 ,
		max_qty_lot
from
		numberseq
where
		row_num + 1 <= max_qty_lot
),
report as (
select
	ns.row_num ,
	ns.max_qty_lot,
	(
	select
		count(*)
	from
		foxconn.foxconn_report r
	where
		r.good_qty = r.total_qty - ns.row_num
		and r.pack_wh is not null
		and r.box_fjk_no is not null
		and r.lot_no = $1
		and r.box_fjk_no = $2
		) as sheet_qty,
	    ns.max_qty_lot - ns.row_num as good_parts,
	    (ns.max_qty_lot - ns.row_num) * (
	select
		count(*)
	from
		foxconn.foxconn_report r
	where
		r.good_qty = r.total_qty - ns.row_num
		and r.pack_wh is not null
		and r.box_fjk_no is not null
		and r.lot_no = $1
		and r.box_fjk_no = $2
		) as total_good_parts,
	    ns.row_num as ng_parts,
	    (
	select
		count(*)
	from
		foxconn.foxconn_report r
	where
		r.good_qty = r.total_qty - ns.row_num
		and r.pack_wh is not null
		and r.box_fjk_no is not null
		and r.lot_no = $1
		and r.box_fjk_no = $2
		) * ns.row_num as total_ng_parts
from
	    numberseq ns
	)
select
	ps.sheet_qty,
	ps.good_parts,
	ps.total_good_parts,
	ps.ng_parts,
	ps.total_ng_parts
from
	numberseq ns
join
  report ps on
	ns.row_num = ps.row_num;
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


router.get("/textfile1", async (req, res) => {
  try {
    const { lot_no } = req.query;

    let queryStr = `
   select
	concat ('THA', substring (r.sheet_no, 13, length(r.sheet_no) - 16), r.lc_of_panel_sn ) as file_name , /*for file name only*/
	concat (r.sheet_no, replace(r.lss_badmark_result, ',','')) as txt_file /*for data in file only*/
from
	foxconn.foxconn_report r
where
	r.lss_badmark_result is not null
	and r.pack_wh is not null
	and r.box_fjk_no is not null
`;

    let queryParams = [];

    if (lot_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND r.lot_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          AND r.lot_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(lot_no);
    }

    queryStr += `
      order by
	r.lc_of_panel_sn asc,
	r.lot_no asc;
    `;

    // console.log(queryStr);
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


router.get("/CheckBoxFJKno", async (req, res) => {
  try {
    const { lot_no } = req.query;

    let queryStr = `
   SELECT
    ROW_NUMBER() OVER () AS id,
    subquery.*
FROM (
    SELECT DISTINCT
        r.lot_no,
        b.mfg AS product,
        r.box_fjk_no,
        b.box_date,
        b.bin,
        b.box_qty AS total,
        b.box_good_qty AS good,
        b.box_out_qty AS x_out
    FROM
        foxconn.foxconn_report r
    LEFT JOIN
        foxconn.foxconn_label_box b ON r.box_fjk_no = b.key_2
        and r.lot_no = b.lot_no
    WHERE
        r.lss_badmark_result IS NOT NULL
        AND r.pack_wh IS NOT NULL
        AND r.box_fjk_no IS NOT NULL
`;

    let queryParams = [];

    if (lot_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND r.lot_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          AND r.lot_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(lot_no);
    }
    queryStr += `) AS subquery;`;
    // console.log(queryStr);
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});



module.exports = router;
