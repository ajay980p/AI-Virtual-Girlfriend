export type ChatRequest = {
    user_id: string;
    message: string;
    conversation_id?: string | null;
    auth_token?: string | null;
};

export type ChatResponse = {
    response: string;
    conversation_id?: string | null;
};
