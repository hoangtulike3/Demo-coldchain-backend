import PackageRepo from "../repository/package.repository";
import { Request, Response, NextFunction } from "express";
import { defaultError, response } from "../utils/response";
import { User } from "../interface/User";
import { MembershipRepo } from "../repository/membership.repository";

export const getMembershipByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // type = member, owner, guest, supporter
    const type: string = req.query.type as string;
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 10;
    const membershipRepo = new MembershipRepo();
    const members = await membershipRepo.getMembers(page, pageSize);

    response(res, members);
  } catch (e) {
    defaultError(res, e);
  }
};

export const getPackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packageId = req.params.package_id;
    const packageRepo = new PackageRepo();
    const packages = await packageRepo.getPackage(packageId);

    response(res, packages);
  } catch (e) {
    defaultError(res, e);
  }
};

export const createPackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packageObj = req.body;
    // const userId = (req.user as User).id;
    const type = "owner";
    const packageRepo = new PackageRepo();
    const packages = await packageRepo.addPackage(packageObj);

    if (packageObj.participants && packageObj.participants.length > 0) {
      for (const participantId of packageObj.participants) {
        await MembershipRepo.addMembership(participantId.toString(), packages.id, type, "package");
      }
    }

    response(res, packages);
  } catch (e) {
    defaultError(res, e);
  }
};

export const modifyPackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packageId = req.params.package_id;
    const packageObj: object = req.body;
    const packageRepo = new PackageRepo();
    const packages: any = await packageRepo.modifyPackage(packageObj, packageId);

    response(res, packages);
  } catch (e) {
    defaultError(res, e);
  }
};
