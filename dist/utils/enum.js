"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInstance = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "admin";
    UserRole["User"] = "user";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
function isInstance(value, type) {
    return Object.values(type).includes(value);
}
exports.isInstance = isInstance;
//# sourceMappingURL=enum.js.map