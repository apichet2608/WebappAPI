const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.111",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

// router.get("/plot-hr", async (req, res) => {
//   try {
//     const { startdate, stopdate, product, station } = req.query;

//     const result = await query(
//       `select
//       *
//     from
//       public.foxsystem_post_by_hr
//     where timestamp_group::date >= $1
//     and timestamp_group::date <= $2
//     and sendresultdetails_product = $3
//     and sendresultdetails_station_type = $4
//     order by timestamp_group asc`,
//       [startdate, stopdate, product, station]
//     );

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/plot-hr", async (req, res) => {
  try {
    const { startdate, stopdate, product, station } = req.query;
    let query = `
    select
      *
    from
      public.foxsystem_post_by_hr
    where timestamp_group::date >= $1
    AND timestamp_group::date <= $2
    `;

    const queryParams = [startdate, stopdate];
    if (product && product !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` sendresultdetails_product = $${queryParams.length + 1}
      `;
      queryParams.push(product);
    }
    if (station && station !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` sendresultdetails_station_type = $${queryParams.length + 1}
      `;
      queryParams.push(station);
    }
    query += `
    order by timestamp_group asc
    `;
    // console.log(query);
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/plot-all", async (req, res) => {
//   try {
//     const { startdate, stopdate, product } = req.query;

//     const result = await query(
//       `select
//       *
//     from
//       public.foxsystem_post_by_hr
//     where timestamp_group::date >= $1
//     and timestamp_group::date <= $2
//     and sendresultdetails_product = $3
//     order by timestamp_group asc`,
//       [startdate, stopdate, product]
//     );

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/distinct-station", async (req, res) => {
  try {
    const { startdate, stopdate, product } = req.query;
    let query = `
    select
    distinct sendresultdetails_station_type
  from
    public.foxsystem_post_by_hr
    where timestamp_group::date >= $1
    AND timestamp_group::date <= $2
    `;

    const queryParams = [startdate, stopdate];
    if (product && product !== "ALL") {
      if (queryParams.length === 0) {
        query += `WHERE`;
      } else {
        query += `AND`;
      }
      query += ` sendresultdetails_product = $${queryParams.length + 1}
      `;
      queryParams.push(product);
    }

    query += `
    order by sendresultdetails_station_type asc
    `;
    // console.log(query);
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct-product", async (req, res) => {
  try {
    const { startdate, stopdate } = req.query;
    let query = `
    select
    distinct sendresultdetails_product 
  from
    public.foxsystem_post_by_hr
    where timestamp_group::date >= $1
    AND timestamp_group::date <= $2
    `;

    const queryParams = [startdate, stopdate];

    query += `
    order by sendresultdetails_product asc
    `;
    // console.log(query);
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.get("/distinct-station", async (req, res) => {
//   try {
//     const { product } = req.query;

//     const result = await query(
//       `
//     select
//     distinct sendresultdetails_station_type
//   from
//     public.foxsystem_post_by_hr
//   where
//     sendresultdetails_product = $1
//     `,
//       [product]
//     );
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

// router.get("/distinct-product", async (req, res) => {
//   try {
//     const result = await query(`
//     select
//     distinct sendresultdetails_product
//   from
//     public.foxsystem_post_by_hr;
//     `);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

module.exports = router;
