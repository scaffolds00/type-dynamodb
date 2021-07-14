export const generateObjFromArrays = (arrayKeys: string[], arrayvalues: unknown[]) => {
	if (arrayKeys.length !== arrayvalues.length){
		throw Error("arrayKeys length should equal arrayvalues length")
	}
	return arrayKeys.reduce((o, k, i) => ({...o, [k]: arrayvalues[i]}), {});
};

export const convertMapToObject = (map: [string, any][])=>{
	return map.reduce((acc, [k,v])=>({...acc,[k]:v}),{})
}
export const objIsEmpty = (obj: Record<string, unknown> | undefined| unknown[]) => {
	return obj ? Object.keys(obj).length === 0 : false;
};

