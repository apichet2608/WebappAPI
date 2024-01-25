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

router.get("/check_insert_or_update", async (req, res) => {
  try {
    const { id_no, shif, select_date } = req.query;
    const result = await query(
      `SELECT *
       FROM smart.smart_man_working_input
       WHERE id_no = $1
       AND shif = $2
       AND select_date = $3`,
      [id_no, shif, select_date]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.post("/insertdata", async (req, res) => {
  try {
    const {
      id_no,
      con_wk,
      date_time,
      shif,
      department,
      cc,
      process,
      select_date,
    } = req.body;

    // ตรวจสอบว่าข้อมูลที่ต้องการ insert มีอยู่แล้วหรือไม่
    const existingData = await query(
      "SELECT * FROM smart.smart_man_working_input WHERE id_no = $1 AND shif = $2 AND select_date = $3",
      [id_no, shif, select_date]
    );

    if (existingData.rows.length > 0) {
      // ถ้ามีข้อมูลอยู่แล้ว สามารถทำการอัปเดตข้อมูลได้ หรือจะทำอะไรก็ได้ตามความเหมาะสม
      res.status(201).json({ message: "Data already exists" });
    } else {
      // ถ้าไม่มีข้อมูลอยู่แล้ว ทำการ insert ข้อมูล
      const result = await query(
        `INSERT INTO smart.smart_man_working_input (id_no, con_wk, date_time, shif, department, cc, process, select_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id_no, con_wk, date_time, shif, department, cc, process, select_date]
      );

      res.status(201).json({ message: "Data added successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});


// router.post("/insertdata", async (req, res) => {
//   try {
//     const {
//       id_no,
//       con_wk,
//       date_time,
//       shif,
//       department,
//       cc,
//       process,
//       select_date,
//     } = req.body;

//     const result = await query(
//       `insert
// 	into
// 	smart.smart_man_working_input
// (id_no,
// 	con_wk,
// 	date_time,
// 	shif,
// 	department,
// 	cc,
// 	process,
// 	select_date
// 	)
// values($1,
// $2,
// $3,
// $4,
// $5,
// $6,
// $7,
// $8
// )`,
//       [id_no, con_wk, date_time, shif, department, cc, process, select_date]
//     );

//     res.status(201).json({ message: "Data added successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while adding data" });
//   }
// });

// UPDATE route to UPDATE data
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_no,
      con_wk,
      date_time,
      shif,
      department,
      cc,
      process,
      select_date,
    } = req.body;

    const result = await query(
      `update
      smart.smart_man_working_input
    set
      id_no = $1,
      con_wk = $2,
      date_time = $3,
      shif = $4,
      department = $5,
      cc = $6,
      process = $7,
      select_date = $8
      where
        id = $9`, // Include $16 as a placeholder for id
      [
        id_no,
        con_wk,
        date_time,
        shif,
        department,
        cc,
        process,
        select_date,
        id, // Bind id as the 16th parameter
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

router.get("/tableMaxDatetime", async (req, res) => {
  try {
    const { process } = req.query;
    const result = await query(
  //     `select
	// w.id_no,
	// w.con_wk,
	// w.date_time,
	// w.shif,
	// w.department,
	// w.cc,
	// w.process,
	// w.select_date,
	// w.id,
	// hr.name,
	// hr.surname,
	// hr.cost_center,
	// hr.stop_car,
	// hr.car_infor
	// -- Select all columns from smart_man_master_hr
  //   from
  //     smart.smart_man_working_input as w
  //   inner join
  //       smart.smart_man_master_hr as hr
  //   on
  //     w.id_no = hr.id_code
  //   where
  //     w.date_time::date >= (
  //     select
  //       MAX(date_time::date)
  //     from
  //       smart.smart_man_working_input
  //     where process = $1
  //       )
  //     and w.process = $1
  //   order by
  //     w.date_time::timestamp DESC
  //   `,
  `SELECT
    w.id_no,
    w.con_wk,
    w.date_time,
    w.shif,
    w.department,
    w.cc,
    w.process,
    w.select_date,
    w.id,
    hr.name,
    hr.surname,
    hr.cost_center,
    hr.stop_car,
    hr.car_infor
FROM
    smart.smart_man_working_input AS w
INNER JOIN
    smart.smart_man_master_hr AS hr
ON
    w.id_no = hr.id_code
WHERE
    TO_DATE(w.select_date, 'YYYYMMDD') >= (
        SELECT
            MAX(TO_DATE(select_date, 'YYYYMMDD'))
        FROM
            smart.smart_man_working_input
        WHERE
            process = $1
    )
    AND w.process = $1
ORDER BY
    TO_DATE(w.select_date, 'YYYYMMDD') DESC;`,
      [process]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/CardCountConwk", async (req, res) => {
  try {
    const { process } = req.query;
    const result = await query(
    //   `select
    //   con_wk as textresult,
    //   count(con_wk) as valueresult
    // from
    //   smart.smart_man_working_input
    //   where
    //   date_time::date >= (
    //   select
    //     MAX(date_time::date)
    //   from
    //     smart.smart_man_working_input
    //   where process = $1
    //     )
    //   and
    //   process = $1
    // group by
    //   con_wk
    // order by
    //   valueresult desc
  //   `select
  //   w.con_wk as textresult,
  //   count(w.con_wk) as valueresult
  // from
  //   smart.smart_man_working_input as w
  // inner join
  //         smart.smart_man_master_hr as hr
  //     on
  //   w.id_no = hr.id_code
  // where
  //   w.date_time::date >= (
  //   select
  //     MAX(date_time::date)
  //   from
  //     smart.smart_man_working_input
  //     where process = $1
  //         )
  //   and w.process = $1
  // group by
  //   w.con_wk
  // order by w.con_wk asc`
  `select
    w.con_wk as textresult,
    count(w.con_wk) as valueresult
  from
    smart.smart_man_working_input as w
  inner join
          smart.smart_man_master_hr as hr
      on
    w.id_no = hr.id_code
  where
     TO_DATE(w.select_date, 'YYYYMMDD') >= (
        SELECT
            MAX(TO_DATE(select_date, 'YYYYMMDD'))
        FROM
            smart.smart_man_working_input
        WHERE
            process = $1
    )
    AND w.process = $1
  group by
    w.con_wk
  order by w.con_wk asc`
    ,
      [process]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
