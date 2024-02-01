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

//!Get
router.get("/get_std_master", async (req, res) => {
  try {
    const { product_name, process_pos } = req.query;

    let queryStr = `
        select id, create_at, product_name, std_las_to_rpds_min, process_pos, std_tim_min
        from smart.smart_product_lot_wip_pth_pln_stdmaster`;

    const conditions = [];
    const params = [];

    if (product_name && product_name !== "") {
      conditions.push(`product_name = $${params.length + 1}`);
      params.push(product_name);
    }

    if (process_pos && process_pos !== "") {
      conditions.push(`process_pos = $${params.length + 1}`);
      params.push(process_pos);
    }

    if (conditions.length > 0) {
      queryStr += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryStr += ` ORDER BY id ASC`;

    const result = await query(queryStr, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

//!POST
router.post("/add_std_master", async (req, res) => {
  try {
    const { product_name, std_las_to_rpds_min, process_pos, std_tim_min } =
      req.body;

    const queryStr = `
        INSERT INTO smart.smart_product_lot_wip_pth_pln_stdmaster
        (create_at, product_name, std_las_to_rpds_min, process_pos, std_tim_min)
        VALUES (NOW() AT TIME ZONE 'Asia/Bangkok', $1, $2, $3, $4)`;

    const result = await query(queryStr, [
      product_name,
      std_las_to_rpds_min,
      process_pos,
      std_tim_min,
    ]);

    res.status(200).json({ message: "Add Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});


//!PUT
router.put("/update_std_master/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      create_at,
      product_name,
      std_las_to_rpds_min,
      process_pos,
      std_tim_min,
    } = req.body;

    const queryStr = `
        UPDATE smart.smart_product_lot_wip_pth_pln_stdmaster
        SET create_at = $2, product_name = $3, std_las_to_rpds_min = $4, process_pos = $5, std_tim_min = $6
        WHERE id = $1`;

    const result = await query(queryStr, [
      id,
      create_at,
      product_name,
      std_las_to_rpds_min,
      process_pos,
      std_tim_min,
    ]);
    res.status(200).json({ message: "Update Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

//!DELETE
router.delete("/delete_std_master", async (req, res) => {
  try {
    const { id } = req.query;

    const queryStr = `
        DELETE FROM smart.smart_product_lot_wip_pth_pln_stdmaster
        WHERE id = $1`;

    const result = await query(queryStr, [id]);
    res.status(200).json({ message: "Delete Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
