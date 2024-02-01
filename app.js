const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const compression = require("compression"); // นำเข้า compression

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const smart_link_page_machine_iot_device_smart_machine_connect_list = require("./routes/10.17.66.122/iot/smart/SmartFactoryLinkPage/machine_iot_device/smart_machine_connect_list");
//*-------------------------Smart-Overall---------------------------//
const smart_overall_require_08003809 = require("./routes/10.17.66.122/iot/smart/SMARTFactoryOverrallRequiments/smart_overall_require_08003809");
const smart_overall_require_08003809_action = require("./routes/10.17.66.122/iot/smart/SMARTFactoryOverrallRequiments/smart_overall_require_08003809_action");
//*-------------------------Smart-Overall---------------------------//
//*-------------------------SmartAOI---------------------------//
const fin_ost_reject_day = require("./routes/10.17.66.230/iot/public/SmartAOI/OST/fin_ost_reject_day");
const fin_ost_reject_month = require("./routes/10.17.66.230/iot/public/SmartAOI/OST/fin_ost_reject_month");
const fin_ost_reject_week = require("./routes/10.17.66.230/iot/public/SmartAOI/OST/fin_ost_reject_week");
const cfm_aoi_reject_day = require("./routes/10.17.77.111/postgres/public/SmartAOI/AOI/cfm_aoi_reject_day");
const cfm_aoi_reject_lot = require("./routes/10.17.77.111/postgres/public/SmartAOI/AOI/cfm_aoi_reject_lot");
const fpc_cfm_aoi_reject_day = require("./routes/10.17.66.122/iot/fpc/aoi_reject/fpc_cfm_aoi_reject_day");
const fpc_cfm_aoi_reject_lot = require("./routes/10.17.66.122/iot/fpc/aoi_reject/fpc_cfm_aoi_reject_lot");
//*-------------------------SmartAOI---------------------------//
//*-------------------------SmartFactoryManWorking---------------------------//
const smart_man_working_status = require("./routes/10.17.66.122/iot/smart/SmartFactoryManWorking/smart_man_working_status");
const smart_man_working_summary = require("./routes/10.17.66.122/iot/smart/SmartFactoryManWorking/smart_man_working_summary");
const smart_man_tc_certificate = require("./routes/10.17.66.121/iot/smart/SmartFactoryManWorking/smart_man_tc_certificate");
const smart_man_lock_process = require("./routes/10.17.66.121/iot/smart/SmartFactoryManWorking/smart_man_lock_process");
//*-------------------------SmartFactoryManWorking---------------------------//
//*--------------------------Smart Man Power Working Input--------------------//
const smart_man_master_process_Man_working_input_SmartFacManWorkingInput = require("./routes/10.17.66.121/iot/smart/SmartFacManWorkingInput/Man_working_input/smart_man_master_process");
const smart_man_working_input_Man_working_input_SmartFacManWorkingInput = require("./routes/10.17.66.121/iot/smart/SmartFacManWorkingInput/Man_working_input/smart_man_working_input");
const smart_man_master_hr_Man_working_record_SmartFacManWorkingInput = require("./routes/10.17.66.121/iot/smart/SmartFacManWorkingInput/Man_working_record/smart_man_master_hr");
//*--------------------------Smart Man Power Working Input--------------------//
//*-------------------------SmartFox---------------------------//
const foxsystem_daily_report_bylot_Daily_Report_smart_fox = require("./routes/10.17.66.122/iot/fox/Smart-Fox/Daily Report/foxsystem_daily_report_bylot");
const foxsystem_daily_report_Data_Completeness_smart_fox = require("./routes/10.17.66.122/iot/fox/Smart-Fox/Data_Completeness/foxsystem_daily_report");
const foxsystem_holding_time_Holding_Time_Track_smart_fox = require("./routes/10.17.66.228/foxsystem/public/Smart-Fox/Holding_Time_Track/foxsystem_holding_time");
const foxsystem_json_backup_header_ok_Process_output_smart_fox = require("./routes/10.17.77.111/postgres/public/Fox/Proces-Output/foxsystem_json_backup_header_ok");
const foxsystem_json_backup_header_ok_Defect_Sending_smart_fox = require("./routes/10.17.77.111/postgres/public/Fox/Defect-Sending/foxsystem_json_backup_header_ok");
const foxsystem_json_backup_header_summary_output_summary_smart_fox = require("./routes/10.17.77.111/postgres/public/Fox/Output_Summary/foxsystem_json_backup_header_summary");
const foxsystem_post_by_hr_posting_smart_fox = require("./routes/10.17.77.111/postgres/public/Fox/Posting/foxsystem_post_by_hr");
const foxsystem_post_by_day_posting_smart_fox = require("./routes/10.17.77.111/postgres/public/Fox/Posting/foxsystem_post_by_day");
const foxsystem_json_backup_header_defect_yield_and_defect_smart_fox = require("./routes/10.17.77.111/postgres/public/Fox/Yield_and_Defect/foxsystem_json_backup_header_defect");
const foxsystem_summary_bylot_yield_and_defect_smart_fox = require("./routes/10.17.77.111/postgres/public/Fox/Yield_and_Defect/foxsystem_summary_bylot");
//*-------------------------SmartFox---------------------------//

const master_issue_list_customer_mil_smart_mil_common = require("./routes/10.17.66.122/iot/smart/smartMasterIssuseList/Customer_mil/smart_mil_common");
const smt_plasma_sacn_mc_rack = require("./routes/10.17.66.230/iot/public/Scan-MC-Rack/smt_plasma_sacn_mc_rack");

//*-------------------------LPI---------------------------//
const jwdb_r23662_actv = require("./routes/10.17.71.21/postgres/public/Smart-LPI/rlsb-r2-36-62/jwdb_r23662_actv");
const jwdb_rphp_beac_actv = require("./routes/10.17.71.21/postgres/public/Smart-LPI/lrphp/jwdb_rphp_beac_actv");
const asteria_lsedi_screen_exposedata = require("./routes/10.17.71.21/postgres/public/Smart-LPI/les-di-af-focus/asteria_lsedi_screen_exposedata");
const jwdb_rlse_beac = require("./routes/10.17.66.121/iot/jw_common_table/Smart-LPI/rlse-alingment/jwdb_rlse_beac");
const jwdb_rlse_beac_cycle_time = require("./routes/10.17.66.121/iot/jw_common_table/Smart-LPI/RLSE-Cycle-Time/jwdb_rlse_beac");
const fpc_lse_alignment_noexp = require("./routes/10.17.77.118/iot/public/Smart-LPI/les-no-exp/fpc_lse_alignment_noexp");
const lpi_screen_tension = require("./routes/10.17.66.121/iot/fpc/Smart-LPI/screen-tension/lpi_screen_tension");
//*-------------------------LPI---------------------------//
//*-------------------------CFM---------------------------//
const jwdb_rdflv_mck_actv = require("./routes/10.17.71.21/postgres/public/Smart-CFM/RDFLV-MCK/jwdb_rdflv_mck_actv");
const jwdb_rdfl_mck_actv = require("./routes/10.17.71.21/postgres/public/Smart-CFM/RDFL/jwdb_rdfl_mck_actv");
const jwdb_rdflv_gro_up_actv = require("./routes/10.17.71.21/postgres/public/Smart-CFM/RDFLV-MCK-Group/jwdb_rdflv_gro_up_actv");
const jwdb_rexp_two_line = require("./routes/10.17.66.121/iot/jw_common_table/Smart-CFM/REXP-Alingment/jwdb_rexp_two_line");
const jwdb_rexp_two_line_uv_power = require("./routes/10.17.66.121/iot/jw_common_table/Smart-CFM/REXP-UV-Power/jwdb_rexp_two_line");
const jwdb_rexp_two_line_tract_time = require("./routes/10.17.66.121/iot/jw_common_table/Smart-CFM/REXP-Tract-Time/jwdb_rexp_two_line");
const fpc_raoi_set_camtek = require("./routes/10.17.77.118/iot/public/Smart-CFM/Parameter-Set/fpc_raoi_set_camtek");
//*-------------------------CFM---------------------------//
//*-------------------------CVC---------------------------//
const jwdb_rcur_b = require("./routes/10.17.66.121/iot/jw_common_table/Smart-CVC/RCUR-Temperature/jwdb_rcur_b");
const jwdb_rcll = require("./routes/10.17.66.121/iot/jw_common_table/Smart-CVC/RCLL-Alignment/jwdb_rcll");
const cvc_ui_tape_test = require("./routes/10.17.66.121/iot/fpc/Smart-CVC/Ink-TapeText/cvc_ui_tape_test");
//*-------------------------CVC---------------------------//
//*-------------------------SFT---------------------------//
const fpc_sft_elgop_mto_ni = require("./routes/10.17.66.121/iot/fpc/Smart-SFT/ENIG-MTO-Ni/fpc_sft_elgop_mto_ni");
//*-------------------------SFT---------------------------//
//*---------------SMT-BE-----------------------------//
const smt_vacuum_seal_data_smt_be_packing_vacuum_seal = require("./routes/10.17.66.121/iot/smt/smt-be/packing_vacuum_seal/smt_vacuum_seal_data");
const smt_avi_set_log_smt_be_avi = require("./routes/10.17.66.121/iot/smt/smt-be/AVI/smt_avi_set_log");
const smt_avi_alarm_applog_smt_be_avi = require("./routes/10.17.66.121/iot/smt/smt-be/AVI/smt_avi_alarm_applog");
//*---------------SMT-BE-----------------------------//
//*---------------SMT-MOT-----------------------------//
const smt_binder_oven_data = require("./routes/10.17.66.121/iot/smt/smt-mot/pre-baking/smt_binder_oven_data");
const smt_reflow_tamura_set_log = require("./routes/10.17.66.121/iot/smt/smt-mot/smt_reflow_tamura_set_log");
const smt_reflow_tamura_temp_log = require("./routes/10.17.66.121/iot/smt/smt-mot/smt_reflow_tamura_temp_log");
const smt_reflow_smic_set_log = require("./routes/10.17.66.121/iot/smt/smt-mot/smt_reflow_smic_set_log");
const smt_reflow_smic_actv = require("./routes/10.17.66.121/iot/smt/smt-mot/smt_reflow_smic_actv");
const smt_print_lock_data = require("./routes/10.17.66.121/iot/smt/smt-mot/smt_print_lock_data");
var smt_print_program_log_cleaningcondition = require("./routes/10.17.66.121/iot/smt/smt-mot/smt_print_program_log_cleaningcondition");
var smt_print_program_log_printcondition = require("./routes/10.17.66.121/iot/smt/smt-mot/smt_print_program_log_printcondition");
var smt_print_program_log_printposition = require("./routes/10.17.66.121/iot/smt/smt-mot/smt_print_program_log_printposition");
const smt_mount_program_log_header_smt_mot_PickandPlace_SettingTab = require("./routes/10.17.66.121/iot/smt/smt-mot/PickandPlace/smt_mount_program_log_header");
const smt_mount_program_log_result_smt_mot_PickandPlace_SettingTab = require("./routes/10.17.66.121/iot/smt/smt-mot/PickandPlace/smt_mount_program_log_result");
const smt_mount_operation_log_alarm_smt_mot_PickandPlace_AlarmTab = require("./routes/10.17.66.121/iot/smt/smt-mot/PickandPlace/Alarm/smt_mount_operation_log_alarm");
const smt_print_alarm_log_smt_mot_Print_AlarmTab = require("./routes/10.17.66.121/iot/smt/smt-mot/Print/Alarm/smt_print_alarm_log");
//*---------------SMT-MOT-----------------------------//
//*---------------Smart Calling parameter tracking-----------------------------//
const smart_jv_parameter_calling_track = require("./routes/10.17.66.122/iot/smart/SmartCallingparametertracking/smart_jv_parameter_calling_track");
//*---------------Smart Calling parameter tracking-----------------------------//
//*---------------Smart Quality Insight-----------------------------//
const smart_reject_fpc_by_prd_weight = require("./routes/10.17.66.122/iot/smart/SmartQualityInsight/smart_reject_fpc_by_prd_weight");
const smart_product_lot_wip = require("./routes/10.17.66.122/iot/smart/SmartQualityInsight/smart_product_lot_wip");
const smart_reject_fpc_by_sheet = require("./routes/10.17.66.122/iot/smart/SmartQualityInsight/smart_reject_fpc_by_sheet");
const smart_reject_fpc_product_item = require("./routes/10.17.66.122/iot/smart/SmartQualityInsight/smart_reject_by_item/smart_reject_fpc_product_item");
const smart_reject_fpc_product_item_improvement = require("./routes/10.17.66.122/iot/smart/SmartQualityInsight/product_improvement/smart_reject_fpc_product_item");
//*---------------Smart Quality Insight-----------------------------//
//*---------------Smart-Vertify-Report-----------------------------//
const smart_jv_parameter_calling = require("./routes/10.17.66.121/iot/smart/SmartVertifyReport/Verify_Report/smart_jv_parameter_calling");
const smart_master_fin_fost_verify = require("./routes/10.17.77.111/postgres/public/SmartVertifyReport/Master_Verify_Report/smart_master_fin_fost_verify");
const smt_goldenmaster_zaoi_aoi = require("./routes/10.17.66.121/iot/smt/SmartVertifyReport/Master_Verify_Report/smt_goldenmaster_zaoi_aoi");
const smt_goldenmaster_zxra_xray = require("./routes/10.17.66.121/iot/smt/SmartVertifyReport/Master_Verify_Report/smt_goldenmaster_zxra_xray");
const smart_jv_parameter_calling_Smartverify_VerifyReportSummary = require("./routes/10.17.66.121/iot/smart/SmartVertifyReport/Verify_Report_Summary/smart_jv_parameter_calling");
//*---------------Smart-Vertify-Report-----------------------------//
//*---------------smart_cost_insight-----------------------------//
const smart_cost_div_kpi = require("./routes/10.17.66.122/iot/smart/SmartCostInsight/Cost_by_division/smart_cost_div_kpi");
const smart_cost_a1_month = require("./routes/10.17.66.122/iot/smart/SmartCostInsight/Cost_total/smart_cost_a1_month");
//cost-by-dept
const smart_cost_item_daily_kpi = require("./routes/10.17.66.122/iot/smart/SmartCostInsight/Cost_by_dept/smart_cost_item_daily_kpi");
const smart_cost_kpi = require("./routes/10.17.66.122/iot/smart/SmartCostInsight/Cost_by_dept/smart_cost_kpi");
const smart_cost_item_month_kpi = require("./routes/10.17.66.122/iot/smart/SmartCostInsight/Cost_total/smart_cost_item_month_kpi");
const smart_cost_amout_month = require("./routes/10.17.66.122/iot/smart/SmartCostInsight/Amount/smart_cost_amout_month");
//PTE-repair-cost
const smart_cost_acc_code = require("./routes/10.17.66.122/iot/smart/SmartCostInsight/PTE_repair_cost/smart_cost_acc_code");
const smart_cost_acc_code_atd = require("./routes/10.17.66.122/iot/smart/SmartCostInsight/ATD_tool_and_repairing_cost/ATD_tool_and_rapairing_cost");
//*---------------smart_cost_insight-----------------------------//
//*---------------smart-Infomation-----------------------------//
const smart_machine_connect_listPageinfomation = require("./routes/10.17.66.122/iot/smart/SmartInfomation/smart_machine_connect_list");
const smart_machine_upd = require("./routes/10.17.66.122/iot/smart/SmartInfomation/smart_machine_upd");
const smart_machine_upd_npi_product_status = require("./routes/10.17.66.122/iot/smart/SmartInfomation/NPIProductStatus/smart_machine_upd");
const smart_product_ul_ULProduct_SmartInformation = require("./routes/10.17.66.122/iot/smart/SmartInfomation/ULProduct/smart_product_ul");
//*---------------smart-Infomation-----------------------------//
//*---------------smart-OEE-/TEEP-----------------------------//
const smart_machine_oee = require("./routes/10.17.66.122/iot/smart/SmartOEE-TEEP/oee-teep/smart_machine_oee");
const smart_product_lot_fa_npi_master = require("./routes/10.17.66.122/iot/smart/SmartOEE-TEEP/FaNpmLotMonitoring/smart_product_lot_fa_npi_master");
const smart_machine_oee_master_OeeMasterTable_SmartOEE_TEEP = require("./routes/10.17.66.122/iot/smart/SmartOEE-TEEP/OEEMasterTable/smart_machine_oee_master");
//*---------------smart-OEE-/TEEP-----------------------------//
//*---------------Smart-smt-stopper-lock-status-----------------------------//
const smt_lock_signal_dev = require("./routes/10.17.72.65/iot/smt/stopper-lock-status/smt_lock_signal_dev");
const StopperLockStatus_SolderLifetime_StopperLockStatus = require("./routes/10.17.66.121/iot/smt/StopperLockStatus/SolderLifetime/smt_print_solder_lifetime");
//*---------------Smart-smt-stopper-lock-status-----------------------------//
//*--------------smt-inspection-record---------------------------------------//
const smt_fin_sn_record_temp = require("./routes/10.17.72.65/iot/smt/smt-inspection-record/smt_fin_sn_record_temp");
//*--------------smt-inspection-record---------------------------------------//
//*--------------smt-KPI---------------------------------------//
const smart_kpi_a1_main = require("./routes/10.17.66.122/iot/smart/SmartKPI/smart_kpi_a1_main");
//*--------------smt-KPI---------------------------------------//
//*--------------System_Monitoring---------------------------------------//
const system_loging_parameter_monitoring_schedule = require("./routes/10.17.66.121/iot/system/Smart-System-Monitoring/system_loging_parameter_monitoring_schedule");
const system_loging_parameter_monitoring = require("./routes/10.17.66.121/iot/system/Smart-System-Monitoring/system_loging_parameter_monitoring");
//*--------------System_Monitoring---------------------------------------//
//*--------------smt-OK2S---------------------------------------//
const SmartOK2s_smart_OK2s__smart_ok2s = require("./routes/10.17.77.111/postgres/public/SmartOK2s/smart-ok2s");
const SmartOK2s_smart_OK2s_Status_smart_ok2s_status_summary = require("./routes/10.17.66.121/iot/smart/SmartOK2s/OK2s_Status/smart_ok2s_status_summary");
//*--------------smt-OK2S---------------------------------------//
//*--------------smart_cctv---------------------------------------//
const smart_cctv = require("./routes/10.17.66.122/iot/smart/smart_cctv/smart_cctv");
//*--------------smart_cctv---------------------------------------//
//*--------------smart_fox_conn_shipbox---------------------------------------//
const foxconn_json_detail = require("./routes/10.17.66.120/fetlmes/foxconn-Shipbox/Dashboard/foxconn_json_detail");
const foxconn_label_box = require("./routes/10.17.66.120/fetlmes/foxconn-Shipbox/Warehouseboxscan/foxconn_label_box");
//*--------------smart_fox_conn_shipbox---------------------------------------//
//*--------------smart_fox_conn_dashboard---------------------------------------//
const foxconn_report_sheetbarcodecheck = require("./routes/10.17.66.120/fetlmes/foxconn-Dashboard/SheetBarcodeCheck/foxconn_report");
const foxconn_report_LotBarcodeCheck = require("./routes/10.17.66.120/fetlmes/foxconn-Dashboard/LotBarcodeCheck/foxconn_report");
//*--------------smart_fox_conn_dashboard---------------------------------------//
//*--------------FoxConn Packing Scan---------------
const foxconn_label_foxConnPackingScan_PackingScan = require("./routes/10.17.66.120/fetlmes/foxConn-Packing-Scan/FoxConnPackingScan/foxconn_label");
//*--------------FoxConn Packing Scan---------------
//*--------------FoxConn Unpack----------------------
const foxconn_label_unpack_engineerMode = require("./routes/10.17.66.120/fetlmes/foxConn-Unpack/Engineer-Mode/foxconn_label");
const foxconn_report_unpack_engineerMode = require("./routes/10.17.66.120/fetlmes/foxConn-Unpack/Engineer-Mode/foxconn_report");
//*--------------FoxConn Unpack----------------------
//*--------------FoxConn Export Report----------------
const foxconn_report_export = require("./routes/10.17.66.120/fetlmes/foxconn-export-report/export-report/foxconn_report");
//*--------------FoxConn Export Report----------------
//*--------------smart_energy---------------------------------------//
const smart_energy_mdb_by_month_over_all_energy = require("./routes/10.17.66.122/iot/smart/SmartEngrgy/over-all-energy/smart_energy_mdb_by_month");
const smart_energy_mdb_by_month_loadtype = require("./routes/10.17.66.122/iot/smart/SmartEngrgy/loadtype/smart_energy_mdb_by_month");
const smart_energy_mdb_by_month_bue_by_depart = require("./routes/10.17.66.122/iot/smart/SmartEngrgy/bue-by-depart/smart_energy_mdb_by_month");
const smart_energy_mdb_month_bue_dept_bue_by_depart = require("./routes/10.17.66.122/iot/smart/SmartEngrgy/bue-by-depart/smart_energy_mdb_month_bue_dept");
const smart_energy_mdb_month_bue_deptbuild_bue_by_depart = require("./routes/10.17.66.122/iot/smart/SmartEngrgy/bue-by-depart/smart_energy_mdb_month_bue_deptbuild");
const smart_energy_mdb_by_month_depart_indirect = require("./routes/10.17.66.122/iot/smart/SmartEngrgy/depart(indirect)/smart_energy_mdb_by_month");
const smart_energy_mdb_daily_daily_energy = require("./routes/10.17.66.122/iot/smart/SmartEngrgy/daily-energy/smart_energy_mdb_by_day");
const mdb_energy_master_result = require("./routes/10.17.66.121/iot/Public/SmartEngrgy/raw_data_mdb/mdb_energy_master_result");
const smart_energy_mdb_daily = require("./routes/10.17.66.122/iot/smart/SmartEngrgy/Energy MDB Dairy/smart_energy_mdb_daily");
//*--------------smart_energy---------------------------------------//
//*--------------smart-holding-time---------------------------------//
const fpc_holdingtime_ab_holding_time_dashboard = require("./routes/10.17.66.230/iot/public/Holding time/holding_time_dashboard/fpc_holdingtime_ab");
const fpc_holdingtime_ab_lock_lot_count = require("./routes/10.17.66.122/iot/smart/Holding time/lock_lot_count/fpc_holdingtime_ab");
//*--------------smart-holding-time---------------------------------//
const smart_product_lot_wip_holdingtime = require("./routes/10.17.66.122/iot/smart/SmartOEE-TEEP/QuickPlan/smart_product_lot_wip_holdingtime");
//*--------------smart-AUT-Tooling-Management---------------------------------//
const smart_aut_die_detail = require("./routes/10.17.66.121/iot/smart/SmartAUTToolingManagement/smart_aut_die_detail");
const smart_aut_die_dropdown = require("./routes/10.17.66.121/iot/smart/SmartAUTToolingManagement/smart_aut_die_dropdown");
const smart_aut_die_master = require("./routes/10.17.66.121/iot/smart/SmartAUTToolingManagement/smart_aut_die_master");
//*--------------smart-AUT-Tooling-Management---------------------------------//
// --------------Smart-FAI-Record---------------------------------------------//
const smart_fai_record_master_smart_fai_master_header = require("./routes/10.17.66.121/iot/fpc/Smart-FAI-Record/Smart-FAI-Master/FAI_master/fpc_fai_master_header");
const smart_fai_record_header_smart_fai_result_header = require("./routes/10.17.66.121/iot/fpc/Smart-FAI-Record/Smart-FAI-Record/FAI_header/fpc_fai_result_header");
const smart_fai_record_detail_smart_fai_result_detail = require("./routes/10.17.66.121/iot/fpc/Smart-FAI-Record/Smart-FAI-Record/FAI_detail/fpc_fai_result_detail");
// ---------------------------------------------------------------------------//
// ----------------------smart_collaboration_task------------------------------//
const smart_collaboration_task_task_smart_collaboration_task = require("./routes/10.17.66.122/iot/smart/SmartCollaborationTask/CollabrationTask/smart_collaboration_task");
const smart_collaboration_task_task_smart_man_master_hr = require("./routes/10.17.66.121/iot/smart/SmartCollaborationTask/CollabrationTask/smart_man_master_hr");
const smart_collaboration_task_register_smart_collaboration_master_add_dept = require("./routes/10.17.66.122/iot/smart/SmartCollaborationTask/Register/smart_collaboration_master_add_dept");
// ----------------------smart_collaboration_task------------------------------//
//*--------------------pm-check-sheet------------------------//
const smart_pte_pm_header_master = require("./routes/10.17.66.121/iot/smart/PMCheckSheet/PMMaster/smart_pte_pm_header_master");
const smart_pte_pm_header_record_master = require("./routes/10.17.66.121/iot/smart/PMCheckSheet/MasterRecord/smart_pte_pm_header_record_master");
const smart_pte_pm_record = require("./routes/10.17.66.121/iot/smart/PMCheckSheet/WorkingRecord/smart_pte_pm_record");
const smart_pte_pm_record_details_Report_PMChectSheet = require("./routes/10.17.66.121/iot/smart/PMCheckSheet/Report/smart_pte_pm_record_details");
//*--------------------pm-check-sheet------------------------//
//*-------------------Smart_benefit---------------------//
const smart_benefit_smart_benefit_summary_smart_benefit_action = require("./routes/10.17.66.122/iot/smart/Smart_benefit/smart_benefit_summary/smart_benefit_action");
const smart_benefit_smart_benefit_summary_smart_benefit_header = require("./routes/10.17.66.122/iot/smart/Smart_benefit/smart_benefit_summary/smart_benefit_header");
//*-------------------Smart_benefit---------------------//
//*---------------Inventory Part-----------------------------//
const smart_inventory_pte_part = require("./routes/10.17.66.121/iot/smart/InventoryPart/InventoryStatus/smart_inventory_pte_part");
//*----------------Inventory Part-----------------------------//
//*-------------------SN_Real_time_Connect--------------//
const smt_fin_sn_record_FQC_Connect_FPC_System_SN_Real_time_Connect = require("./routes/10.17.72.65/iot/smt/SN-Real-time-Connect/FQC-Connect-FPC-System/smt_fin_sn_record");
//*-------------------SN_Real_time_Connect--------------//
//*-------------------foxconn re-print-label--------------//
const foxconn_report_Re_Print_Label_foxconn_Re_Print = require("./routes/10.17.66.120/fetlmes/foxconn-Re-Print/Re-Print-Label/foxconn_report");
//*-------------------foxconn re-print-label--------------//
//*---------------------SPC Spec Master------------------------//
const smart_ipqc_parameter_spec_ctrl_master = require("./routes/10.17.66.122/iot/smart/SmartSPCSpecMaster/SPCSpecMaster/smart_ipqc_parameter_spec_ctrl_master");
//*---------------------SPC Spec Master------------------------//
//*-----------Smart Environmen-----------//
const env_particle_sensor_data_Auto_Particle_Count_Smart_Environment = require("./routes/10.17.66.121/iot/env/Smart-Environment/Auto_Particle_Count/env_particle_sensor_data");
const env_temp_sensor_data_Auto_Temp_and_Humidity_Smart_Environment = require("./routes/10.17.66.121/iot/env/Smart-Environment/Auto_Temp_and_Humidity/env_temp_sensor_data");
const fpc_particle_record_Particle_Smart_Environment = require("./routes/10.17.66.121/iot/fpc/Smart-Environment/Particle/fpc_particle_record");
//*-----------Smart Environmen-----------//
//*----------------Barcode Grade-----------------------------//
const fpc_fin_flas_barcode_grade_FLASBarcodeGrade_BarcodeGrade = require("./routes/10.17.66.122/iot/fpc/BarcodeGrade/FLASBarcodeGrade/fpc_fin_flas_barcode_grade");
//*----------------Barcode Grade-----------------------------//
//*----------------Station Yield-----------------------------//
const smart_product_lot_station_yield_Stationyield_Stationyield = require("./routes/10.17.66.122/iot/smart/Station-Yield/Station-Yield/smart_product_lot_station_yield");
//*----------------Station Yield-----------------------------//
//*---------------Smart-GR-and-R-Upload----------------------//
const smart_machine_grr_UploadGrr_Grr_upload = require("./routes/10.17.66.122/iot/smart/smart_machine_grr/GRR_upload/smart_machine_grr");
//*---------------Smart-GR-and-R-Upload----------------------//
//*------------Smart-Eworking-User-Pasword----------------------//
const smart_man_master_hr_Smart_Eworking_User_Pasword_Registor_E_Working = require("./routes/10.17.66.121/iot/smart/Smart-Eworking-User-Pasword/Registor-E-Working/smart_man_master_hr");
const eworking_user_password_Smart_Eworking_User_Pasword_Registor_E_Working = require("./routes/10.17.66.120/fetlmes/Smart-Eworking-User-Pasword/Registor-E-Working/eworking_user_password");
//*------------Smart-Eworking-User-Pasword----------------------//
//*------------Smart-BoxPlot_Web----------------------//
const smart_eworking_data_lake_SPC_LPI_Printing_Thickness_LPI_Printing_Thickness = require("./routes/10.17.66.121/iot/smart/Smart-BoxPlot_Web/Smart-BoxPlot_Page/smart_eworking_data_lake");
//*------------Smart-BoxPlot_Web----------------------//
//*------------Smart-Export_Data----------------------//
const foxconn_report_export_data_foxconn_export_data = require("./routes/10.17.66.120/fetlmes/foxconn-export-data/export-data/foxconn_report");
//*------------Smart-Export_Data----------------------//
//*----------------Annual Audit Checklist-----------------------------//
const smart_audit_checklist_AnnualAudit_AnnualAuditChecklist = require("./routes/10.17.66.122/iot/smart/SmartAnnualAuditChecklist/AnnualAudit/smart_audit_checklist");
//*----------------Annual Audit Checklist-----------------------------//

//*----------------PTH Planning-----------------------------//
const smart_product_lot_wip_pth_plan_QuickPlan_PTHPlanning = require("./routes/10.17.66.122/iot/smart/PTHPlanning/QuickPlan/smart_product_lot_wip_pth_plan");

const smart_product_lot_wip_pth_pln_stdmaster_MasterPlanEdit_PTHPlanning = require("./routes/10.17.66.122/iot/smart/PTHPlanning/MasterPlanEdit/smart_product_lot_wip_pth_pln_stdmaster");
//*----------------PTH Planning-----------------------------//

//*----------------Smart-Quality-Information----------------//
const smart_quality_information_add_quality = require("./routes/10.17.66.122/iot/smart/smart-Quality-Information/smart_qa_claim_header/smart_qa_claim_header");
//*---------------------------------------------------------//

//*----------------Smart-ELT-Final-Scan----------------//
const Smart_ELT_Final_Scan_ELT_Final_Scan_fpc_fin_elt_sn_scan = require("./routes/10.17.66.121/iot/fpc/Smart-ELT-Final-Scan/ELT-Final-Scan/fpc_fin_elt_sn_scan");
//*----------------Smart-ELT-Final-Scan----------------//

//*----------------Smart-Machine-and-IOT-Connect-Device----------------//
const SmartMachineandIOTConnectDevice_machine_iot_device_smart_machine_connect_list = require("./routes/10.17.66.122/iot/smart/SmartMachineandIOTConnectDevice/machine_iot_device/smart_machine_connect_list");
//*----------------Smart-Machine-and-IOT-Connect-Device----------------//

const app = express();
// app.use(compression()); // ใช้งาน compression middleware
app.use(cors());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use(
  "/smart_link_page/machine_iot_device/smart_machine_connect_list",
  smart_link_page_machine_iot_device_smart_machine_connect_list
);
app.use("/api/smart_overall_require", smart_overall_require_08003809);
app.use(
  "/api/smart_overall_require_08003809_action",
  smart_overall_require_08003809_action
);

//*-------------------Smart_benefit---------------------//
app.use(
  "/smart_benefit/smart_benefit_summary/smart_benefit_action",
  smart_benefit_smart_benefit_summary_smart_benefit_action
);
app.use(
  "/smart_benefit/smart_benefit_summary/smart_benefit_header",
  smart_benefit_smart_benefit_summary_smart_benefit_header
);
//*-------------------Smart_benefit---------------------//

//*-------------------smart_collaboration_task---------------------//
app.use(
  "/smart-collaboration-task/task/smart_collaboration_task",
  smart_collaboration_task_task_smart_collaboration_task
);
app.use(
  "/smart-collaboration-task/task/smart_man_master_hr",
  smart_collaboration_task_task_smart_man_master_hr
);
app.use(
  "/smart-collaboration-task/register/smart_collaboration_master_add_dept",
  smart_collaboration_task_register_smart_collaboration_master_add_dept
);
//*-------------------smart_collaboration_task---------------------//

//*-------------------------SmartAOI---------------------------//
app.use("/smart_aoi/ost/fin_ost_reject_day", fin_ost_reject_day);
app.use("/smart_aoi/ost/fin_ost_reject_month", fin_ost_reject_month);
app.use("/smart_aoi/ost/fin_ost_reject_week", fin_ost_reject_week);

app.use("/smart_aoi/aoi/cfm_aoi_reject_day", cfm_aoi_reject_day);
app.use("/smart_aoi/aoi/cfm_aoi_reject_lot", cfm_aoi_reject_lot);

app.use("/aoi_reject/fpc_cfm_aoi_reject_day", fpc_cfm_aoi_reject_day);
app.use("/aoi_reject/fpc_cfm_aoi_reject_lot", fpc_cfm_aoi_reject_lot);
//*-------------------------SmartAOI---------------------------//

//*-------------------------SmartFactoryManWorking-------------------------//
app.use("/api/smart_man_working_status", smart_man_working_status);
app.use(
  "/smart_man_working_status/smart_man_working_summary",
  smart_man_working_summary
);
app.use("/api/smart_man_tc_certificate", smart_man_tc_certificate);
app.use(
  "/smart_man_working_status/smart_man_lock_process",
  smart_man_lock_process
);
//*-------------------------SmartFactoryManWorking-------------------------//

//*--------------------------Smart Man Power Working Input--------------------//
app.use(
  "/smart_man_master_process/Man_working_input/SmartFacManWorkingInput",
  smart_man_master_process_Man_working_input_SmartFacManWorkingInput
);
app.use(
  "/smart_man_working_input/Man_working_input/SmartFacManWorkingInput",
  smart_man_working_input_Man_working_input_SmartFacManWorkingInput
);
app.use(
  "/smart_man_master_hr/Man_working_record/SmartFacManWorkingInput",
  smart_man_master_hr_Man_working_record_SmartFacManWorkingInput
);
//*--------------------------Smart Man Power Working Input--------------------//

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
//*-------------------------SmartFox---------------------------//

app.use(
  "/master_issue_list/customer_mil/smart_mil_common",
  master_issue_list_customer_mil_smart_mil_common
);

app.use("/api/smt_plasma_sacn_mc_rack", smt_plasma_sacn_mc_rack);
// app.use(
//   "/fox-holding-time-track/foxsystem_holding_time",
//   foxsystem_holding_time
// );

//*----------------LPI----------------------------//
app.use("/smart_lpi/rlsb-r2-36-62/jwdb_r23662_actv", jwdb_r23662_actv);
app.use("/smart_lpi/rlse-alingment/jwdb_rlse_beac", jwdb_rlse_beac);
app.use("/smart_lpi/RLSE-Cycle-Time/jwdb_rlse_beac", jwdb_rlse_beac_cycle_time);
app.use("/smart_lpi/lrphp/jwdb_rphp_beac_actv", jwdb_rphp_beac_actv);
app.use(
  "/smart_lpi/les-di-af-focus/asteria_lsedi_screen_exposedata",
  asteria_lsedi_screen_exposedata
);
app.use(
  "/smart_lpi/les-no-exp/fpc_lse_alignment_noexp",
  fpc_lse_alignment_noexp
);
app.use("/smart_lpi/screen-tension/lpi_screen_tension", lpi_screen_tension);
//*----------------LPI----------------------------//
//*-------------------------CFM---------------------------//
app.use("/smart-cfm/rdflv-mck/jwdb_rdflv_mck_actv", jwdb_rdflv_mck_actv);
app.use("/smart-cfm/rdfl/jwdb_rdfl_mck_actv", jwdb_rdfl_mck_actv);
app.use(
  "/smart-cfm/rdfly-mck-group/jwdb_rdflv_gro_up_actv",
  jwdb_rdflv_gro_up_actv
);
app.use("/smart-cfm/rexp-alingment/jwdb_rexp_two_line", jwdb_rexp_two_line);
app.use(
  "/smart-cfm/rexp-uv-power/jwdb_rexp_two_line",
  jwdb_rexp_two_line_uv_power
);
app.use(
  "/smart-cfm/rexp-tract-time/jwdb_rexp_two_line",
  jwdb_rexp_two_line_tract_time
);
app.use("/smart-cfm/Parameter-Set/fpc_raoi_set_camtek", fpc_raoi_set_camtek);
//*-------------------------CFM---------------------------//
//*-------------------------CVC---------------------------//
app.use("/smart-cvc/rcur-temperature/jwdb_rcur_b", jwdb_rcur_b);
app.use("/smart-cvc/rcll-alignment/jwdb_rcll", jwdb_rcll);
app.use("/smart-cvc/ink-tapetest/cvc_ui_tape_test", cvc_ui_tape_test);
//*-------------------------CVC---------------------------//
//*-------------------------SFT---------------------------//
app.use("/smart-sft/enig-mto-ni/fpc_sft_elgop_mto_ni", fpc_sft_elgop_mto_ni);
//*-------------------------SFT---------------------------//
//*---------------SMT-BE-----------------------------//
app.use(
  "/smt-be/packing_vacuum_seal/smt_vacuum_seal_data",
  smt_vacuum_seal_data_smt_be_packing_vacuum_seal
);
app.use("/smt-be/avi/smt_avi_set_log", smt_avi_set_log_smt_be_avi);
app.use("/smt-be/avi/smt_avi_alarm_applog", smt_avi_alarm_applog_smt_be_avi);
//*---------------SMT-BE-----------------------------//
//*---------------SMT-MOT-----------------------------//
app.use("/smt-mot/pre-baking/smt_binder_oven_data", smt_binder_oven_data);
app.use("/smt-mot/reflow/smt_reflow_tamura_set_log", smt_reflow_tamura_set_log);
app.use(
  "/smt-mot/reflow/smt_reflow_tamura_temp_log",
  smt_reflow_tamura_temp_log
);
app.use("/smt-mot/reflow/smt_reflow_smic_set_log", smt_reflow_smic_set_log);
app.use("/smt-mot/reflow/smt_reflow_smic_actv", smt_reflow_smic_actv);

app.use("/smt-mot/print/smt_print_lock_data", smt_print_lock_data);
app.use(
  "/smt_mot_print_set/smt_print_program_log_cleaningcondition",
  smt_print_program_log_cleaningcondition
);
app.use(
  "/smt_mot_print_set/smt_print_program_log_printcondition",
  smt_print_program_log_printcondition
);
app.use(
  "/smt_mot_print_set/smt_print_program_log_printposition",
  smt_print_program_log_printposition
);
app.use(
  "/smt-mot/pickandplace/setting-tab/smt_mount_program_log_header",
  smt_mount_program_log_header_smt_mot_PickandPlace_SettingTab
);
app.use(
  "/smt-mot/pickandplace/setting-tab/smt_mount_program_log_result",
  smt_mount_program_log_result_smt_mot_PickandPlace_SettingTab
);
app.use(
  "/smt-mot/pickandplace/alarm-tab/smt_mount_operation_log_alarm",
  smt_mount_operation_log_alarm_smt_mot_PickandPlace_AlarmTab
);
app.use(
  "/smt-mot/Print/alarm-tab/smt_print_alarm_log",
  smt_print_alarm_log_smt_mot_Print_AlarmTab
);

//*---------------SMT-MOT-----------------------------//
//*---------------Smart Calling parameter tracking-----------------------------//
app.use(
  "/api/smart_jv_parameter_calling_track",
  smart_jv_parameter_calling_track
);
//*---------------Smart Calling parameter tracking-----------------------------//
//*---------------Smart Quality Insight-----------------------------//
app.use("/api/smart_reject_fpc_by_prd_weight", smart_reject_fpc_by_prd_weight);
app.use("/smart_product_lot_wip/smart_product_lot_wip", smart_product_lot_wip);
app.use(
  "/smart_reject_fpc_by_sheet/smart_reject_fpc_by_sheet",
  smart_reject_fpc_by_sheet
);
app.use(
  "/smart_reject_by_item/smart_reject_fpc_product_item",
  smart_reject_fpc_product_item
);
app.use(
  "/quality_insight/product_improvement/smart_reject_fpc_product_item",
  smart_reject_fpc_product_item_improvement
);
//*---------------Smart Quality Insight-----------------------------//
//*---------------Smart-Vertify-Report-----------------------------//
// smart_jv_parameter_calling
app.use(
  "/smart_verify_report/Verify_Report/smart_jv_parameter_calling",
  smart_jv_parameter_calling
);
app.use(
  "/smart_verify_report/Master_Verify_Report/smt_goldenmaster_zaoi_aoi",
  smt_goldenmaster_zaoi_aoi
);
app.use(
  "/smart_verify_report/Master_Verify_Report/smt_goldenmaster_zxra_xray",
  smt_goldenmaster_zxra_xray
);
app.use(
  "/smart_verify_report/Master_Verify_Report/smart_master_fin_fost_verify",
  smart_master_fin_fost_verify
);
app.use(
  "/smart_verify_report/VerifyreportSummary/smart_jv_parameter_calling",
  smart_jv_parameter_calling_Smartverify_VerifyReportSummary
);
//*---------------Smart-Vertify-Report-----------------------------//
//*---------------smart_cost_insight-----------------------------//
app.use(
  "/smart_cost_insight/cost_total/smart_cost_a1_month",
  smart_cost_a1_month
);
app.use(
  "/smart_cost_insight/cost_total/smart_cost_item_month_kpi",
  smart_cost_item_month_kpi
);
app.use(
  "/smart_cost_insight/cost_by_division/smart_cost_div_kpi",
  smart_cost_div_kpi
);
app.use(
  "/smart_cost_insight/cost_by_dept/smart_cost_item_daily_kpi",
  smart_cost_item_daily_kpi
);
app.use("/smart_cost_insight/cost_by_dept/smart_cost_kpi", smart_cost_kpi);
app.use(
  "/smart_cost_insight/Amount/smart_cost_amout_month",
  smart_cost_amout_month
);
app.use(
  "/smart_cost_insight/pte_repair_cost/smart_cost_acc_code",
  smart_cost_acc_code
);
app.use(
  "/smart_cost_insight/atd_tool_and_repairing_cost/smart_cost_acc_code_atd",
  smart_cost_acc_code_atd
);
//*---------------smart_cost_insight-----------------------------//
//*---------------smart-Infomation-----------------------------//
app.use(
  "/smart_information/smart_machine_connect_list",
  smart_machine_connect_listPageinfomation
);
app.use("/machine_lq_qualify/smart_machine_upd", smart_machine_upd);
app.use(
  "/smart_information/npi_product_status/smart_machine_upd_npi_product_status",
  smart_machine_upd_npi_product_status
);
app.use(
  "/smart_information/ul_product/smart_product_ul",
  smart_product_ul_ULProduct_SmartInformation
);
//*---------------smart-Infomation-----------------------------//
//*---------------smart-OEE-/TEEP-----------------------------//
app.use("/smart-oee-teep/oee-teep/smart_machine_oee", smart_machine_oee);
app.use(
  "/smart_oee_teep/quick_plan/smart_product_lot_wip_holdingtime",
  smart_product_lot_wip_holdingtime
);
app.use(
  "/smart_oee_teep/fa_npm_lot_monitoring/smart_product_lot_fa_npi_master",
  smart_product_lot_fa_npi_master
);

app.use(
  "/smart_oee_teep/oeemastertable/smart_machine_oee_master",
  smart_machine_oee_master_OeeMasterTable_SmartOEE_TEEP
);

//*---------------smart-OEE-/TEEP-----------------------------//
//*---------------Smart-smt-stopper-lock-status-----------------------------//
app.use("/stopper-lock-status/smt_lock_signal_dev", smt_lock_signal_dev);
app.use(
  "/StopperLockStatus/SolderLifetime/smt_print_solder_lifetime",
  StopperLockStatus_SolderLifetime_StopperLockStatus
);
//*---------------Smart-smt-stopper-lock-status-----------------------------//
//*--------------smt-inspection-record---------------------------------------//
app.use("/smt/smt_fin_sn_record_temp", smt_fin_sn_record_temp);
//*--------------smt-inspection-record---------------------------------------//
//*--------------smt-KPI---------------------------------------//
app.use("/smart-kpi-dashboard/smart_kpi_a1_main", smart_kpi_a1_main);
//*--------------smt-KPI---------------------------------------//
//*--------------System_Monitoring---------------------------------------//
app.use(
  "/api/system_loging_parameter_monitoring_schedule",
  system_loging_parameter_monitoring_schedule
);
app.use(
  "/api/system_loging_parameter_monitoring",
  system_loging_parameter_monitoring
);
//*--------------System_Monitoring---------------------------------------//
//*--------------smt-OK2S---------------------------------------//
app.use("/SmartOK2s/smart_OK2s_/smart-ok2s", SmartOK2s_smart_OK2s__smart_ok2s);
app.use(
  "/SmartOK2s/smart_OK2s_Status/smart_ok2s_status_summary",
  SmartOK2s_smart_OK2s_Status_smart_ok2s_status_summary
);
//*--------------smt-OK2S---------------------------------------//
//*--------------smart_cctv---------------------------------------//
app.use("/smart_cctv/smart_cctv", smart_cctv);
//*--------------smart_cctv---------------------------------------//
//*--------------smart_fox_conn_shipbox---------------------------------------//
app.use(
  "/smartfoxconnshipbox/dashboard/foxconn_json_detail",
  foxconn_json_detail
);
app.use(
  "/smartfoxconnshipbox/Warehouse-box-scan/foxconn_label_box",
  foxconn_label_box
);
//*--------------smart_fox_conn_shipbox---------------------------------------//
//*--------------smart_fox_conn_dashboard---------------------------------------//
app.use(
  "/SmartFoxConnDashboard/sheetbarcodecheck/foxconn_report",
  foxconn_report_sheetbarcodecheck
);
app.use(
  "/SmartFoxConnDashboard/lotbarcodecheck/foxconn_report",
  foxconn_report_LotBarcodeCheck
);
//*--------------smart_fox_conn_dashboard---------------------------------------//
//*--------------FoxConn Packing Scan---------------//
app.use(
  "/SmartFoxConnPackingScan/FoxConnPackingScan/foxconn_label",
  foxconn_label_foxConnPackingScan_PackingScan
);
//*--------------FoxConn Packing Scan---------------//
//*--------------FoxConn Unpack----------------------//
app.use(
  "/unpack/engineerMode/foxconn_label",
  foxconn_label_unpack_engineerMode
);
app.use(
  "/unpack/engineerMode/foxconn_report",
  foxconn_report_unpack_engineerMode
);
//*--------------FoxConn Unpack----------------------//
//*--------------smart_energy---------------------------------------//
app.use(
  "/over-all-energy/smart_energy_mdb_by_month",
  smart_energy_mdb_by_month_over_all_energy
);
app.use(
  "/loadtype/smart_energy_mdb_by_month",
  smart_energy_mdb_by_month_loadtype
);
app.use(
  "/bue-by-depart/smart_energy_mdb_by_month",
  smart_energy_mdb_by_month_bue_by_depart
);
app.use(
  "/bue-by-depart/smart_energy_mdb_month_bue_dept",
  smart_energy_mdb_month_bue_dept_bue_by_depart
);
app.use(
  "/bue-by-depart/smart_energy_mdb_month_bue_deptbuild",
  smart_energy_mdb_month_bue_deptbuild_bue_by_depart
);
app.use(
  "/depart_indirect/smart_energy_mdb_by_month_depart_indirect",
  smart_energy_mdb_by_month_depart_indirect
);
app.use(
  "/daily_energy/smart_energy_mdb_daily_daily_energy",
  smart_energy_mdb_daily_daily_energy
);
app.use("/raw_data_mdb/mdb_energy_master_result", mdb_energy_master_result);
app.use("/smart_energy/smart_energy_mdb_daily", smart_energy_mdb_daily);
//*--------------smart_energy---------------------------------------//
//*--------------smart-holding-time---------------------------------//
app.use(
  "/holding-time/holding_time_dashboard/fpc_holdingtime_ab",
  fpc_holdingtime_ab_holding_time_dashboard
);
app.use(
  "/holding-time/lock_lot_count/fpc_holdingtime_ab",
  fpc_holdingtime_ab_lock_lot_count
);
//*--------------smart-holding-time---------------------------------//
//*--------------smart-AUT-Tooling-Management---------------------------------//
app.use(
  "/smart_aut_tooling_management/smart_aut_die_detail",
  smart_aut_die_detail
);

app.use(
  "/smart_aut_tooling_management/smart_aut_die_dropdown",
  smart_aut_die_dropdown
);

app.use(
  "/smart_aut_tooling_management/smart_aut_die_master",
  smart_aut_die_master
);
//*--------------smart-AUT-Tooling-Management---------------------------------//
//*--------------Smart-FAI-Record---------------------------------------------//
app.use(
  "/Smart-FAI-Record/Smart-FAI-Master/FAI_master/fpc_fai_master_header",
  smart_fai_record_master_smart_fai_master_header
);
app.use(
  "/Smart-FAI-Record/Smart-FAI-Record/FAI_header/fpc_fai_result_header",
  smart_fai_record_header_smart_fai_result_header
);
app.use(
  "/Smart-FAI-Record/Smart-FAI-Record/FAI_detail/fpc_fai_result_detail",
  smart_fai_record_detail_smart_fai_result_detail
);
//*--------------Smart-FAI-Record---------------------------------------------//
//*---------------PM Check Sheet-----------------------------//
app.use(
  "/pm_check_sheet/pm_master/smart_pte_pm_header_master",
  smart_pte_pm_header_master
);

app.use(
  "/pm_check_sheet/master_record/smart_pte_pm_header_record_master",
  smart_pte_pm_header_record_master
);

app.use(
  "/pm_check_sheet/working_record/smart_pte_pm_record",
  smart_pte_pm_record
);

app.use(
  "/pm_check_sheet/report/smart_pte_pm_record_details/Report/PMChectSheet",
  smart_pte_pm_record_details_Report_PMChectSheet
);
//*---------------PM Check Sheet-----------------------------//
//*---------------Inventory Part-----------------------------//
app.use(
  "/inventory_part/inventory_status/smart_inventory_pte_part",
  smart_inventory_pte_part
);
//*---------------Inventory Part-----------------------------//
app.use("/foxConn/export-report/foxconn_report_export", foxconn_report_export);
//*-------------------SN_Real_time_Connect--------------//
app.use(
  "/SN_Real_time_Connect/FQC_Connect_FPC_System/smt_fin_sn_record",
  smt_fin_sn_record_FQC_Connect_FPC_System_SN_Real_time_Connect
);
//*-------------------SN_Real_time_Connect--------------//
//*-------------------foxconn re-print-label--------------//
app.use(
  "/foxconn_Re_Print/Re_Print_Label/foxconn_report",
  foxconn_report_Re_Print_Label_foxconn_Re_Print
);
//*-------------------foxconn re-print-label--------------//
//*---------------------SPC Spec Master------------------------//
app.use(
  "/spc_spec_master/spc_spec_master/smart_ipqc_parameter_spec_ctrl_master",
  smart_ipqc_parameter_spec_ctrl_master
);
//*---------------------SPC Spec Master------------------------//
//*-----------Smart Environmen-----------//
app.use(
  "/env_temp_sensor_data/Auto_Temp_and_Humidity/Smart_Environment",
  env_temp_sensor_data_Auto_Temp_and_Humidity_Smart_Environment
);
app.use(
  "/env_particle_sensor_data/Auto_Particle_Count/Smart_Environment",
  env_particle_sensor_data_Auto_Particle_Count_Smart_Environment
);
app.use(
  "/fpc_particle_record/Particle/Smart_Environment",
  fpc_particle_record_Particle_Smart_Environment
);
//*-----------Smart Environmen-----------//
//*----------------Barcode Grade-----------------------------//
app.use(
  "/barcode_grade/FLASBarcodeGrade/BarcodeGrade/fpc_fin_flas_barcode_grade",
  fpc_fin_flas_barcode_grade_FLASBarcodeGrade_BarcodeGrade
);
//*----------------Barcode Grade-----------------------------//
//*----------------Station Yield-----------------------------//
app.use(
  "/smart_product_lot_station_yield/Stationyield/Stationyield",
  smart_product_lot_station_yield_Stationyield_Stationyield
);
//*----------------Station Yield-----------------------------//
//*----------------Smart-GR-and-R-Upload---------------------//
app.use(
  "/smart_machine_grr/GRR_upload/smart_machine_grr_UploadGrr_Grr_upload",
  smart_machine_grr_UploadGrr_Grr_upload
);
//*----------------Smart-GR-and-R-Upload---------------------//
//*------------Smart-Eworking-User-Pasword----------------------//
app.use(
  "/smart_man_master_hr/Smart_Eworking_User_Pasword/Registor_E_Working",
  smart_man_master_hr_Smart_Eworking_User_Pasword_Registor_E_Working
);
app.use(
  "/eworking_user_password/Smart_Eworking_User_Pasword/Registor_E_Working",
  eworking_user_password_Smart_Eworking_User_Pasword_Registor_E_Working
);
//*------------Smart-Eworking-User-Pasword----------------------//
//*------------Smart-BoxPlot_Web----------------------//
app.use(
  "/smart_eworking_data_lake/SPC_LPI_Printing_Thickness/LPI_Printing_Thickness",
  smart_eworking_data_lake_SPC_LPI_Printing_Thickness_LPI_Printing_Thickness
);
//*------------Smart-BoxPlot_Web----------------------//
//*------------Smart-Export_Data----------------------//
app.use(
  "/foxconn_report/export_data/foxconn_export_data",
  foxconn_report_export_data_foxconn_export_data
);
//*------------Smart-Export_Data----------------------//
//*----------------Annual Audit Checklist-----------------------------//
app.use(
  "/annual_audit_checklist/annual_audit/smart_audit_checklist",
  smart_audit_checklist_AnnualAudit_AnnualAuditChecklist
);
//*----------------Annual Audit Checklist-----------------------------//

//*----------------PTH Planning-----------------------------//
app.use(
  "/smart_product_lot_wip_pth_plan/quick_plan/pth_planing",
  smart_product_lot_wip_pth_plan_QuickPlan_PTHPlanning
);
app.use(
  "/smart_product_lot_wip_pth_pln_stdmaster/master_plan_edit/pth_planning",
  smart_product_lot_wip_pth_pln_stdmaster_MasterPlanEdit_PTHPlanning
);
//*----------------PTH Planning-----------------------------//

//*----------------Smart-Quality-Information----------------//
app.use(
  "/smart-quality-information/smart_qa_claim_header/smart_quality_information_add_quality",
  smart_quality_information_add_quality
);
//*----------------Smart-Quality-Information----------------//

//*----------------Smart-ELT-Final-Scan----------------//
app.use(
  "/Smart_ELT_Final_Scan/ELT_Final_Scan/fpc_fin_elt_sn_scan",
  Smart_ELT_Final_Scan_ELT_Final_Scan_fpc_fin_elt_sn_scan
);
//*----------------Smart-ELT-Final-Scan----------------//

//*----------------Smart-Machine-and-IOT-Connect-Device----------------//
app.use(
  "/SmartMachineandIOTConnectDevice/machine_iot_device/smart_machine_connect_list",
  SmartMachineandIOTConnectDevice_machine_iot_device_smart_machine_connect_list
);
//*----------------Smart-Machine-and-IOT-Connect-Device----------------//
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
