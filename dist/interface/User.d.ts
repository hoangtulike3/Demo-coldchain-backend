export interface User {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    phone?: string | null;
    created_at: Date | null;
    updated_at?: Date | null;
    type?: number;
}
