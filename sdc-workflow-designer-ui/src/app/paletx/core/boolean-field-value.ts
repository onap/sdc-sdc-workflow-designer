/* tslint:disable:array-type member-access variable-name */
function booleanFieldValueFactory() {
  return function booleanFieldValueMetadata(target: any, key: string): void {
	const defaultValue = target[key];
	const localKey = `__ky_private_symbol_${key}`;
	target[localKey] = defaultValue;

	Object.defineProperty(target, key, {
		get() {
		return (this)[localKey];
		},
		set(value: boolean) {
		(this)[localKey] = value !== null && `${value}` !== 'false';
		}
	});
  };
}

export {booleanFieldValueFactory as BooleanFieldValue};
