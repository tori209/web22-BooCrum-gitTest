interface WorkspaceOrderType {
	id: number;
	description: string;
}

export const orderItems: WorkspaceOrderType[] = [
	{ id: 0, description: 'Last opened' },
	{ id: 1, description: 'Last created' },
	{ id: 2, description: 'Alphabetically' },
];