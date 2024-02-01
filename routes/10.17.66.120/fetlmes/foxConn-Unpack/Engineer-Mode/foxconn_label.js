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
//   password: "postgres",
//   database: "postgres",
// });

const query = (text, params) => pool.query(text, params);

router.get("/Table_Check", async (req, res) => {
  try {
    const { pkg_id } = req.query;

    let query = `
    select
	distinct
	l.pkg_id ,
	l.mfg ,
	l.lot_no ,
	l.bin ,
	l.qty ,
	l.good_qty ,
	l.out_qty ,
	b.box_id
from
	foxconn.foxconn_report t
inner join foxconn.foxconn_label l
	on t.pack_wh = l.key_1
left join foxconn.foxconn_label_box b
	on t.box_fjk_no = b.key_2`;

    const queryParams = [];

    if (pkg_id) {
      if (queryParams.length > 0) {
        query += ` AND l.pkg_id = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE l.pkg_id =  $${queryParams.length + 1}`;
      }
      queryParams.push(pkg_id);
    }

    // query += `
    //   order by date_time desc
    // `;
    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
