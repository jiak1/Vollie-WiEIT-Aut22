"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var mongoose_1 = tslib_1.__importDefault(require("mongoose"));
var mongoose_2 = require("mongoose");
var ShiftSchema = new mongoose_2.Schema({
    name: {type: String, required: true},
    startAt: { type: String, required: true },
    endAt: { type: String, required: true },
    hours: { type: String, required: true },
    address: { type: String, required: true },
    addressDescription: { type: String, required: false },
    status: {type: String, default: "Scheduled"},
    users: [{ type: mongoose_1.default.Types.ObjectId, ref: "User" , required: false}],
}, {
    timestamps: true,
});

exports.default = mongoose_1.default.model("Shift", ShiftSchema);
//# sourceMappingURL=user.model.js.map