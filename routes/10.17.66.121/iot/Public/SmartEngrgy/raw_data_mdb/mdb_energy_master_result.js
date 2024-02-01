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

const query = (text, params) => pool.query(text, params);

router.get("/distinctmdb_code", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct mdb_code
    from
      public.mdb_energy_master_result
    order by mdb_code asc 
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/table", async (req, res) => {
  try {
    const { startdate, stopdate, mdb_code } = req.query;

    let queryStr = `
    select
    *
  from
    public.mdb_energy_master_result
  where 
    create_at::date  >= $1 and create_at::date <= $2 
          `;

    let queryParams = [];
    queryParams.push(startdate, stopdate);
    if (mdb_code !== "ALL") {
      queryStr += `
      and mdb_code = $3
            `;

      queryParams.push(mdb_code);
    }

    queryStr += `
    order by create_at asc
          `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
