const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.72.65",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

// ปรับปรุง route สำหรับการเพิ่มข้อมูล
router.post("/insert-data", async (req, res) => {
  try {
    const data = req.body.data; // ข้อมูลที่ถูกส่งมาจากหน้าบ้าน

    // สร้างคำสั่ง SQL สำหรับแทรกข้อมูล
    const insertStatements = data.map(data => {
      return `('${data.sn}', NOW(), '${data.machine_no}', '${data.lot_no}', '${data.op_id}', '${data.partial_no}', '${data.total_pcs}')`;
    });

    const insertQuery = `INSERT INTO smt.smt_fin_sn_record_temp 
      (sn, "time", machine_no, lot_no, op_id, partial_no, total_pcs) 
      VALUES ${insertStatements.join(', ')}`;

    // ใช้ฟังก์ชั่น query ในการแทรกข้อมูลลงในฐานข้อมูล
    // console.log(insertQuery)
    const result = await query(insertQuery, []);
    
    // ส่งข้อความกลับหาหน้าบ้านเพื่อแจ้งผลการแทรกข้อมูล
    res.status(200).json({ message: 'แทรกข้อมูลสำเร็จ' });
  } catch (error) {
    console.error(error);
    // หากเกิดข้อผิดพลาดในการแทรกข้อมูล
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแทรกข้อมูล' });
  }
});

module.exports = router;
