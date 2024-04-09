import { User } from "../interface/User";
import { UserRole } from "../utils/enum";
export declare class UserRepo {
    /** 사용자 등록 */
    addUser(users: {
        email: string;
        name?: string;
        role?: UserRole;
        status?: string;
        phone?: string;
        avatar_url?: string;
    }): Promise<User>;
    /** 사용자 수정 */
    modifyUser(users: any, userId: string): Promise<User | null>;
    /** 사용자 조회 by 사용자 ID */
    getUserById(id: string): Promise<User | null>;
    /** 사용자 조회 by 사용자 ID */
    getUserProfileById(id: string): Promise<User | null>;
    /** 사용자 조회 by 이메일 */
    getUserByEmail(email: string): Promise<User | null>;
    /** 사용자 목록 조회 */
    findUsers(keyword?: string): Promise<User[]>;
    /** 사용자 목록 조회 */
    findUserByWorkID(work_id?: string): Promise<User | null>;
    /** 사용자 목록 조회 */
    findUserByEmail(email?: string): Promise<User | null>;
    /** 사용자 로그인 */
    authenticate(email: string): Promise<User | null>;
    /** 사용자 id 조회 */
    getUserId(id: string): Promise<User | null>;
    /** 전체 사용자 조회 */
    getUsers(): Promise<any[]>;
    /** 전체 사용자 조회 */
    getUsersName(userId: string): Promise<any[]>;
}
