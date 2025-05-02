const cron = require('node-cron');
const Book = require('../models/Book');
const SignUser = require('../models/SignUser');
const Service = require('../models/Service');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'rabikc139@gmail.com',
        pass: "wrfy frrv xmkz uobl", // This should be your App Password, not your regular Gmail password
    }
});

// Function to send appointment reminder email
const sendAppointmentReminder = async (email, appointment, serviceName) => {
    try {
        const mailOptions = {
            from: {
                name: 'Astar Unisex Salon',
                address: 'rabikc139@gmail.com'
            },
            to: email,
            subject: 'Appointment Reminder - Astar Unisex Salon',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Appointment Reminder</h2>
                    <p>You have only 10 minutes for your service at Astar Unisex Salon. Please arrive soon!</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Service:</strong> ${serviceName}</p>
                        <p><strong>Time:</strong> ${appointment.time}</p>
                        <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                        <p><strong>Seat Number:</strong> ${appointment.seatNumber}</p>
                    </div>
                    <p>Thank you for choosing Astar Unisex Salon!</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Appointment reminder email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending appointment reminder email:', error);
        return false;
    }
};

// Function to check for upcoming appointments and send reminders
const checkUpcomingAppointments = async () => {
    try {
        // Get current time
        const now = new Date();
        
        // Calculate time window for reminders (10 minutes before appointment)
        // Using a wider window to ensure we don't miss appointments
        const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
        const elevenMinutesFromNow = new Date(now.getTime() + 11 * 60 * 1000);
        
        // Find appointments that start in approximately 10 minutes (within a 1-minute window)
        const upcomingAppointments = await Book.find({
            startTime: { $gte: tenMinutesFromNow, $lt: elevenMinutesFromNow },
            completed: false
        });
        
        console.log(`Found ${upcomingAppointments.length} upcoming appointments for reminders at ${now.toLocaleTimeString()}`);
        
        // Send reminder emails for each appointment
        for (const appointment of upcomingAppointments) {
            try {
                // Find user information
                const user = await SignUser.findById(appointment.userId);
                if (!user || !user.email) {
                    console.log(`Could not find email for appointment ID: ${appointment._id}`);
                    continue;
                }
                
                // Find service information
                const service = await Service.findById(appointment.service);
                const serviceName = service ? service.name : 'your scheduled service';
                
                // Send the reminder
                const sent = await sendAppointmentReminder(user.email, appointment, serviceName);
                if (sent) {
                    console.log(`Reminder sent to ${user.email} for appointment ID: ${appointment._id}`);
                } else {
                    console.log(`Failed to send reminder for appointment ID: ${appointment._id}`);
                }
            } catch (err) {
                console.error(`Error processing appointment ${appointment._id}:`, err);
            }
        }
    } catch (error) {
        console.error('Error checking upcoming appointments:', error);
    }
};

// Schedule the job to run every minute
const startAppointmentReminderScheduler = () => {
    console.log('Starting appointment reminder scheduler...');
    
    // Run an immediate check when the server starts
    checkUpcomingAppointments();
    
    // Then schedule regular checks every minute
    cron.schedule('* * * * *', async () => {
        await checkUpcomingAppointments();
    });
};

module.exports = { startAppointmentReminderScheduler };