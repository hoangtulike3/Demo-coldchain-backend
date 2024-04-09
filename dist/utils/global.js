"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_timezone_1 = __importDefault(require("moment-timezone"));
moment_timezone_1.default.fn.toJSON = function () {
    return this.format();
};
moment_timezone_1.default.fn.toString = function () {
    return this.format();
};
Date.prototype.toString = function () {
    return this.toISOString();
};
Date.prototype.toJSON = function () {
    return this.toISOString();
};
Date.prototype.format = function (format) {
    return (0, moment_timezone_1.default)(this).format(format);
};
Date.prototype.add = function (amount, unit) {
    const date = new Date(this);
    switch (unit) {
        case "year":
            date.setFullYear(date.getFullYear() + amount);
            break;
        case "month":
            date.setMonth(date.getMonth() + 3);
            break;
        case "day":
            date.setDate(date.getDate() + amount);
            break;
        case "hour":
            date.setHours(date.getHours() + amount);
            break;
        case "min":
            date.setMinutes(date.getMinutes() + amount);
            break;
        case "sec":
            date.setSeconds(date.getSeconds() + amount);
            break;
        case "ms":
            date.setMilliseconds(date.getMilliseconds() + amount);
            break;
    }
    return date;
};
String.prototype.booleanify = function () {
    return ["true", "1"].includes(this.toLowerCase());
};
String.prototype.dateify = function (tz) {
    return (tz ? moment_timezone_1.default.tz(this, tz) : (0, moment_timezone_1.default)(this.toString())).toDate();
};
//# sourceMappingURL=global.js.map