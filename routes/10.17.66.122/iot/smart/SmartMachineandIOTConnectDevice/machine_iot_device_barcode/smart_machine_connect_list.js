const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.122",
  port: 5432,
  user: "postgres",
  password: "p45aH9c17hT11T{]",
  database: "iot",
});

// const pool = new Pool({
//   host: "127.0.0.1",
//   port: 5432,
//   user: "postgres",
//   password: "postgres",
//   database: "iot",
// });

const query = (text, params) => pool.query(text, params);

router.get("/count-status", async (req, res) => {
  try {
    const { status, item_sub_process, smart_flag, item_building, production } =
      req.query;
    let queryStr;
    const queryParams = [];

    queryStr = `SELECT
        status,
        status_count
    FROM (
        SELECT
            COALESCE(barcode, 'Total') AS status,
            COUNT(*) AS status_count
        FROM
            smart.smart_machine_connect_list
        WHERE 1=1
        AND barcode IN ('F', 'P', 'W')
        `;
    // queryParams.push(status);
    // if (status === "total") {
    //   queryStr += ` AND barcode IN ('F', 'P', 'W')`;
    // } else {
    //   queryStr += ` AND barcode = $1`;
    //   queryParams.push(status);
    // }

    if (item_sub_process !== "ALL") {
      queryStr += ` AND item_sub_process = $${queryParams.length + 1}`;
      queryParams.push(item_sub_process);
    }

    if (smart_flag !== "ALL") {
      queryStr += ` AND smart_flag = $${queryParams.length + 1}`;
      queryParams.push(smart_flag);
    }

    if (item_building !== "ALL") {
      queryStr += ` AND item_building = $${queryParams.length + 1}`;
      queryParams.push(item_building);
    }
    if (production !== "ALL") {
      queryStr += ` AND production = $${queryParams.length + 1}`;
      queryParams.push(production);
    }

    queryStr += ` GROUP BY
            GROUPING SETS ((barcode), ())
    ) AS subquery
    ORDER BY
        CASE
            WHEN status = 'Total' THEN 0
            WHEN status = 'F' THEN 1
            WHEN status = 'W' THEN 2
            WHEN status = 'P' THEN 3
            ELSE 4
            -- Handle any other cases here
        END,
        status`;
    console.log(queryStr);
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctproduction", async (req, res) => {
  try {
    const { status, smart_flag } = req.query;

    let queryStr;
    const queryParams = [];

    queryStr = `SELECT DISTINCT production FROM smart.smart_machine_connect_list`;
    if (status === "total") {
      queryStr += ` WHERE barcode IN ('F', 'P', 'W')`;
    } else {
      queryStr += ` WHERE barcode  = $1`;
      queryParams.push(status);
    }
    if (smart_flag !== "ALL") {
      queryStr += ` AND smart_flag = $${queryParams.length + 1}`;
      queryParams.push(smart_flag);
    }
    queryStr += ` ORDER BY production ASC`;
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctitem_building", async (req, res) => {
  try {
    const { status, production, smart_flag } = req.query;

    let queryStr;
    const queryParams = [];

    queryStr = `SELECT DISTINCT item_building FROM smart.smart_machine_connect_list`;

    if (status === "total") {
      // Use explicit casting for status parameter
      queryStr += ` WHERE barcode IN ('F', 'P', 'W')`;
    } else {
      queryStr += ` WHERE barcode  = $1`;
      queryParams.push(status);
    }

    if (production === "ALL") {
      queryStr += ``;
    } else {
      queryStr += queryParams.length
        ? ` AND production = $2`
        : ` AND production = $1`;
      queryParams.push(production);
    }
    if (smart_flag !== "ALL") {
      queryStr += ` AND smart_flag = $${queryParams.length + 1}`;
      queryParams.push(smart_flag);
    }
    queryStr += ` ORDER BY item_building ASC`;

    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctitem_sub_process", async (req, res) => {
  try {
    const { item_building, status, production, smart_flag } = req.query;

    let queryStr;
    const queryParams = [];

    if (status === "total") {
      queryStr = `
        SELECT DISTINCT item_sub_process
        FROM smart.smart_machine_connect_list
        WHERE barcode IN ('F', 'P', 'W')
      `;
    } else {
      queryStr = `
        SELECT DISTINCT item_sub_process
        FROM smart.smart_machine_connect_list
        WHERE barcode  = $1
      `;
      queryParams.push(status);
    }

    // Check if item_iot_group1 is not "ALL"
    if (item_building !== "ALL") {
      queryStr += ` AND item_building = $${queryParams.length + 1}`;
      queryParams.push(item_building);
    }
    if (production !== "ALL") {
      queryStr += ` AND production = $${queryParams.length + 1}`;
      queryParams.push(production);
    }
    if (smart_flag !== "ALL") {
      queryStr += ` AND smart_flag = $${queryParams.length + 1}`;
      queryParams.push(smart_flag);
    }
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctsmart_flag", async (req, res) => {
  try {
    const { item_sub_process, item_building, status, production } = req.query;

    let queryStr = `
      SELECT DISTINCT smart_flag
      FROM smart.smart_machine_connect_list
      WHERE 1=1
    `;

    const queryParams = [];

    if (item_sub_process !== "ALL") {
      queryStr += ` AND item_sub_process = $${queryParams.length + 1}`;
      queryParams.push(item_sub_process);
    }

    if (item_building !== "ALL") {
      queryStr += ` AND item_building = $${queryParams.length + 1}`;
      queryParams.push(item_building);
    }

    if (status === "total") {
      queryStr += `
        AND barcode IN ('F', 'P', 'W')
      `;
    } else {
      queryStr += ` AND barcode  = $${queryParams.length + 1}`;
      queryParams.push(status);
    }
    if (production !== "ALL") {
      queryStr += ` AND production = $${queryParams.length + 1}`;
      queryParams.push(production);
    }
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/tablescada", async (req, res) => {
  try {
    const { status, item_sub_process, smart_flag, item_building, production } =
      req.query;
    let queryStr;
    const queryParams = [];

    queryStr = `SELECT * FROM smart.smart_machine_connect_list`;
    if (status === "total") {
      queryStr += ` WHERE barcode IN ('F', 'P', 'W')`;
    } else {
      queryStr += ` WHERE barcode  = $1`;
      queryParams.push(status);
    }

    if (item_sub_process !== "ALL") {
      queryStr += ` AND item_sub_process = $${queryParams.length + 1}`;
      queryParams.push(item_sub_process);
    }

    if (smart_flag !== "ALL") {
      queryStr += ` AND smart_flag = $${queryParams.length + 1}`;
      queryParams.push(smart_flag);
    }

    if (item_building !== "ALL") {
      queryStr += ` AND item_building = $${queryParams.length + 1}`;
      queryParams.push(item_building);
    }
    if (production !== "ALL") {
      queryStr += ` AND production = $${queryParams.length + 1}`;
      queryParams.push(production);
    }

    queryStr += ` ORDER BY finish_date ASC`;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.put("/scada/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      smart_flag,
      production,
      npi_year,
      status,
      status_plc,
      plan_date,
      finish_date,
      barcode,
    } = req.body;

    const result = await query(
      `update
	    smart.smart_machine_connect_list
       set
	     smart_flag = $1,
	     production = $2,
	     npi_year = $3,
	     status = $4,
	     status_plc = $5,
	     plan_date = $6,
	     finish_date = $7,
	     barcode = $8
      where
	     id = $9`,
      [
        smart_flag,
        production,
        npi_year,
        status,
        status_plc,
        plan_date,
        finish_date,
        barcode,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

module.exports = router;
