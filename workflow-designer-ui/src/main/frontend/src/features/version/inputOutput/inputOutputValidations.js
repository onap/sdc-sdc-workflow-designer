/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

export const getValidationsError = dataRows => {
    const error = {};

    const groupBy = dataRows.reduce((result, value, key) => {
        const groupKey = value.name.toLowerCase();

        if (groupKey) {
            if (result.hasOwnProperty(groupKey)) {
                result[groupKey].push(key);
            } else {
                result[groupKey] = [key];
            }
        }
        return result;
    }, {});

    error.alreadyExists = Object.keys(groupBy).reduce((result, value) => {
        if (groupBy[value].length > 1) {
            result = [...result, ...groupBy[value]];
        }

        return result;
    }, []);

    error.invalidCharacters = dataRows.reduce((result, value, key) => {
        const groupKey = value.name;

        if (groupKey) {
            if (!/^[\w\s\d]+$/.test(groupKey)) {
                result.push(key);
            }
        }

        return result;
    }, []);

    return error;
};
