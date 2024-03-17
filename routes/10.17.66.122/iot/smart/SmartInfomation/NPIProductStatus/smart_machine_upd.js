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

const query = (text, params) => pool.query(text, params);

//TODO: READ
router.get("/smart_machine_upd_npi_product_status_read", async (req, res) => {
  try {
    const { flpm_year, pmc_customer_code, pmc_customer_desc, flpmb_product } =
      req.query;

    let queryString = `
      SELECT
        flpm_year,
        pmc_customer_code,
        pmc_apn,
        pmc_customer_desc,
        flpm_name,
        flqbu_build_name,
        flqbu_seq,
        flpmb_product,
        build_start,
        build_stop,
        pmc_box_email,
        pmc_ok2s,
        pmc_customer_box,
        flpm_lock_scan,
        lock_date,
        status_ok2s,
        status_lq,
        id,
        create_date,
        CASE
          WHEN flqbu_seq BETWEEN 1 AND 7 AND status_ok2s = 'Y' THEN 'Pass'
          WHEN flqbu_seq > 7 AND status_ok2s = 'Y' AND status_lq = 'Y' THEN 'Pass'
          ELSE NULL  -- or any other default value if needed
        END AS seq_group
      FROM
        smart.smart_machine_upd_npi_status
      WHERE 1=1`;

    const conditions = [];
    const queryParams = [];

    if (flpm_year && flpm_year !== "") {
      conditions.push(`flpm_year = $${queryParams.length + 1}`);
      queryParams.push(flpm_year);
    }

    if (pmc_customer_code && pmc_customer_code !== "") {
      conditions.push(`pmc_customer_code = $${queryParams.length + 1}`);
      queryParams.push(pmc_customer_code);
    }

    if (pmc_customer_desc && pmc_customer_desc !== "") {
      conditions.push(`pmc_customer_desc = $${queryParams.length + 1}`);
      queryParams.push(pmc_customer_desc);
    }

    if (flpmb_product && flpmb_product !== "") {
      conditions.push(`flpmb_product = $${queryParams.length + 1}`);
      queryParams.push(flpmb_product);
    }

    // Add condition for filtering flpm_year not in 2021 and 2022
    conditions.push(
      `flpm_year NOT IN ($${queryParams.length + 1}, $${
        queryParams.length + 2
      })`
    );
    queryParams.push(2021, 2022);

    if (conditions.length > 0) {
      queryString += ` AND ${conditions.join(" AND ")}`;
    }

    queryString += " ORDER BY flqbu_seq ASC, flpm_year ASC";

    const result = await pool.query(queryString, queryParams);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});

// router.get("/smart_machine_upd_npi_product_status_read", async (req, res) => {
//   try {
//     const { flpm_year, pmc_customer_code, pmc_customer_desc, flpmb_product } =
//       req.query;

//     let queryString = `
//       SELECT
//         flpm_year,
//         pmc_customer_code,
//         pmc_apn,
//         pmc_customer_desc,
//         flpm_name,
//         flqbu_build_name,
//         flqbu_seq,
//         flpmb_product,
//         build_start,
//         build_stop,
//         pmc_box_email,
//         pmc_ok2s,
//         pmc_customer_box,
//         flpm_lock_scan,
//         lock_date,
//         status_ok2s,
//         status_lq,
//         id,
//         create_date,
//         CASE
//           WHEN flqbu_seq BETWEEN 1 AND 7 AND status_ok2s = 'Y' THEN 'Pass'
//           WHEN flqbu_seq > 7 AND status_ok2s = 'Y' AND status_lq = 'Y' THEN 'Pass'
//           ELSE NULL  -- or any other default value if needed
//         END AS seq_group
//       FROM
//         smart.smart_machine_upd_npi_status
//       WHERE 1=1`;

//     const conditions = [];
//     const queryParams = [];

//     if (flpm_year && flpm_year !== "") {
//       conditions.push(`flpm_year = $${queryParams.length + 1}`);
//       queryParams.push(flpm_year);
//     }

//     if (pmc_customer_code && pmc_customer_code !== "") {
//       conditions.push(`pmc_customer_code = $${queryParams.length + 1}`);
//       queryParams.push(pmc_customer_code);
//     }

//     if (pmc_customer_desc && pmc_customer_desc !== "") {
//       conditions.push(`pmc_customer_desc = $${queryParams.length + 1}`);
//       queryParams.push(pmc_customer_desc);
//     }

//     if (flpmb_product && flpmb_product !== "") {
//       conditions.push(`flpmb_product = $${queryParams.length + 1}`);
//       queryParams.push(flpmb_product);
//     }

//     if (conditions.length > 0) {
//       queryString += ` AND ${conditions.join(" AND ")}`;
//     }

//     queryString += " ORDER BY flqbu_seq ASC, flpm_year ASC";

//     const result = await pool.query(queryString, queryParams);

//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Internal Server Error");
//   }
// });

//*Query Action onClick LQ - List
// router.get("/smart_machine_upd_onclick_lq", async (req, res) => {
//   try {
//     const { dld_year, dld_customer_name } = req.query;

//     let queryString = `
//       SELECT
//         smu.dld_year as year,
//         CASE
//           WHEN smu.dld_status IN ('Q', '-', 'F') THEN 'Qualify'
//           WHEN smu.dld_status = 'P' THEN 'Plan'
//           WHEN smu.dld_status = 'A' THEN 'Wait NPI Approve'
//           WHEN smu.dld_status = 'WA' THEN 'Wait Manager Approve'
//           ELSE 'Other'
//         END AS dld_status,
//         smu.dld_machine,
//         smu.dld_customer_name,
//         smu.dld_product,
//         smu.dld_proc_name,
//         smu.dld_proc_cust_name,
//         smu.dld_duedate,
//         COUNT(smu.dld_machine) AS machine_count
//       FROM
//         smart.smart_machine_upd smu
//       LEFT JOIN
//         smart.smart_machine_upd_npi_status smuns ON smu.dld_customer_name = smuns.pmc_customer_desc
//       WHERE
//         smu.dld_year = $1
//         AND smu.dld_customer_name = $2
//         AND smu.dld_group = 'EFPC'
//       GROUP BY
//         smu.dld_year,
//         smu.dld_status,
//         smu.dld_machine,
//         smu.dld_customer_name,
//         smu.dld_product,
//         smu.dld_proc_name,
//         smu.dld_proc_cust_name,
//         smu.dld_duedate;
//     `;

//     const queryParams = [];

//     if (dld_year && dld_year !== "") {
//       queryParams.push(dld_year);
//     }

//     if (dld_customer_name && dld_customer_name !== "") {
//       queryParams.push(dld_customer_name);
//     }

//     const result = await pool.query(queryString, queryParams);

//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Internal Server Error");
//   }
// });

router.get("/smart_machine_upd_onclick_lq", async (req, res) => {
  try {
    const { dld_year, dld_customer_name, dld_proc_name, dld_status } =
      req.query;

    let queryString = `
      SELECT
        smu.dld_year as year,
        CASE
          WHEN smu.dld_status IN ('Q', '-', 'F') THEN 'Qualify'
          WHEN smu.dld_status = 'P' THEN 'Plan'
          WHEN smu.dld_status = 'A' THEN 'Wait NPI Approve'
          WHEN smu.dld_status = 'WA' THEN 'Wait Manager Approve'
          ELSE 'Other'
        END AS dld_status,
        smu.dld_machine,
        smu.dld_customer_name,
        smu.dld_product,
        smu.dld_proc_name,
        smu.dld_proc_cust_name,
        smu.dld_duedate
      FROM
        smart.smart_machine_upd smu
      LEFT JOIN
        smart.smart_machine_upd_npi_status smuns ON smu.dld_customer_name = smuns.pmc_customer_desc
      WHERE
        smu.dld_year = $1
        AND smu.dld_customer_name = $2`;

    const conditions = [];
    const queryParams = [dld_year, dld_customer_name];

    if (dld_proc_name && dld_proc_name !== "") {
      conditions.push(`smu.dld_proc_name = $${queryParams.length + 1}`);
      queryParams.push(dld_proc_name);
    }

    if (dld_status && dld_status !== "") {
      conditions.push(`smu.dld_status = $${queryParams.length + 1}`);
      queryParams.push(dld_status);
    }

    if (conditions.length > 0) {
      queryString += ` AND ${conditions.join(" AND ")}`;
    }

    queryString += ` AND smu.dld_group = 'EFPC'`;

    // Add ORDER BY clause
    queryString += ` ORDER BY smu.dld_proc_name`;

    console.log("Generated Query:", queryString);
    console.log("Query Parameters:", queryParams);

    const result = await pool.query(queryString, queryParams);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//*Query Action onClick Customer Desc - Count
// router.get("/smart_machine_upd_onclick_customer_desc", async (req, res) => {
//   try {
//     const { dld_year, dld_customer_name } = req.query;

//     let queryString = `
//       SELECT
//         dld_machine,
//         CASE
//           WHEN dld_status IN ('F', '-', 'Q') THEN 'Qualify'
//           WHEN dld_status = 'P' THEN 'Plan'
//           WHEN dld_status = 'A' THEN 'Wait NPI Approve'
//           WHEN dld_status = 'WA' THEN 'Wait Manager Approve'
//           ELSE 'Other'
//         END AS grouped_status,
//         dld_proc_cust_name,
//         dld_customer_name,
//         COUNT(dld_machine) AS machine_count
//       FROM
//         smart.smart_machine_upd
//       WHERE
//         dld_year = $1
//         AND dld_customer_name = $2
//       GROUP BY
//         dld_machine,
//         grouped_status,
//         dld_proc_cust_name,
//         dld_customer_name
//       ORDER BY
//         dld_proc_cust_name,
//         grouped_status;`;

//     const queryParams = [dld_year, dld_customer_name];

//     const result = await pool.query(queryString, queryParams);

//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

router.get("/smart_machine_upd_onclick_customer_desc", async (req, res) => {
  try {
    const { dld_customer_name } = req.query;

    let queryString = `
      SELECT
        MIN(id) AS id,
        MIN(create_date) AS create_date,
        dld_customer_name,
        grouped_status,
        dld_proc_cust_name,
        COUNT(*) AS count
      FROM
        smart.smart_machine_upd_count
      WHERE
        dld_customer_name = $1
      GROUP BY
        dld_customer_name,
        grouped_status,
        dld_proc_cust_name
      ORDER BY
        dld_proc_cust_name;`;

    const queryParams = [dld_customer_name];

    const result = await pool.query(queryString, queryParams);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//*Query Action onClick Count - View Machine
router.get(
  "/smart_machine_upd_onclick_count_view_machine",
  async (req, res) => {
    try {
      const { dld_customer_name, dld_proc_cust_name, grouped_status } =
        req.query;

      let queryString = `
      SELECT
        dld_machine
      FROM
        smart.smart_machine_upd_count
      WHERE
        dld_customer_name = $1
        AND dld_proc_cust_name = $2
        AND grouped_status = $3;`;

      const queryParams = [
        dld_customer_name,
        dld_proc_cust_name,
        grouped_status,
      ];

      const result = await pool.query(queryString, queryParams);

      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

//*Chart API
// router.get("/upd_status_onclick_year", async (req, res) => {
//   try {
//     const { flpm_year } = req.query;

//     const queryString = `
//       SELECT
//           flpm_year,
//           pmc_customer_desc,
//           MAX(flqbu_seq) AS flqbu_seq,
//           status_lq,
//           COUNT(status_lq) AS status_lq_count
//       FROM smart.smart_machine_upd_npi_status
//       ${flpm_year ? "WHERE flpm_year = $1" : ""}
//       GROUP BY flpm_year, pmc_customer_desc, status_lq
//       ORDER BY status_lq DESC, flpm_year ASC;`;

//     const queryParams = flpm_year ? [flpm_year] : [];

//     const result = await pool.query(queryString, queryParams);

//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

router.get("/upd_status_onclick_year", async (req, res) => {
  try {
    const { flpm_year } = req.query;

    const queryString = `
      SELECT 
          flpm_year, 
          pmc_customer_desc, 
          MAX(flqbu_seq) AS flqbu_seq, 
          status_lq,
          COUNT(status_lq) AS status_lq_count 
      FROM smart.smart_machine_upd_npi_status
      ${
        flpm_year
          ? "WHERE flpm_year = $1 AND flpm_year NOT IN ($2, $3)"
          : "WHERE flpm_year NOT IN ($1, $2)"
      }
      GROUP BY flpm_year, pmc_customer_desc, status_lq
      ORDER BY flpm_year, pmc_customer_desc, flqbu_seq DESC;`;

    const queryParams = flpm_year ? [flpm_year, 2021, 2022] : [2021, 2022];

    const result = await pool.query(queryString, queryParams);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//*Chart table API
router.get("/upd_status_chart_table", async (req, res) => {
  try {
    const queryString = `
      SELECT
        flpm_year,
        COUNT(CASE WHEN status_lq = 'N' THEN 1 END) AS status_lq_n,
        COUNT(CASE WHEN status_lq = 'Y' THEN 1 END) AS status_lq_y
      FROM
        smart.smart_machine_upd_npi_status
      WHERE
        flpm_year IS NOT NULL
      GROUP BY
        flpm_year
      ORDER BY
        flpm_year;`;

    const result = await pool.query(queryString);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
