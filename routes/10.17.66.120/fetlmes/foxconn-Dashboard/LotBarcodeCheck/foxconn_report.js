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

const query = (text, params) => pool.query(text, params);

router.get("/Tablw_view", async (req, res) => {
  try {
    const { sheet_no, lot_no } = req.query;

    let queryStr = `
    select
    t.id ,
    t.product_name ,
    t.lot_no ,
    t.sheet_no ,
    t.sht_test_result ,
    t.bin ,
    t.total_qty ,
    t.good_qty ,
    t.fail_qty ,
    l.pkg_id ,
    l.qty as pack_qty,
    l.good_qty as pack_good_qty,
    l.out_qty as pack_out_qty,
    b.box_id ,
    b.box_qty ,
    b.box_good_qty ,
    b.box_out_qty ,
    t.lss_badmark_result,
    t.create_at
from
    foxconn.foxconn_report t
left join 
    foxconn.foxconn_label l
    on t.pack_wh = l.key_1 
left join
    foxconn.foxconn_label_box b
    on t.box_fjk_no = b.key_2
    and t.product_name = b.mfg`;

    let queryParams = [];

    if (lot_no) {
      if (queryParams.length > 0) {
        queryStr += `
          AND t.lot_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE t.lot_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(lot_no);
    }

    if (sheet_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND t.sheet_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE t.sheet_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(sheet_no);
    }

    queryStr += `
      order by
    case
        when t.sht_test_result = 'NG' then 1
        when t.sht_test_result is null and t.total_qty is null then 2
        when t.sht_test_result is null and t.total_qty is not null then 3
        when t.sht_test_result = 'OK' then 4
        else 5
    end ,
  t.create_at desc,
  l.pkg_id asc ,
  b.box_id asc ,
  t.create_at desc;`;

    // console.log(queryStr);
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/Card_Sumx", async (req, res) => {
  try {
    const { lot_no } = req.query;

    let queryStr = `
    select
	t.lot_no,
	count(t.sheet_no) as total_shts,
	count(case
			when t.lss_badmark_result is not null then sheet_no
		end) as shts_emap,
	count(case
			when t.sht_test_result = 'OK'
			or
			(t.sht_test_result is null and t.total_qty is not null) then sheet_no
		end) as check_shts_ok
from
	foxconn.foxconn_report t
`;

    let queryParams = [];

    if (lot_no) {
      if (queryParams.length > 0) {
        queryStr += `
          AND t.lot_no = $${queryParams.length + 1}
        `;
      } else {
        queryStr += `
          WHERE t.lot_no = $${queryParams.length + 1}
        `;
      }
      queryParams.push(lot_no);
    }

    queryStr += `
      group by
    t.lot_no;
    `;

    // console.log(queryStr);
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/Export_CSV_foxconn_report", async (req, res) => {
  try {
    let queryStr = `
    select
	*
from
	foxconn.foxconn_report`;
    let queryParams = [];
    // console.log(queryStr);
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
