export type Message = {
    id: string;
    content: string;
    role: 'user' | 'agent';
    timestamp: Date;
};

export type AgentAction = {
    type: 'add_item' | 'remove_item' | 'none';
    payload: any;
};

export type ChatResponse = {
    response: string;
    actions: AgentAction[];
};
