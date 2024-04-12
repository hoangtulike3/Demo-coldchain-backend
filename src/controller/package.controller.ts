import createError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { defaultError, response } from "../utils/response";
import { getError, Code } from "../utils/error";
import PackageRepo from "../repository/package.repository";
import { User } from "../interface/User";
import { MembershipRepo } from "../repository/membership.repository";
import { uploadPackageFileToS3 } from "../utils/s3";
import { UserRepo } from "../repository/users.repository";

// 패키지 전체 조회
export const getPackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page: number = parseInt(req.query.page as string) || 1;
    let pageSize: number = parseInt(req.query.pageSize as string) || 10;
    const placeIds: number[] = Array.isArray(req.query.place_id)
      ? req.query.place_id.map(Number)
      : req.query.place_id
      ? [Number(req.query.place_id)]
      : [];
    const categoryIds: number[] = Array.isArray(req.query.category_id)
      ? req.query.category_id.map(Number)
      : req.query.category_id
      ? [Number(req.query.category_id)]
      : [];
    const contentIds: number[] = Array.isArray(req.query.content_id)
      ? req.query.content_id.map(Number)
      : req.query.content_id
      ? [Number(req.query.content_id)]
      : [];
    const statusIds: number[] = Array.isArray(req.query.status_id)
      ? req.query.status_id.map(Number)
      : req.query.status_id
      ? [Number(req.query.status_id)]
      : [];
    const wareIds: number[] = Array.isArray(req.query.ware_id)
      ? req.query.ware_id.map((element: any) => +element)
      : req.query.ware_id
      ? [Number(req.query.ware_id)]
      : [];
    const searchName: string = (req.query.search_name as string) || "";
    const packageRepo = new PackageRepo();
    // const userRepo = new UserRepo();
    const { packages, totalCount } = await packageRepo.getPackages(
      page,
      pageSize,
      placeIds,
      categoryIds,
      contentIds,
      statusIds,
      wareIds,
      searchName
    );

    // for (const packageObj of packages) {
    //   if (packageObj.owner && packageObj.owner.length > 0) {
    //     const ownerNames = [];
    //     for (const ownerId of packageObj.owner) {
    //       const userName = await userRepo.getUserInfo(ownerId);
    //       ownerNames.push(userName);
    //     }
    //     packageObj.owner = ownerNames;
    //   }
    // }

    if ((page - 1) * pageSize + packages.length >= totalCount) {
      pageSize = packages.length;
    }

    response(res, {
      packages,
      totalCount,
      page,
      pageSize,
      thumbnail: "https://videoai.coming.io/resources/ccs/package.webp",
    });
  } catch (e) {
    defaultError(res, e);
  }
};

export const getPackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packageId = req.params.package_id;
    const userRepo = new UserRepo();
    const packageRepo = new PackageRepo();
    const packages = await packageRepo.getPackage(packageId);
    packages.owner = [...new Set(packages.owner ?? [])].filter((element) => element);
    if (packages.owner && packages.owner.length > 0) {
      const ownerNames = [];
      for (const ownerId of packages.owner) {
        const userName = await userRepo.getUserInfo(ownerId);
        ownerNames.push(userName);
      }
      packages.owner = ownerNames;
    }

    response(res, [packages]);
  } catch (e) {
    defaultError(res, e);
  }
};

export const createPackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    let packageObj: any = req.body;
    // const userId = (req.user as User).id;
    if (req.body.packageObj) {
      packageObj = JSON.parse(req.body.packageObj);
    } else {
      throw createError(401, getError(Code.PARAMETER_NOT_FOUND));
    }

    if (!packageObj.participants) {
      packageObj.participants = [user?.id];
    }

    if (!packageObj.participants.includes(user?.id)) {
      packageObj.participants = [...new Set([...packageObj.participants, user?.id])].filter((element) => element);
    }

    const type = "owner";
    const packageRepo = new PackageRepo();
    const packages = await packageRepo.addPackage({ min_temp: -10, temp: 0, max_temp: 40, ...packageObj });

    if (packageObj.participants && packageObj.participants.length > 0) {
      for (const participantId of packageObj.participants) {
        await MembershipRepo.addMembership(participantId.toString(), packages.id, type, "package");
      }
    }

    const files: any = req.files;
    if (files.photo) {
      const imageFile = files.photo[0];
      const fileUrl = await uploadPackageFileToS3(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
      await packageRepo.addPackagePhoto(fileUrl, packages.id);
    }
    if (files.photos && files.photos.length > 0) {
      const imageFiles = files.photos;
      await Promise.all(
        imageFiles.map(async (file: Express.Multer.File) => {
          const fileUrl = await uploadPackageFileToS3(file.buffer, file.originalname, file.mimetype);
          await packageRepo.addPackagePhoto(fileUrl, packages.id);
        })
      );
    }

    response(res, packages);
  } catch (e) {
    defaultError(res, e);
  }
};

export const modifyPackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packageId = req.params.package_id;
    let packageObj: any = req.body;
    const packageRepo = new PackageRepo();
    const user = req.user as User;

    if (req.body.packageObj) {
      packageObj = JSON.parse(req.body.packageObj);
    } else {
      throw createError(400, getError(Code.PARAMETER_NOT_FOUND));
    }

    if (!packageObj.participants) {
      packageObj.participants = [user?.id];
    }

    if (!packageObj.participants.includes(user?.id)) {
      packageObj.participants = [...new Set([...packageObj.participants, user?.id])].filter((element) => element);
    }

    const oldPackages = await packageRepo.getPackage(packageId);
    if (!oldPackages?.owner.includes(user?.id)) {
      throw createError(403, getError(Code.FORBIDDEN));
    }

    // IF USER DELETE SOME PHOTO
    if (packageObj.photo_urls && packageObj.photo_urls.length > 0) {
      await packageRepo.deletePhoto(packageId, packageObj.photo_urls);
    } else {
      await packageRepo.deleteAllPhoto(packageId);
    }

    //  UPLOAD PHOTO
    const updatePackageObj = { ...packageObj };
    delete updatePackageObj.photo_urls;
    const files: any = req.files;
    if (files.photo) {
      const imageFile = files.photo[0];
      const fileUrl = await uploadPackageFileToS3(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
      await packageRepo.addPackagePhoto(fileUrl, packageId);
    }
    if (files.photos && files.photos.length > 0) {
      const imageFiles = files.photos;
      await Promise.all(
        imageFiles.map(async (file: Express.Multer.File) => {
          const fileUrl = await uploadPackageFileToS3(file.buffer, file.originalname, file.mimetype);
          await packageRepo.addPackagePhoto(fileUrl, packageId);
        })
      );
    }

    // MODIFY PACKAGE
    const packages: any = await packageRepo.modifyPackage(updatePackageObj, packageId);

    response(res, packages);
  } catch (e) {
    defaultError(res, e);
  }
};

export const getPackageFilterList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packageRepo = new PackageRepo();
    const { packageCategories, packageContents, packageWares, packageStatus } =
      await packageRepo.getPackageFilterList();

    const packageFilterList = {
      categories: packageCategories.map((type) => ({ id: type.id, name: type.name })),
      contents: packageContents.map((type) => ({ id: type.id, name: type.name })),
      wares: packageWares.map((type) => ({ id: type.id, name: type.name })),
      status: packageStatus.map((type) => ({ id: type.id, name: type.name })),
    };

    response(res, packageFilterList);
  } catch (e) {
    defaultError(res, e);
  }
};

export const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const packageId = req.params.package_id;
    const packageRepo = new PackageRepo();
    const packages = await packageRepo.getPackage(packageId);
    if (packages?.owner.includes(user?.id)) {
      await packageRepo.deletePhotoOnPackageDeleted(packageId);
      await packageRepo.deletePackage(packageId);
    } else {
      throw createError(400, getError(Code.PARAMETER_INVALID, "params.package_id"));
    }

    response(res, { message: "Delete success" });
  } catch (e) {
    defaultError(res, e);
  }
};
