//data table for display in modal

const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});

const query = (text, params) => pool.query(text, params);

// router.get("/system_monitoring", async (req, res) => {
//   try {
//     const module = req.query.module || "ALL";

//     let queryString = `
//           SELECT
//               s.id, s.created_at, s."module", s.full_message, s.hostname,
//               s.ip_address, s."level", s.file, s.message,
//               sch.unit, sch."interval", sch.updated_at, sch.job_func, sch.next_run
//           FROM
//               system.system_loging_parameter_monitoring s
//           INNER JOIN
//               system.system_loging_parameter_monitoring_schedule sch
//           ON
//               s."module" = sch."module"as
//       `;

//     let queryParam = [];
//     let whereConditions = [];

//     if (module && module !== "ALL") {
//       whereConditions.push(`s."module" = $${queryParam.length + 1}`);
//       queryParam.push(module);

//       whereConditions.push(
//         `s.created_at BETWEEN $${queryParam.length + 1} AND $${
//           queryParam.length + 2
//         }`
//       );
//       queryParam.push("2023-10-22 00:00:00", "2023-10-23 00:00:00");
//     }

//     if (whereConditions.length > 0) {
//       queryString += " WHERE " + whereConditions.join(" AND ");
//     }

//     queryString += `
//           ORDER BY s.created_at DESC
//           LIMIT 100;
//       `;

//     const result = await pool.query(queryString, queryParam);
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error executing query:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

router.get("/system_monitoring", async (req, res) => {
  try {
    // รับค่า "module" จาก query string
    const module = req.query.module;

    // สร้างคำสั่ง SQL โดยใช้ parameterized query เพื่อป้องกัน SQL injection
    let sqlQuery = `
      SELECT 
              s.id, s.created_at, s."module", s.full_message, s.hostname, 
              s.ip_address, s."level", s.file, s.message,
              sch.unit, sch."interval", sch.updated_at, sch.job_func, sch.next_run
          FROM 
              system.system_loging_parameter_monitoring s
          INNER JOIN 
              system.system_loging_parameter_monitoring_schedule sch 
          ON 
              s."module" = sch."module"
    `;

    // ตรวจสอบค่า "module" ถ้าเป็น "ALL" ไม่ต้องเพิ่มเงื่อนไข WHERE
    if (module !== "ALL") {
      sqlQuery += ` WHERE s."module" = $1`;
    }

    sqlQuery += ` ORDER BY s.created_at DESC`;

    // ดำเนินการคิวรีดาตาเบส
    const result = await pool.query(sqlQuery, [module]);

    // ส่งคำตอบ JSON กลับไปยังไคลเอนต์
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
