export function toInteger(value: any): number {
	return parseInt(`${value}`, 10);
}

export function toString(value: any): string {
	return (value !== undefined && value !== null) ? `${value}` : '';
}

export function getValueInRange(value: number, max: number, min = 0): number {
	return Math.max(Math.min(value, max), min);
}

export function isString(value: any): boolean {
	return typeof value === 'string';
}

export function isNumber(value: any): boolean {
	return !isNaN(toInteger(value));
}

export function isInteger(value: any): boolean {
	return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

export function isDefined(value: any): boolean {
	return value !== undefined && value !== null;
}

export function padNumber(value: number) {
	if (isNumber(value)) {
		return `0${value}`.slice(-2);
	} else {
		return '';
	}
}

export function regExpEscape(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


export function parseDate(date: Date, format) {
	let o = {
		'M+': date.getMonth() + 1, // month
		'd+': date.getDate(),    // day
		'h+': date.getHours(),   // hour
		'm+': date.getMinutes(), // minute
		's+': date.getSeconds(), // second
		'q+': Math.floor((date.getMonth() + 3) / 3),  // quarter
		'S': date.getMilliseconds() // millisecond
	};
	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1,
			(date.getFullYear() + '').substr(4 - RegExp.$1.length));
	}
	for (let k in o) {
		if (new RegExp('(' + k + ')').test(format)) {
			format = format.replace(RegExp.$1,
				RegExp.$1.length === 1 ? o[k] :
					('00' + o[k]).substr(('' + o[k]).length));
		}
	}
	return format;
}

