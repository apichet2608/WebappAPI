const express = require("express");
const app = express();

//*-------------------------SmartFox---------------------------//
const foxsystem_daily_report_bylot_Daily_Report_smart_fox = require("../routes/10.17.66.122/iot/fox/Smart-Fox/Daily Report/foxsystem_daily_report_bylot");
const foxsystem_daily_report_Data_Completeness_smart_fox = require("../routes/10.17.66.122/iot/fox/Smart-Fox/Data_Completeness/foxsystem_daily_report");
const foxsystem_holding_time_Holding_Time_Track_smart_fox = require("../routes/10.17.66.228/foxsystem/public/Smart-Fox/Holding_Time_Track/foxsystem_holding_time");
const foxsystem_json_backup_header_ok_Process_output_smart_fox = require("../routes/10.17.77.111/postgres/public/Fox/Proces-Output/foxsystem_json_backup_header_ok");
const foxsystem_json_backup_header_ok_Defect_Sending_smart_fox = require("../routes/10.17.77.111/postgres/public/Fox/Defect-Sending/foxsystem_json_backup_header_ok");
const foxsystem_json_backup_header_summary_output_summary_smart_fox = require("../routes/10.17.77.111/postgres/public/Fox/Output_Summary/foxsystem_json_backup_header_summary");
const foxsystem_post_by_hr_posting_smart_fox = require("../routes/10.17.77.111/postgres/public/Fox/Posting/foxsystem_post_by_hr");
const foxsystem_post_by_day_posting_smart_fox = require("../routes/10.17.77.111/postgres/public/Fox/Posting/foxsystem_post_by_day");
const foxsystem_json_backup_header_defect_yield_and_defect_smart_fox = require("../routes/10.17.66.122/iot/fox/Smart-Fox/Yield_and_Defect/foxsystem_json_backup_header_defect");
const foxsystem_summary_bylot_yield_and_defect_smart_fox = require("../routes/10.17.66.122/iot/fox/Smart-Fox/Yield_and_Defect/foxsystem_summary_bylot");
const foxsystem_elt_pareto_run_backup_smart_fox = require("../routes/10.17.66.122/iot/fox/Smart-Fox/Top5_E_Test_Defect/foxsystem_elt_pareto_run_backup");
//*-------------------------SmartFox---------------------------//
//*-------------------------SmartFox---------------------------//
//*-------Chanakan----/
app.use(
  "/foxsystem_daily_report_bylot/Daily_Report/smart_fox",
  foxsystem_daily_report_bylot_Daily_Report_smart_fox
);
app.use(
  "/foxsystem_daily_report/Data_Completeness/smart_fox",
  foxsystem_daily_report_Data_Completeness_smart_fox
);
app.use(
  "/foxsystem_holding_time/Holding_Time_Track/smart_fox",
  foxsystem_holding_time_Holding_Time_Track_smart_fox
);
//*-------Apichet----/

app.use(
  "/foxsystem_json_backup_header_ok/Process_output/smart_fox",
  foxsystem_json_backup_header_ok_Process_output_smart_fox
);
app.use(
  "/foxsystem_json_backup_header_ok/Defect_Sending/smart_fox",
  foxsystem_json_backup_header_ok_Defect_Sending_smart_fox
);
app.use(
  "/foxsystem_json_backup_header_summary/output_summary/smart_fox",
  foxsystem_json_backup_header_summary_output_summary_smart_fox
);
app.use(
  "/foxsystem_post_by_hr/posting/smart_fox",
  foxsystem_post_by_hr_posting_smart_fox
);
app.use(
  "/foxsystem_post_by_day/posting/smart_fox",
  foxsystem_post_by_day_posting_smart_fox
);
app.use(
  "/foxsystem_json_backup_header_defect/yield_and_defect/smart_fox",
  foxsystem_json_backup_header_defect_yield_and_defect_smart_fox
);
app.use(
  "/foxsystem_summary_bylot/yield_and_defect/smart_fox",
  foxsystem_summary_bylot_yield_and_defect_smart_fox
);

app.use(
  "/foxsystem_elt_pareto_run_backup/top5_e_test_defect/smart_fox",
  foxsystem_elt_pareto_run_backup_smart_fox
);
//*-------------------------SmartFox---------------------------//
module.exports = app;
