const mongoose = require("mongoose");

const deviceStateSchema = new mongoose.Schema(
    {
        doorStatus: {
            type: String,
            enum: ["open", "closed"],
            default: "closed",
        },
        lastDoorAccess: {
            type: String,
            enum: ["granted", "denied", null],
            default: null,
        },

        clothesStatus: {
            type: String,
            enum: ["in", "out"],
            default: "out",
        },
        clothesMode: {
            type: String,
            enum: ["manual", "auto"],
            default: "auto",
        },
        clothesWarning: {
            type: String,
            default: null,
        },

        rainStatus: {
            type: String,
            enum: ["raining", "clear"],
            default: "clear",
        },

        livingLedStatus: {
            type: Number,
            enum: [0, 1],
            default: 0,
        },
        livingLedMode: {
            type: String,
            enum: ["manual", "auto"],
            default: "auto",
        },

        bedroomLedStatus: {
            type: Number,
            enum: [0, 1],
            default: 0,
        },
        bedroomLedMode: {
            type: String,
            enum: ["manual", "auto"],
            default: "auto",
        },

        fanStatus: {
            type: Number,
            enum: [0, 1],
            default: 0,
        },
        fanMode: {
            type: String,
            enum: ["manual", "auto"],
            default: "auto",
        },

        gasStatus: {
            type: Number,
            enum: [0, 1],
            default: 0,
        },

        buzzerStatus: {
            type: Number,
            enum: [0, 1],
            default: 0,
        },

        temperature: {
            type: Number,
            default: null,
        },
        humidity: {
            type: Number,
            default: null,
        },

        peopleCount: {
            type: Number,
            default: 0,
        },

        lightStatus: {
            type: String,
            enum: ["dark", "bright", null],
            default: null,
        },

        lastScannedUID: {
            type: String,
            default: null,
        },

        rfidListRaw: {
            type: String,
            default: "empty",
        },

        esp1Online: {
            type: Boolean,
            default: false,
        },
        esp2Online: {
            type: Boolean,
            default: false,
        },

        lastAlert: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("DeviceState", deviceStateSchema);