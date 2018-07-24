/**
 * numberFixedLen.pipe
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numberFixedLen'
})
export class NumberFixedLenPipe implements PipeTransform {
    transform(num: number, len: number): any {
        let numberInt = Math.floor(num);
        let length = Math.floor(len);

        if (num === null || isNaN(numberInt) || isNaN(length)) {
            return num;
        }

        let numString = numberInt.toString();

        while (numString.length < length) {
            numString = '0' + numString;
        }

        return numString;
    }
}
