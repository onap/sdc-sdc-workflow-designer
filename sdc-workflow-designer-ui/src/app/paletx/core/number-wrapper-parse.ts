/* tslint:disable:array-type member-access variable-name */
export function NumberWrapperParseFloat(text: any) {
  if (/^(\-|\+)?[0-9]+$/.test(text)) {
	return parseInt(text);
  } else if (/^(\-|\+)?[0-9]+\.[0-9]+$/.test(text)) {
	return parseFloat(text);
  } else {
	return 0;
  }
}
