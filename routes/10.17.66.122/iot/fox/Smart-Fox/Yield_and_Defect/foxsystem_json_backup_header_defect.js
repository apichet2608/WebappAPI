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

router.get("/fix-process-product-day-select", async (req, res) => {
  try {
    const { process, product, date } = req.query;

    const result = await query(
      `select
      id,
      station_process,
      sendresultdetails_product,
      "date" ,
      uut_attributes_defect_desc,
      defect_count
    from
      fox.foxsystem_json_backup_header_defect_day
    where
      station_process = $1
      and sendresultdetails_product = $2
      and "date" like $3
      and uut_attributes_defect_desc != 'NA'
    order by
      id`,
      [process, product, date]
    );

    // res.status(200).json(result.rows);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (error) {
    console.error(error);
    // res.status(500).json({ error: "An error occurred while fetching data" });
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/fix-process-product-month-select", async (req, res) => {
  try {
    let { process, product, month } = req.query;

    // change format key month 2023 12 Month to Month 12 2023
    let date = month.split(" ");
    month = `${date[2]} ${date[1]} ${date[0]}`;

    const result = await query(
      `select
      id,
      station_process,
      sendresultdetails_product,
      "month" ,
      uut_attributes_defect_desc,
      defect_count
    from
      fox.foxsystem_json_backup_header_defect_month
    where
      station_process = $1
      and sendresultdetails_product = $2
      and "month" like $3
      and uut_attributes_defect_desc != 'NA'
    order by
      id`,
      [process, product, month]
    );

    // res.status(200).json(result.rows);
    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (error) {
    console.error(error);
    // res.status(500).json({ error: "An error occurred while fetching data" });
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/fix-process-product-week-select", async (req, res) => {
  try {
    let { process, product, week } = req.query;

    console.log(week);

    let date = week.split(" ");
    week = `${date[1]} ${date[2]} ${date[0]}`;
    console.log(week);
    const result = await query(
      `select
      id,
      station_process,
      sendresultdetails_product,
      "week" ,
      uut_attributes_defect_desc,
      defect_count
    from
      fox.foxsystem_json_backup_header_defect_week
    where
      station_process = $1
      and sendresultdetails_product = $2
      and "week" like $3
      and uut_attributes_defect_desc != 'NA'
    order by
      id`,
      [process, product, week]
    );

    // res.status(200).json(result.rows);\
    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (error) {
    console.error(error);
    // res.status(500).json({ error: "An error occurred while fetching data" });
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/fix-process-product-day", async (req, res) => {
  try {
    const { process, product } = req.query;
    let queryParams = [product];
    let queryStr = `select
      distinct "date"
    from
      fox.foxsystem_json_backup_header_defect_day
    where
      sendresultdetails_product = $1
      and uut_attributes_defect_desc != 'NA'
      `;

    if (process) {
      if (queryParams.length > 0) {
        queryStr += `
          AND station_process = $${queryParams.length + 1}
        `;
        queryParams.push(process);
      }
    }

    queryStr += `
      order by
        "date" desc
    `;
    const result = await query(queryStr, queryParams);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/fix-process-product-week", async (req, res) => {
  try {
    const { process, product } = req.query;

    let queryParams = [product];
    let queryStr = `select
      distinct week
    from
      fox.foxsystem_json_backup_header_defect_week
    where
      sendresultdetails_product = $1
      and uut_attributes_defect_desc != 'NA'
      `;
    if (process) {
      if (queryParams.length > 0) {
        queryStr += `
          AND station_process = $${queryParams.length + 1}
        `;
        queryParams.push(process);
      }
    }

    queryStr += `
      order by
        week desc
    `;
    const result = await query(queryStr, queryParams);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      result.rows.map((row) => {
        // change format key week Week 12 2023 to 2023 12 Week
        let date = row.week.split(" ");
        row.week = `${date[2]} ${date[0]} ${date[1]}`;
      });
      // สร้างฟังก์ชันเพื่อใช้ในการเรียงลำดับวัน
      function compareWeeks(a, b) {
        // แปลงสตริงวันที่เป็นตัวเลขของปีและสัปดาห์
        function weekStringToNumber(weekString) {
          // แยกสตริงเป็นปีและสัปดาห์
          const [yearA, weekA] = weekString.split(" Week ");
          // แปลงปีและสัปดาห์เป็นตัวเลขและคืนค่า
          return { year: parseInt(yearA), week: parseInt(weekA) };
        }

        // แปลงสตริงวันที่ให้เป็นตัวเลขของปีและสัปดาห์
        const weekA = weekStringToNumber(a.week);
        const weekB = weekStringToNumber(b.week);

        // กรณีวันที่มีปีเท่ากัน เรียงตามสัปดาห์
        if (weekA.year === weekB.year) {
          return weekB.week - weekA.week;
        }

        // กรณีปีไม่เท่ากัน เรียงตามปี
        return weekB.year - weekA.year;
      }

      // เรียงลำดับข้อมูลในอาร์เรย์ result.rows
      result.rows.sort(compareWeeks);

      // กรองเฉพาะข้อมูลที่อยู่ในปีล่าสุด
      const currentYear = new Date().getFullYear();
      const weeksThisYear = result.rows.filter((row) => {
        const year = parseInt(row.week.substring(0, 4));
        return year === currentYear;
      });

      // แสดงผลลัพธ์
      console.log(weeksThisYear);

      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/fix-process-product-month", async (req, res) => {
  try {
    const { process, product } = req.query;
    let queryParams = [product];
    let queryStr = `select
      distinct month
    from
      fox.foxsystem_json_backup_header_defect_month
    where
      sendresultdetails_product = $1
      and uut_attributes_defect_desc != 'NA'
      `;
    if (process) {
      if (queryParams.length > 0) {
        queryStr += `
          AND station_process = $${queryParams.length + 1}
        `;
        queryParams.push(process);
      }
    }

    queryStr += `
      order by
        month desc
    `;
    const result = await query(queryStr, queryParams);

    if (result.rowCount === 0) {
      res.status(200).json({
        status: "OK",
        message: "No data found",
        data: [],
      });
    } else {
      result.rows.map((row) => {
        // change format key month Month 12 2023 to 2023 12 Month
        let date = row.month.split(" ");
        row.month = `${date[2]} ${date[1]} ${date[0]}`;
      });
      // แปลงชื่อเดือนเป็นตัวเลขเพื่อให้ง่ายต่อการเรียงลำดับ
      const monthToNumber = {
        "1 Month": 1,
        "2 Month": 2,
        "3 Month": 3,
        "4 Month": 4,
        "5 Month": 5,
        "6 Month": 6,
        "7 Month": 7,
        "8 Month": 8,
        "9 Month": 9,
        "10 Month": 10,
        "11 Month": 11,
        "12 Month": 12,
      };

      // เรียงลำดับข้อมูลใน result.rows โดยใช้ค่าตัวเลขของเดือน
      result.rows.sort((a, b) => {
        const monthA = monthToNumber[a.month.split(" ")[1]];
        const monthB = monthToNumber[b.month.split(" ")[1]];
        const yearA = parseInt(a.month.split(" ")[0]);
        const yearB = parseInt(b.month.split(" ")[0]);

        if (yearA === yearB) {
          return monthB - monthA;
        } else {
          return yearB - yearA;
        }
      });

      res
        .status(200)
        .json({ status: "OK", message: "Data found", data: result.rows });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Catch",
      message: "An error occurred while fetching data",
      data: [],
    });
  }
});

router.get("/distinct-station-process", async (req, res) => {
  try {
    const result = await query(`
    select
    distinct station_process
  from
    foxsystem_json_backup_header_defect_day fjbhdd
  order by
    station_process 
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-sendresultdetails-product", async (req, res) => {
  try {
    const result = await query(`
    select
    distinct sendresultdetails_product
  from
    foxsystem_json_backup_header_defect_day fjbhdd
  order by
    sendresultdetails_product
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
