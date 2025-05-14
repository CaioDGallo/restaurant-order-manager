export interface ServiceError {
	success: false;
	error: string;
}

export type ServiceResponse<T> = { success: true; data: T } | ServiceError;
