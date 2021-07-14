

// export type SortingKeysFilter = {
// 	[key: string]: string| number | KeyRange;
// };
export type Entries<T> = {
	[K in keyof T]?: [K, T[K]]
}[]

export type KeyRange<T> = {
	from?: T
	to?: T
}


export type SortingKeyFilterOptions<T> = {equal?: T, range?: KeyRange<T>, begins_with?: string} 

export type SortingKeyFilter<T> = {
	[P in keyof T]?: SortingKeyFilterOptions<T[P]>
};

export type FieldsFilter<T> = {
    [P in keyof T]?: {equal?: T[P],range?: KeyRange<T[P]>, contains?: string, notEqual?: T[P], begins_with?: string} 
};

// export type OneKey<K extends string, V = any> = {
// 	[P in K]: (Record<P, V> &
// 	  Partial<Record<Exclude<K, P>, never>>) extends infer O
// 	  ? { [Q in keyof O]: O[Q] }
// 	  : never
//   }[K];

export type InputKeys = {
	[key: string]: any;
};