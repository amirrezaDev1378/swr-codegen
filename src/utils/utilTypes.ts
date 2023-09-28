export type GetOptionalKeys<T> = keyof { [K in keyof T as undefined extends T[K] ? K : never]: T[K] };

export type GetRequiredKeys<T> = keyof { [K in keyof T as undefined extends T[K] ? never : K]: T[K] };
