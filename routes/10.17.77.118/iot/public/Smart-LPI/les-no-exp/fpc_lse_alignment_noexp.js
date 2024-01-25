const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.118",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinctfactory", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct factory
    from
      public.fpc_lse_alignment_noexp
    order by 
      factory 
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctmc_code", async (req, res) => {
  try {
    const { factory } = req.query;
    let queryStr = `
      select distinct mc_code
      from public.fpc_lse_alignment_noexp
    `;

    let queryParams = [];
    let queryIndex = 1;

    if (factory !== "ALL") {
      queryStr += `
        where factory = $${queryIndex}
      `;
      queryParams.push(factory);
      queryIndex++;
    }

    queryStr += `
      order by mc_code desc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctprocess", async (req, res) => {
  try {
    const { factory, mc_code } = req.query;
    let queryStr = `
      select distinct process
      from public.fpc_lse_alignment_noexp
    `;

    let queryParams = [];
    let queryIndex = 1;

    if (factory !== "ALL") {
      queryStr += `
        where factory = $${queryIndex}
      `;
      queryParams.push(factory);
      queryIndex++;
    }

    if (mc_code !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
          where mc_code = $${queryIndex}
        `;
      } else {
        queryStr += `
          and mc_code = $${queryIndex}
        `;
      }
      queryParams.push(mc_code);
      queryIndex++;
    }

    queryStr += `
      order by process desc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctpos_no", async (req, res) => {
  try {
    const { factory, mc_code, process } = req.query;
    let queryStr = `
      select distinct pos_no
      from public.fpc_lse_alignment_noexp
    `;

    let queryParams = [];
    let queryIndex = 1; // เพิ่มตัวแปร queryIndex เพื่อจัดการเลข index ของพารามิเตอร์

    if (factory !== "ALL") {
      queryStr += `
        where factory = $${queryIndex}
      `;
      queryParams.push(factory);
      queryIndex++;
    }

    if (mc_code !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
          where mc_code = $${queryIndex}
        `;
      } else {
        queryStr += `
          and mc_code = $${queryIndex}
        `;
      }
      queryParams.push(mc_code);
      queryIndex++;
    }

    if (process !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND
        `;
      } else {
        queryStr += `
          WHERE
        `;
      }
      queryStr += `
        process = $${queryIndex}
      `;
      queryParams.push(process);
    }

    queryStr += `
      order by pos_no desc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctproduct_name", async (req, res) => {
  try {
    const { factory, mc_code, process, pos_no } = req.query;
    let queryStr = `
      select distinct product_name
      from public.fpc_lse_alignment_noexp
    `;

    let queryParams = [];
    let queryIndex = 1; // เพิ่มตัวแปร queryIndex เพื่อจัดการเลข index ของพารามิเตอร์

    if (factory !== "ALL") {
      queryStr += `
        where factory = $${queryIndex}
      `;
      queryParams.push(factory);
      queryIndex++;
    }

    if (mc_code !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
          where mc_code = $${queryIndex}
        `;
      } else {
        queryStr += `
          and mc_code = $${queryIndex}
        `;
      }
      queryParams.push(mc_code);
      queryIndex++;
    }

    if (process !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND
        `;
      } else {
        queryStr += `
          WHERE
        `;
      }
      queryStr += `
        process = $${queryIndex}
      `;
      queryParams.push(process);
    }

    if (pos_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND
        `;
      } else {
        queryStr += `
          WHERE
        `;
      }
      queryStr += `
      pos_no = $${queryIndex}
      `;
      queryParams.push(pos_no);
    }
    queryStr += `
      order by product_name desc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/table", async (req, res) => {
  try {
    const { factory, mc_code, process, pos_no } = req.query;

    let queryStr = `
      select *
      from public.fpc_lse_alignment_noexp
    `;

    let queryParams = [];
    let queryIndex = 1;

    if (factory !== "ALL") {
      queryStr += `
        where factory = $${queryIndex}
      `;
      queryParams.push(factory);
      queryIndex++;
    }

    if (mc_code !== "ALL") {
      if (queryParams.length === 0) {
        ptime;
      } else {
        queryStr += `
          and mc_code = $${queryIndex}
        `;
      }
      queryParams.push(mc_code);
      queryIndex++;
    }

    if (process !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
          where process = $${queryIndex}
        `;
      } else {
        queryStr += `
          and process = $${queryIndex}
        `;
      }
      queryParams.push(process);
      queryIndex++;
    }

    if (pos_no !== "ALL") {
      if (queryParams.length === 0) {
        queryStr += `
          where pos_no = $${queryIndex}
        `;
      } else {
        queryStr += `
          and pos_no = $${queryIndex}
        `;
      }
      queryParams.push(pos_no);
      queryIndex++;
    }
    queryStr += `
    order by ptime DESC
  `;
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
