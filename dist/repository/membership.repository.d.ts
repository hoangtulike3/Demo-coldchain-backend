export declare class MembershipRepo {
    getMembership(): Promise<any[]>;
    static addMembership(userId: string, itemId: string, type: string, itemType: "place" | "package"): Promise<any>;
    static modifyMembership(members: any, userId: string): Promise<any>;
    static deleteMembership(userId: string): Promise<null>;
    getMembers(type?: string): Promise<any[]>;
    getMembershipInPlace(placeId: string): Promise<any[]>;
    getMembershipInPlaceByMember(placeId: string, type: string): Promise<any[]>;
    isParticipantPlace(placeId: string, userId: string, type: string): Promise<boolean>;
    getMembershipInPackage(packageId: string): Promise<any[]>;
}
