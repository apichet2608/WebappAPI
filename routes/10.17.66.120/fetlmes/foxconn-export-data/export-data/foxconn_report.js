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

router.get("/distinct_product_name", async (req, res) => {
  try {
    const { startdate, stopdate } = req.query;
    let query = `
    with
    tablemain as (
        select
            t.update_date,
            --for filter
            t.product_name,
            t.lot_no,
            t.sheet_no,
            t.bin,
            t.td_1_2,
            t.md_1_2,
            t.total_qty,
            t.good_qty,
            t.fail_qty,
            t.lss_badmark_result,
            t.pack_sht_qty,
            t.pack_good_qty,
            t.pack_dc,
            t.pack_date_label,
            t.box_fjk_no,
            t.box_good_qty,
            t.box_dc,
            t.box_date_label,
            t.invoice_no,
            r.td_1,
            r.td_2,
            r.md_1,
            r.md_2,
            l.pkg_id,
            b.box_id
        from
            foxconn.foxconn_report t
            left join foxconn.foxconn_3d_raw r on t.sheet_no = r.sheet_no
            left join foxconn.foxconn_label l on t.pack_wh = l.key_1
            left join foxconn.foxconn_label_box b on t.box_fjk_no = b.key_2
            and t.product_name = b.mfg
            where
            	t.update_date::date >= $1
            	and t.update_date::date <= $2
        order by
            t.update_date desc,
            t.product_name asc,
            t.lot_no asc,
            t.sheet_no asc,
            t.total_qty asc,
            t.good_qty asc,
            t.fail_qty asc
    )
select distinct
    t.product_name
from
    tablemain t
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

router.get("/distinct_lot_no", async (req, res) => {
  try {
    const { startdate, stopdate, product_name } = req.query;
    let query = `
    with
    tablemain as (
        select
            t.update_date,
            --for filter
            t.product_name,
            t.lot_no,
            t.sheet_no,
            t.bin,
            t.td_1_2,
            t.md_1_2,
            t.total_qty,
            t.good_qty,
            t.fail_qty,
            t.lss_badmark_result,
            t.pack_sht_qty,
            t.pack_good_qty,
            t.pack_dc,
            t.pack_date_label,
            t.box_fjk_no,
            t.box_good_qty,
            t.box_dc,
            t.box_date_label,
            t.invoice_no,
            r.td_1,
            r.td_2,
            r.md_1,
            r.md_2,
            l.pkg_id,
            b.box_id
        from
            foxconn.foxconn_report t
            left join foxconn.foxconn_3d_raw r on t.sheet_no = r.sheet_no
            left join foxconn.foxconn_label l on t.pack_wh = l.key_1
            left join foxconn.foxconn_label_box b on t.box_fjk_no = b.key_2
            and t.product_name = b.mfg
            where
            	t.update_date::date >= $1
            	and t.update_date::date <= $2
        order by
            t.update_date desc,
            t.product_name asc,
            t.lot_no asc,
            t.sheet_no asc,
            t.total_qty asc,
            t.good_qty asc,
            t.fail_qty asc
    )
select distinct
    t.lot_no
from
    tablemain t
    `;

    const queryParams = [startdate, stopdate];
    if (product_name && product_name !== "ALL") {
      query += `WHERE t.product_name = $${queryParams.length + 1}
      `;
      queryParams.push(product_name);
    }
    // console.log(query);
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/tableDataExport", async (req, res) => {
  try {
    const { startdate, stopdate, product_name, lot_no } = req.query;
    let query = `
    select
    ROW_NUMBER() OVER () AS id,
    t.update_date,
    --for filter
    t.product_name,
    t.lot_no,
    t.sheet_no,
    t.bin,
    t.td_1_2,
    t.md_1_2,
    t.total_qty,
    t.good_qty,
    t.fail_qty,
    t.lss_badmark_result,
    t.pack_sht_qty,
    t.pack_good_qty,
    t.pack_dc,
    t.pack_date_label,
    t.box_fjk_no,
    t.box_good_qty,
    t.box_dc,
    t.box_date_label,
    t.invoice_no,
    r.td_1,
    r.td_2,
    r.md_1,
    r.md_2,
    l.pkg_id,
    b.box_id
from
    foxconn.foxconn_report t
    left join foxconn.foxconn_3d_raw r on t.sheet_no = r.sheet_no
    left join foxconn.foxconn_label l on t.pack_wh = l.key_1
    left join foxconn.foxconn_label_box b on t.box_fjk_no = b.key_2
    and t.product_name = b.mfg
    where
    	t.update_date::date >= $1
    	and t.update_date::date <= $2
    `;

    const queryParams = [startdate, stopdate];
    if (product_name && product_name !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` t.product_name = $${queryParams.length + 1}
      `;
      queryParams.push(product_name);
    }

    if (lot_no && lot_no !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` t.lot_no = $${queryParams.length + 1}
      `;
      queryParams.push(lot_no);
    }

    query += `
    order by
    t.update_date desc,
    t.product_name asc,
    t.lot_no asc,
    t.sheet_no asc,
    t.total_qty asc,
    t.good_qty asc,
    t.fail_qty asc
    `;

    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
