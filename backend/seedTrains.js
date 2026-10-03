const mongoose = require("mongoose");
require("dotenv").config();

const Train = require("./models/Train");

const trains = [
    {
        trainNumber: "12675",
        trainName: "Kovai Express",
        source: "Chennai",
        destination: "Coimbatore",
        departureTime: "06:10 AM",
        arrivalTime: "02:00 PM",
        fare: 550,
        availableSeats: 120,
        status: "On Time",
    },
    {
        trainNumber: "12639",
        trainName: "Brindavan Express",
        source: "Chennai",
        destination: "Bengaluru",
        departureTime: "07:40 AM",
        arrivalTime: "01:30 PM",
        fare: 480,
        availableSeats: 85,
        status: "On Time",
    },
    {
        trainNumber: "12674",
        trainName: "Cheran Express",
        source: "Coimbatore",
        destination: "Chennai",
        departureTime: "10:15 PM",
        arrivalTime: "06:00 AM",
        fare: 620,
        availableSeats: 65,
        status: "On Time",
    },
    {
        trainNumber: "12631",
        trainName: "Nellai Express",
        source: "Chennai",
        destination: "Tirunelveli",
        departureTime: "07:50 PM",
        arrivalTime: "07:00 AM",
        fare: 700,
        availableSeats: 95,
        status: "Delayed",
    },
    {
        trainNumber: "12605",
        trainName: "Pallavan Express",
        source: "Chennai",
        destination: "Trichy",
        departureTime: "05:30 PM",
        arrivalTime: "10:30 PM",
        fare: 450,
        availableSeats: 110,
        status: "On Time",
    },
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected!");

        await Train.deleteMany();

        await Train.insertMany(trains);

        console.log("Sample trains added successfully!");

        await mongoose.connection.close();

        console.log("Database connection closed.");
    } catch (error) {
        console.error("Error:", error.message);
    }
};

seedDatabase();