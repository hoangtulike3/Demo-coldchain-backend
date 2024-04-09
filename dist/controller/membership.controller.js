"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyPackage = exports.createPackage = exports.getPackage = exports.getMembershipByType = void 0;
const package_repository_1 = __importDefault(require("../repository/package.repository"));
const response_1 = require("../utils/response");
const membership_repository_1 = require("../repository/membership.repository");
const getMembershipByType = async (req, res, next) => {
    try {
        // type = member, owner, guest, supporter
        const type = req.query.type;
        const membershipRepo = new membership_repository_1.MembershipRepo();
        const members = await membershipRepo.getMembers(type);
        (0, response_1.response)(res, members);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getMembershipByType = getMembershipByType;
const getPackage = async (req, res, next) => {
    try {
        const packageId = req.params.package_id;
        const packageRepo = new package_repository_1.default();
        const packages = await packageRepo.getPackage(packageId);
        (0, response_1.response)(res, packages);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getPackage = getPackage;
const createPackage = async (req, res, next) => {
    try {
        const packageObj = req.body;
        // const userId = (req.user as User).id;
        const type = "owner";
        const packageRepo = new package_repository_1.default();
        const packages = await packageRepo.addPackage(packageObj);
        if (packageObj.participants && packageObj.participants.length > 0) {
            for (const participantId of packageObj.participants) {
                await membership_repository_1.MembershipRepo.addMembership(participantId.toString(), packages.id, type, "package");
            }
        }
        (0, response_1.response)(res, packages);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.createPackage = createPackage;
const modifyPackage = async (req, res, next) => {
    try {
        const packageId = req.params.package_id;
        const packageObj = req.body;
        const packageRepo = new package_repository_1.default();
        const packages = await packageRepo.modifyPackage(packageObj, packageId);
        (0, response_1.response)(res, packages);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.modifyPackage = modifyPackage;
//# sourceMappingURL=membership.controller.js.map