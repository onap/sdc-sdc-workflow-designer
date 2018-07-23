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
import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

const Select = props => {
    const { dataObj, selectedItemValue, disabled, label } = props;
    return (
        <div className="select-wrapper version-selector sdc-input">
            {label && <label>{label}</label>}
            <select
                className="inputinput-selector"
                key={'selector'}
                value={selectedItemValue}
                disabled={disabled}
                data-test-id="vc-select-box">
                {!isEmpty(dataObj) &&
                    dataObj.map(item => {
                        return (
                            <option
                                key={'select-item' + item.id}
                                value={item.id}
                                data-test-id="vc-option">
                                {item.displayed || item.name}
                            </option>
                        );
                    })}
            </select>
        </div>
    );
};

Select.propTypes = {
    dataObj: PropTypes.arrayOf(Object),
    selectedItemValue: PropTypes.string,
    disabled: PropTypes.bool,
    label: PropTypes.string
};

export default Select;
