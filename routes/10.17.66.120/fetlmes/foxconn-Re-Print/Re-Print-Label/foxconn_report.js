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

router.get("/reprintlabel", async (req, res) => {
  try {
    const { lot_no } = req.query;

    let queryStr = `
   select
	distinct
	r.product_name ,
	r.lot_no ,
	l.key_1 as pack_id ,
	l.pkg_id ,
	b.key_2 as box_no ,
	b.box_id
from
	foxconn.foxconn_report r
left join
	foxconn.foxconn_label l
	on r.pack_wh = l.key_1
left join
	foxconn.foxconn_label_box b
	on r.box_fjk_no = b.key_2
	and r.product_name = b.mfg
where
	l.key_1 is not null
`;

    let queryParams = [];

    if (lot_no) {
      queryStr += `
          AND r.lot_no = $${queryParams.length + 1}
        `;
      queryParams.push(lot_no);
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
