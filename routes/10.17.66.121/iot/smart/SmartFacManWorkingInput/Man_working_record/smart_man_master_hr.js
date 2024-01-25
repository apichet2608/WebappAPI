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


router.get("/TableData", async (req, res) => {
  try {
    const { cost_center } = req.query;
    let queryStr = `
    select
    id_code,
    name,
    surname,
    cost_center,
    car_infor,
    stop_car,
    id
  from
    smart.smart_man_master_hr
    `;

    let queryParams = [];

    if (cost_center !== "ALL") {
      queryStr += `
        where
        cost_center = $1
      `;
      queryParams.push(cost_center);
    }

    queryStr += `
    order by 
    cost_center asc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


router.get("/distinctcost_center", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct cost_center
    from
      smart.smart_man_master_hr
    order by cost_center asc   
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
