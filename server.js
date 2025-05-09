const express = require("express");
const dotenv = require("dotenv");
const globalError = require("./middedlewares/errorMiddleware");
dotenv.config({ path: "config.env" });
const dbConnection = require("./database");
const employeeRoute = require("./Routes/employeeRoute");
const OrganizationRoute = require("./Routes/organizationRoute");
const AttendanceRoute = require('./Routes/AttendanceRoute')

dbConnection();

const app = express();

app.use(express.json());


// Routes
app.use("/api/employee", employeeRoute);
app.use("/api/organization", OrganizationRoute);
app.use('/api/attendance', AttendanceRoute);


// Global Error Handling Middleware 
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App Running ON PORT ${PORT}`);
});

// Global promise rejection handler
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
