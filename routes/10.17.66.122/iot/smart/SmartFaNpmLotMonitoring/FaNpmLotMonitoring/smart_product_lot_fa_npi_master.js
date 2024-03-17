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

//* Main API
router.get("/smart_fa_npm_lot_monitoring", async (req, res) => {
  try {
    const { product_name } = req.query;

    let sqlQuery = `
      SELECT 
        b.input_build,
        b.build,
        a.product_name, 
        b.cus_name,
        a.lot, 
        a.fac_unit_desc,
        a.proc_grp_name,
        a.proc_disp, 
        a.scan_desc, 
        a.input_qty, 
        a.holding_time_mins,
        a.scan_in AT TIME ZONE 'Asia/Bangkok' AS scan_in
      FROM 
        smart.smart_product_lot_wip_holdingtime AS a
      INNER JOIN 
        smart.smart_product_lot_fa_npi_master AS b
      ON 
        a.product_name = b.product_name AND COALESCE(a.lot::bigint, 0) = COALESCE(b.lot::bigint, 0)`;

    let queryParam = [];

    if (product_name && product_name !== "ALL") {
      sqlQuery += ` WHERE a.product_name = $1`;
      queryParam.push(product_name);
    }

    sqlQuery += ` ORDER BY a.product_name DESC, a.holding_time_mins DESC`;

    const result = await pool.query(sqlQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

//* Dialog Lot API
router.get("/smart_fa_npm_lot_monitoring_lot", async (req, res) => {
  try {
    const { lot_no } = req.query;

    let sqlQuery = `
      SELECT 
        prc_group,
        process,
        product_name,
        lot_no,
        plan_date,
        scan_date AT TIME ZONE 'Asia/Bangkok' AS scan_date,
        scan_desc,
        id,
        create_at,
        update_date
      FROM 
        smart.smart_product_lot_fa_npi_history a
      WHERE 
        1 = 1`; // Placeholder for additional conditions

    let queryParam = [];

    if (lot_no && lot_no !== "ALL") {
      sqlQuery += ` AND a.lot_no = $1`;
      queryParam.push(lot_no);
    }

    // Add ORDER BY clause for sorting by 'plan_date' in descending order
    sqlQuery += ` ORDER BY a.scan_date DESC`;

    const result = await pool.query(sqlQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

//* Dialog Holding time API
router.get("/smart_fa_npm_lot_monitoring_holding", async (req, res) => {
  try {
    const { product_name, lot_no, holding_time } = req.query;

    let sqlQuery = `
      SELECT
        t.prc_group,
        t.process,
        t.product_name,
        t.lot_no,
        t.holding_time,
        t.in_setup,
        t.processing_time,
        t.out_setup,
        t.transport_time
      FROM
        smart.smart_product_lot_fa_npi_caltime t
    `;

    const conditions = [];
    const queryParam = [];

    if (product_name && product_name !== "ALL") {
      conditions.push(`t.product_name = $${queryParam.length + 1}`);
      queryParam.push(product_name);
    }

    if (lot_no && lot_no !== "ALL") {
      conditions.push(`t.lot_no = $${queryParam.length + 1}`);
      queryParam.push(lot_no);
    }

    if (holding_time && holding_time !== "ALL") {
      conditions.push(`t.holding_time = $${queryParam.length + 1}`);
      queryParam.push(holding_time);
    }

    if (conditions.length > 0) {
      sqlQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add ORDER BY clause for sorting by a valid column, for example, 'product_name' in ascending order
    sqlQuery += ` ORDER BY t.product_name ASC`;

    const result = await pool.query(sqlQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

//* Dialog +Product API
router.get("/smart_fa_npm_lot_monitoring_dialog", async (req, res) => {
  try {
    const { product_name, lot } = req.query;

    let sqlQuery = `
    SELECT
      id,
      product_name,
      lot,
      cus_name,
      build,
      input_build
    FROM
      smart.smart_product_lot_fa_npi_master
`;

    let queryParam = [];

    if (product_name && product_name !== "ALL") {
      sqlQuery += ` WHERE product_name = $1`;
      queryParam.push(product_name);
    }

    if (lot && lot !== "ALL") {
      sqlQuery +=
        queryParam.length > 0
          ? ` AND lot = $${queryParam.length + 1}`
          : ` WHERE lot = $1`;
      queryParam.push(lot);
    }

    // Add ORDER BY clause for sorting by id in ascending order (as text)
    sqlQuery += ` ORDER BY id::text ASC`;

    const result = await pool.query(sqlQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.sendStatus(500);
  }
});

//* Dialog +Product API for Insert
router.post("/smart_fa_npm_lot_monitoring_dialog_insert", async (req, res) => {
  try {
    // Ensure that the request body is correctly parsed (use express.json() middleware)
    const { product_name, lot, cus_name, build, input_build } = req.body;

    const insertQuery = `
      INSERT INTO smart.smart_product_lot_fa_npi_master
        (product_name, lot, cus_name, build, input_build)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *;`;

    const queryParam = [product_name, lot, cus_name, build, input_build];

    // Log the query parameters for debugging purposes
    console.log("Query Parameters:", queryParam);

    const result = await pool.query(insertQuery, queryParam);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//* Dialog +Product API for Update
router.put(
  "/smart_fa_npm_lot_monitoring_dialog_update/:id",
  async (req, res) => {
    try {
      // Ensure that the request body is correctly parsed (use express.json() middleware)
      const { id } = req.params; // Extract 'id' from the route parameters
      const { product_name, lot, cus_name, build, input_build } = req.query; // Use req.query instead of req.body

      const updateQuery = `
      UPDATE smart.smart_product_lot_fa_npi_master
      SET
        product_name = $1,
        lot = $2,
        cus_name = $3,
        build = $4,
        input_build = $5
      WHERE
        id = $6
      RETURNING *;`;

      const queryParam = [product_name, lot, cus_name, build, input_build, id];

      // Log the query parameters for debugging purposes
      console.log("Query Parameters:", queryParam);

      const result = await pool.query(updateQuery, queryParam);

      res.json(result.rows);
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

//* Dialog +Product API for Delete
router.delete(
  "/smart_fa_npm_lot_monitoring_dialog_delete",
  async (req, res) => {
    try {
      const { id } = req.query;

      const deleteQuery = `
      DELETE FROM smart.smart_product_lot_fa_npi_master
      WHERE
        id = $1`;

      // Log the query parameters for debugging purposes
      console.log("Query Parameters:", [id]);

      const result = await pool.query(deleteQuery, [id]);

      // Check if any rows were affected by the DELETE operation
      if (result.rowCount === 0) {
        // No rows were deleted, respond accordingly
        res.status(404).json({ message: "Record not found" });
      } else {
        // Rows were deleted, respond with a success message
        res.json({ message: "Record deleted successfully" });
      }
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
