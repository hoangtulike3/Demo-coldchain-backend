import createError from "http-errors";
import { Request, Response } from "express";
import { UserRepo } from "../repository/users.repository";
import { getError, Code } from "../utils/error";
import { UserRole, isInstance } from "../utils/enum";
import { defaultError, response } from "../utils/response";
import { User } from "../interface/User";
import RandomString from "randomstring";
import { uploadPackageFileToS3 } from "../utils/s3";

// 사용자 목록
export const getUsers = async (req: Request, res: Response): Promise<User | void> => {
  try {
    // 관리자만 조회 가능
    if ((req.user as User).role !== UserRole.Admin) {
      throw createError(401, getError(Code.INVALID_CREDENTIAL));
    }

    // 사용자 목록 조회
    const keyword = req.query.keyword as string;
    const userRepo = new UserRepo();
    const users = await userRepo.findUsers(keyword);
    response(res, users);
  } catch (e) {
    defaultError(res, e);
  }
};

// GENERATE WORK ID
export const generateWorkID = async (_: Request, res: Response): Promise<User | void> => {
  try {
    let random: string = RandomString.generate(15);
    const userRepo = new UserRepo();
    const user = await userRepo.findUserByWorkID(random.toUpperCase());
    if (user) {
      random = RandomString.generate(15);
    }
    response(res, { work_id: random.toUpperCase() });
  } catch (e) {
    defaultError(res, e);
  }
};

// UPDATE CURRENT USER INFO
export const updateMyAccountDetail = async (req: Request, res: Response): Promise<User | void> => {
  try {
    const user = req.user as User;
    const userRepo = new UserRepo();
    let userObj: any = req.body;

    if (req.body.userObj) {
      userObj = JSON.parse(req.body.userObj);
    } else {
      throw createError(400, getError(Code.PARAMETER_NOT_FOUND));
    }

    const userInfo = await userRepo.getUserProfileById(user?.id);

    if (!userInfo) {
      throw createError(404, getError(Code.NOT_FOUND_USER));
    }

    let avatar_url = "";
    const files: any = req.files;
    if (files.photo) {
      const imageFile = files.photo[0];
      avatar_url = await uploadPackageFileToS3(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
    }

    const updateUser = await userRepo.modifyUser(
      {
        display_name: userObj.display_name,
        description: userObj.description,
        name: userObj.name,
        // EDIT ON RIGHT CONDITION
        ...(avatar_url && { avatar_url }),
        ...(userInfo?.type === 1 && { phone: userObj.phone }),
        ...(userInfo?.type !== 1 && { email: userObj.email }),
      },
      user.id
    );

    if (!updateUser) {
      throw createError(404, getError(Code.NOT_FOUND_USER));
    }

    response(res, updateUser);
  } catch (e) {
    defaultError(res, e);
  }
};

// UPDATE CURRENT USER STATUS
export const updateMyAccountStatus = async (req: Request, res: Response): Promise<User | void> => {
  try {
    const user = req.user as User;
    const userRepo = new UserRepo();
    const userObj: any = req.body;

    const updateUser = await userRepo.modifyUser({ status: userObj.status }, user.id);

    if (!updateUser) {
      throw createError(404, getError(Code.NOT_FOUND_USER));
    }

    response(res, updateUser);
  } catch (e) {
    defaultError(res, e);
  }
};

// GET CURRENT USER INFO
export const getMyAccountDetail = async (req: Request, res: Response): Promise<User | void> => {
  try {
    const user = req.user as User;
    const userRepo = new UserRepo();

    const userInfo = await userRepo.getUserProfileById(user?.id);

    if (!userInfo) {
      throw createError(404, getError(Code.NOT_FOUND_USER));
    }

    response(res, userInfo);
  } catch (e) {
    defaultError(res, e);
  }
};

// 사용자 등록
export const addUser = async (req: Request, res: Response): Promise<void> => {
  // 관리자만 등록 가능
  if ((req.user as User).role !== UserRole.Admin) {
    throw createError(401, getError(Code.INVALID_CREDENTIAL));
  }
  const userRepo = new UserRepo();
  const userObj: any = req.body;
  try {
    // 사용자 정보 확인
    if (!req.body.email) {
      throw createError(400, getError(Code.PARAMETER_NOT_FOUND, "body.email"));
    } else if (!req.body.role) {
      throw createError(400, getError(Code.PARAMETER_NOT_FOUND, "body.role"));
    } else if (!isInstance(req.body.role, UserRole)) {
      throw createError(400, getError(Code.PARAMETER_INVALID, "body.role", Object.values(UserRole).join(", ")));
    }
    // 이메일 중복 확인
    let user = await userRepo.getUserByEmail(req.body.email);
    if (user) {
      // 이메일 중복
      throw createError(400, getError(Code.DUPLICATE_EMAIL, req.body.email));
    }
    // 사용자 등록
    user = await userRepo.addUser(userObj);
    response(res, user);
  } catch (e) {
    defaultError(res, e);
  }
};

// 사용자 조회
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // 관리자 혹은 본인만 조회 가능
    if ((req.user as User).role !== UserRole.Admin) {
      if ((req.user as User).id !== req.params.userId) {
        throw createError(401, getError(Code.INVALID_CREDENTIAL));
      }
    }
    // 사용자 조회
    const userId = req.params.userId;
    const userRepo = new UserRepo();
    const user = await userRepo.getUserById(userId);
    if (!user) {
      // 미등록 사용자
      throw createError(404, getError(Code.NOT_FOUND_USER, userId));
    }
    response(res, user);
  } catch (e) {
    defaultError(res, e);
  }
};

// 사용자 수정
export const modifyUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // 관리자만 수정 가능
    if ((req.user as User).role !== UserRole.Admin) {
      throw createError(401, getError(Code.INVALID_CREDENTIAL));
    }
    // 사용자 정보 확인
    if (req.body.role && !isInstance(req.body.role, UserRole)) {
      throw createError(400, getError(Code.PARAMETER_INVALID, "body.role", Object.values(UserRole)));
    }
    // 이메일 중복 확인
    const userId = req.params.userId;
    const userRepo = new UserRepo();

    let user = await userRepo.getUserByEmail(req.body.email);
    if (user && user.id !== userId) {
      // 이메일 중복 (본인 제외)
      throw createError(400, getError(Code.DUPLICATE_EMAIL, req.body.email));
    }

    const userObj: any = req.body;
    // 사용자 수정
    user = await userRepo.modifyUser(userObj, userId);
    if (user === null) {
      // 미등록 사용자
      throw createError(404, getError(Code.NOT_FOUND_USER, userId));
    }
    response(res, user);
  } catch (e) {
    defaultError(res, e);
  }
};

// 사용자 탈퇴
// export const deleteUser = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // 관리자만 수정 가능
//     if ((req.user as User).role !== UserRole.Admin) {
//       throw createError(401, getError(Code.INVALID_CREDENTIAL));
//     } else if ((req.user as User).id === req.params.userId) {
//       // 본인 삭제 불가
//       throw createError(401, getError(Code.INVALID_CREDENTIAL));
//     }
//     const userId = req.params.userId;
//     await UserRepo.deleteUser(userId);

//     response(res);
//   } catch (e) {
//     defaultError(res, e);
//   }
// };
