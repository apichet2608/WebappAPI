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



router.get("/dataprint", async (req, res) => {
  try {
    let queryStr = `
   select distinct key_1
  from
	foxconn.foxconn_label
  order by key_1 desc`;
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
