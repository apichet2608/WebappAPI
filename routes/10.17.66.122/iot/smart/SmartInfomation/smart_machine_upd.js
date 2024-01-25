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

router.get("/distinct_process_group", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct dld_group
from smart.smart_machine_upd smu

      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_model_name", async (req, res) => {
  try {
    const { select_proc_group } = req.query;
    let query = `
      select distinct dld_model_name
from smart.smart_machine_upd smu
    `;
    if (select_proc_group !== "ALL") {
      query += `
        WHERE dld_group = $1
      `;
    }
    const queryParams = select_proc_group !== "ALL" ? [select_proc_group] : [];
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_product_name", async (req, res) => {
  try {
    const { select_proc_name, select_model_name } = req.query;

    let query = `
      SELECT DISTINCT dld_product
      FROM smart.smart_machine_upd smu
    `;

    const queryParams = [];

    if (select_proc_name) {
      query += `
        WHERE dld_proc_name = $1
      `;
      queryParams.push(select_proc_name);
    }

    if (select_model_name && select_model_name !== "ALL") {
      if (queryParams.length > 0) {
        query += `AND dld_model_name = $${queryParams.length + 1}`;
      } else {
        query += `WHERE dld_model_name = $1`;
      }
      queryParams.push(select_model_name);
    }

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_build", async (req, res) => {
  try {
    const { select_proc_group, select_model_name, select_product_name } =
      req.query;

    let query = `
      SELECT DISTINCT dld_build
      FROM smart.smart_machine_upd smu
    `;

    const queryParams = [];
    const conditions = [];

    if (select_proc_group) {
      conditions.push(`dld_group = $${queryParams.length + 1}`);
      queryParams.push(select_proc_group);
    }

    if (select_model_name && select_model_name !== "ALL") {
      conditions.push(`dld_model_name = $${queryParams.length + 1}`);
      queryParams.push(select_model_name);
    }

    if (select_product_name && select_product_name !== "ALL") {
      conditions.push(`dld_product = $${queryParams.length + 1}`);
      queryParams.push(select_product_name);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_process", async (req, res) => {
  try {
    const {
      select_proc_group,
      select_model_name,
      select_product_name,
      select_build,
    } = req.query;

    let query = `
      SELECT DISTINCT dld_proc_group_name
      FROM smart.smart_machine_upd smu
    `;

    const queryParams = [];
    if (select_proc_group) {
      query += `
        WHERE dld_group = $1
      `;
      queryParams.push(select_proc_group);
    }
    if (select_model_name && select_model_name !== "ALL") {
      query +=
        queryParams.length > 0
          ? `AND dld_model_name = $${queryParams.length + 1}`
          : `WHERE dld_model_name = $1`;
      queryParams.push(select_model_name);
    }

    if (select_product_name && select_product_name !== "ALL") {
      query +=
        queryParams.length > 0
          ? `
          AND dld_product = $${queryParams.length + 1}`
          : `WHERE dld_product = $1`;
      queryParams.push(select_product_name);
    }

    if (select_build && select_build !== "ALL") {
      query +=
        queryParams.length > 0
          ? ` AND dld_build = $${queryParams.length + 1}`
          : `WHERE dld_build = $1`;
      queryParams.push(select_build);
    }
    console.log(query);
    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/TableData", async (req, res) => {
  try {
    const {
      select_proc_group,
      select_model_name,
      select_product_name,
      select_build,
      select_process,
      status,
    } = req.query;

    let query = `
      select
	*,
	case
		when dld_status in ('F', '-', 'Q') then 'Qualify'
		when dld_status in ('P') then 'Plan'
		when dld_status in ('A') then 'Wait NPI Approve'
		when dld_status in ('WA') then 'Wait Manager Approve'
		
		else dld_status
	end as dld_status_result
from
	smart.smart_machine_upd
    `;

    const queryParams = [];

    if (
      select_proc_group !== "ALL" ||
      select_model_name !== "ALL" ||
      select_product_name !== "ALL" ||
      select_build !== "ALL" ||
      select_process !== "ALL"
    ) {
      query += " WHERE";
      const conditions = [];

      if (select_proc_group !== "ALL") {
        conditions.push(` dld_group = $${queryParams.length + 1}`);
        queryParams.push(select_proc_group);
      }

      if (select_model_name !== "ALL") {
        conditions.push(` dld_model_name = $${queryParams.length + 1}`);
        queryParams.push(select_model_name);
      }

      if (select_product_name !== "ALL") {
        conditions.push(` dld_product = $${queryParams.length + 1}`);
        queryParams.push(select_product_name);
      }

      if (select_build !== "ALL") {
        conditions.push(` dld_build = $${queryParams.length + 1}`);
        queryParams.push(select_build);
      }

      if (select_process !== "ALL") {
        conditions.push(` dld_proc_group_name = $${queryParams.length + 1}`);
        queryParams.push(select_process);
      }
      if (status) {
        if (status === "Qualify") {
          conditions.push(` dld_status in ('F','Q','-')`);
        } else if (status === "Plan") {
          conditions.push(` dld_status in ('P')`);
        } else if (status === "Wait NPI Approve") {
          conditions.push(` dld_status in ('A')`);
        } else if (status === "Wait Manager Approve") {
          conditions.push(` dld_status in ('WA')`);
        }
      }

      query += conditions.join(" AND");
    }
    query += " ORDER BY dld_model_name ASC";
    // console.log(query);
    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/StatusResult", async (req, res) => {
  try {
    const {
      select_proc_group,
      select_model_name,
      select_product_name,
      select_build,
      select_process,
    } = req.query;

    const queryParams = [];

    let query = `
      WITH cte AS (
        SELECT
          dld_group,
          dld_model_name,
          dld_product,
          dld_build,
          dld_proc_group_name,
          dld_status
        FROM smart.smart_machine_upd
    `;

    if (select_proc_group && select_proc_group !== "ALL") {
      query += ` WHERE dld_group = $1`;
      queryParams.push(select_proc_group);
    }

    if (select_model_name && select_model_name !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND dld_model_name = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE dld_model_name = $1`;
      }
      queryParams.push(select_model_name);
    }

    if (select_product_name && select_product_name !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND dld_product = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE dld_product = $1`;
      }
      queryParams.push(select_product_name);
    }

    if (select_build && select_build !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND dld_build = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE dld_build = $1`;
      }
      queryParams.push(select_build);
    }

    if (select_process && select_process !== "ALL") {
      if (queryParams.length > 0) {
        query += ` AND dld_proc_group_name = $${queryParams.length + 1}`;
      } else {
        query += ` WHERE dld_proc_group_name = $1`;
      }
      queryParams.push(select_process);
    }

    query += `
      )
      SELECT
        CASE
          WHEN dld_status IN ('F', '-', 'Q') THEN 'Qualify'
          WHEN dld_status = 'P' THEN 'Plan'
          WHEN dld_status = 'A' THEN 'Wait NPI Approve'
          WHEN dld_status = 'WA' THEN 'Wait Manager Approve'
          ELSE 'Other'
        END AS title,
        COUNT(*) AS result
      FROM cte
      GROUP BY title
      UNION
      SELECT 'ALL', COUNT(*) AS result
      FROM cte;
      `;

    const result = await pool.query(query, queryParams);

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
