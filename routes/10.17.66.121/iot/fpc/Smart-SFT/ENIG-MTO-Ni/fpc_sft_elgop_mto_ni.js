const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinctmachine_no", async (req, res) => {
  try {
    const result = await query(
      `select distinct machine_no from fpc.fpc_sft_elgop_mto_ni`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctMccode", async (req, res) => {
  try {
    const { machine_no } = req.query;
    const result = await query(
      `select distinct line_no from fpc.fpc_sft_elgop_mto_ni where machine_no = $1`,
      [machine_no]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/dataplot", async (req, res) => {
  try {
    const { machine_no, line_no } = req.query;
    const day = parseInt(req.query.day); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(day)) {
      return res.status(400).send("day are required");
    }
    const result = await query(
      `select
      *
    from
      fpc.fpc_sft_elgop_mto_ni
      
    where machine_no = $1
    and line_no = $2
    and time_check :: timestamp >= (now() - interval '${day}' day)
    order by time_check asc`,
      [machine_no, line_no]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
//
module.exports = router;
