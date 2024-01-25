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

router.get("/plot2Day", async (req, res) => {
  try {
    const { building, area } = req.query;
    let query = `
    select
	id,
	node_id,
	create_at,
	building,
	area_code,
	area,
	sensor_type,
	temp_pv,
	humid_pv,
	temp_offset,
	humid_offset
from
	env.env_temp_sensor_data
where
	create_at >= current_date - interval '2 day' -- if you want to get data from 2 days ago
    AND create_at < current_date + interval '1 day'
    `;

    const queryParams = [];

    if (building && building !== "ALL") {
      if (queryParams.length === 0) {
        query += `AND`;
      } else {
        query += `AND`;
      }
      query += ` building = $${queryParams.length + 1}
      `;
      queryParams.push(building);
    }

    if (area && area !== "ALL") {
      if (queryParams.length === 0) {
        query += `AND`;
      } else {
        query += `AND`;
      }
      query += ` area = $${queryParams.length + 1}
      `;
      queryParams.push(area);
    }

    query += `
      order by
    create_at ASC
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Table2Day", async (req, res) => {
  try {
    const { building, area } = req.query;
    let query = `
    select
	id,
	node_id,
	create_at,
	building,
	area_code,
	area,
	sensor_type,
	temp_pv,
	humid_pv,
	temp_offset,
	humid_offset
from
	env.env_temp_sensor_data
WHERE
    create_at = (
        SELECT MAX(create_at)
        FROM env.env_temp_sensor_data
    )`;

    const queryParams = [];

    if (building && building !== "ALL") {
      if (queryParams.length === 0) {
        query += `AND`;
      } else {
        query += `AND`;
      }
      query += ` building = $${queryParams.length + 1}
      `;
      queryParams.push(building);
    }

    if (area && area !== "ALL") {
      if (queryParams.length === 0) {
        query += `AND`;
      } else {
        query += `AND`;
      }
      query += ` area = $${queryParams.length + 1}
      `;
      queryParams.push(area);
    }

    query += `
      order by
    create_at DESC
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});
router.get("/distinct_building", async (req, res) => {
  try {
    let query = `
    select
	distinct building
from
	env.env_temp_sensor_data
where
	create_at >= current_date - interval '2 day'
	-- if you want to get data from 2 days ago
	and create_at < current_date + interval '1 day'
    `;

    const queryParams = [];

    query += `
      order by
	building asc
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_area", async (req, res) => {
  try {
    const { building } = req.query;
    let query = `
    select
	distinct area
from
	env.env_temp_sensor_data
where
	create_at >= current_date - interval '2 day'
	-- if you want to get data from 2 days ago
	and create_at < current_date + interval '1 day'
    `;

    const queryParams = [];
    if (building && building !== "ALL") {
      if (queryParams.length === 0) {
        query += `AND`;
      } else {
        query += `AND`;
      }
      query += ` building = $${queryParams.length + 1}
      `;
      queryParams.push(building);
    }

    query += `
      order by
	area asc
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
