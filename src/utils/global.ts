import moment from "moment-timezone";

moment.fn.toJSON = function () {
  return this.format();
};

moment.fn.toString = function () {
  return this.format();
};

Date.prototype.toString = function () {
  return this.toISOString();
};

Date.prototype.toJSON = function () {
  return this.toISOString();
};

Date.prototype.format = function (format?: string) {
  return moment(this).format(format);
};

Date.prototype.add = function (amount: number, unit: UnitOfDate) {
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

String.prototype.dateify = function (tz?: string) {
  return (tz ? moment.tz(this, tz) : moment(this.toString())).toDate();
};
