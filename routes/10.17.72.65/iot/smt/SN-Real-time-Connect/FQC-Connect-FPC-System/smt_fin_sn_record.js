const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.72.65",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

router.get("/tablerealtimeComplete", async (req, res) => {
  try {
    const result = await pool.query(
      `select
	    id,
	    sn,
	    "time",
	    machine_no,
	    lot_no,
	    op_id,
	    partial_no,
	    total_pcs,
	    update_flg
    from
	    smt.smt_fin_sn_record
        where 
	    update_flg = 'Y'
    order by "time" :: timestamp desc ,
    id desc
    limit 500
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/tablerealtimeIncomplete", async (req, res) => {
  try {
    const result = await pool.query(
      `select
	    id,
	    sn,
	    "time",
	    machine_no,
	    lot_no,
	    op_id,
	    partial_no,
	    total_pcs,
	    max_id,
	    update_flg
    from
	    smt.smt_fin_sn_record
    where 
	    update_flg is null
    order by "time" :: timestamp desc
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});
module.exports = router;
