const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const totalrevenueRouter = require('./routes/totalrevenue');
const { startAppointmentReminderScheduler } = require('./scheduler/appointmentReminder');

connectToMongo();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
//Available Routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api/signuser',require('./routes/notes'));
app.use('/api/contact', require('./routes/contactauth'));
app.use('/api/book', require('./routes/bookauth'));
app.use('/api/admin', require('./routes/adminAuth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/holidays', require('./routes/holidays'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/totaluser', require('./routes/totaluser'));
app.use('/api/totalappointment', require('./routes/totalappointment'));
app.use('/api/totalrevenue', totalrevenueRouter);

// Start the appointment reminder scheduler
startAppointmentReminderScheduler();

app.listen(port, () => {
  console.log(`BarberShop backend listening at http://localhost:${port}`);
});