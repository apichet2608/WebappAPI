const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.230",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "fujikura",
//   database: "postgres", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
// });

const query = (text, params) => pool.query(text, params);

router.post("/insertdata", async (req, res) => {
  try {
    const { machine, rack, partial_no } = req.body;

    const result = await query(
      `insert
	into
	public.smt_plasma_sacn_mc_rack
( machine, rack, partial_no ,scan_time
	)
values($1,
$2,
$3,
now()
)`,
      [machine, rack, partial_no]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

router.get("/Tablesmt_plasma_sacn_mc_rack", async (req, res) => {
  try {
    const result = await query(
      `SELECT
    id,
    machine,
    scan_time,
    rack,
    partial_no,
    start_time,
    stop_time
FROM
    public.smt_plasma_sacn_mc_rack
where
	stop_time is null
--    stop_time  >= NOW() - INTERVAL '12' hour
order by scan_time DESC
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/checkdata", async (req, res) => {
  try {
    const { machine } = req.query;
    let queryStr = `
      SELECT distinct stop_time
      FROM public.smt_plasma_sacn_mc_rack
      WHERE machine = $1
      AND scan_time = (
        SELECT MAX(scan_time)
        FROM public.smt_plasma_sacn_mc_rack
        WHERE machine = $1
      );`;

    let queryParams = [machine];

    const result = await query(queryStr, queryParams);

    if (result.rows.length > 0) {
      // If there is data, send it as a response
      res.status(200).json(result.rows);
    } else {
      // If there is no data, send null as a response to cancel the POST request
      res.status(200).json(result.rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// DELETE route to delete data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM public.smt_plasma_sacn_mc_rack WHERE id = $1;",
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

// // UPDATE route to UPDATE data
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
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
//       `update
//       smart.smart_man_working_input
//     set
//       id_no = $1,
//       con_wk = $2,
//       date_time = $3,
//       shif = $4,
//       department = $5,
//       cc = $6,
//       process = $7,
//       select_date = $8
//       where
//         id = $9`, // Include $16 as a placeholder for id
//       [
//         id_no,
//         con_wk,
//         date_time,
//         shif,
//         department,
//         cc,
//         process,
//         select_date,
//         id, // Bind id as the 16th parameter
//       ]
//     );

//     res.status(200).json({ message: "Data updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while updating data" });
//   }
// });


//-----------------------------------page-monitor---------------------------------------------//
router.get("/table-monitor", async (req, res) => {
  try {
    const { machine } = req.query;

    let queryParams = [];
    let queryStr = `
    SELECT
    id,
    machine,
    scan_time,
    rack,
    partial_no,
    start_time,
    stop_time
FROM
    public.smt_plasma_sacn_mc_rack
where
--	stop_time is null
    stop_time  >= NOW() - INTERVAL '12' hour
    `;

    if (machine !== "ALL") {
      queryStr += `
        AND machine = $${queryParams.length + 1}
      `;
      queryParams.push(machine);
    }

  
    queryStr += `order by stop_time DESC`;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
    
    console.log("today");
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});
//-----------------------------------page-monitor---------------------------------------------//


module.exports = router;
