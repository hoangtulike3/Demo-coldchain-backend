export declare class TaskRepo {
    getTasks(userId: string, page: number, pageSize: number, searchName: string): Promise<{
        tasks: any[];
        totalCount: number;
    }>;
    addTask(task: any, userId: string): Promise<any>;
    modifyTask(task: any, taskId: string): Promise<any>;
    getTask(taskId: string): Promise<any>;
    getTaskParticipants(taskId: string): Promise<any[]>;
    isParticipant(userId: string, taskId: string): Promise<boolean>;
    getProcedure(): Promise<any[]>;
    getRtp(): Promise<any[]>;
}
