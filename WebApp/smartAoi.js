const express = require("express");
const app = express();

const fin_ost_reject_day = require("../routes/10.17.66.230/iot/public/SmartAOI/OST/fin_ost_reject_day");
const fin_ost_reject_month = require("../routes/10.17.66.230/iot/public/SmartAOI/OST/fin_ost_reject_month");
const fin_ost_reject_week = require("../routes/10.17.66.230/iot/public/SmartAOI/OST/fin_ost_reject_week");
const cfm_aoi_reject_day = require("../routes/10.17.77.111/postgres/public/SmartAOI/AOI/cfm_aoi_reject_day");
const cfm_aoi_reject_lot = require("../routes/10.17.77.111/postgres/public/SmartAOI/AOI/cfm_aoi_reject_lot");
const fpc_cfm_aoi_reject_day = require("../routes/10.17.66.122/iot/fpc/aoi_reject/fpc_cfm_aoi_reject_day");
const fpc_cfm_aoi_reject_lot = require("../routes/10.17.66.122/iot/fpc/aoi_reject/fpc_cfm_aoi_reject_lot");

app.use("/ost/fin_ost_reject_day", fin_ost_reject_day);
app.use("/ost/fin_ost_reject_month", fin_ost_reject_month);
app.use("/ost/fin_ost_reject_week", fin_ost_reject_week);
app.use("/aoi/cfm_aoi_reject_day", cfm_aoi_reject_day);
app.use("/aoi/cfm_aoi_reject_lot", cfm_aoi_reject_lot);
app.use("/aoi_reject/fpc_cfm_aoi_reject_day", fpc_cfm_aoi_reject_day);
app.use("/aoi_reject/fpc_cfm_aoi_reject_lot", fpc_cfm_aoi_reject_lot);

module.exports = app;
