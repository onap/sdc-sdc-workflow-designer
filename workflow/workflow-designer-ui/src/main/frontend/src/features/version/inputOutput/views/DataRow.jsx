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

import { Input, Checkbox, SVGIcon } from 'sdc-ui/lib/react';

const DataRow = ({
    data: { name, type, mandatory },
    types,
    nameErrorMessage,
    handleNameChange,
    handleNameBlur,
    handleTypeChange,
    handleMandatoryChange,
    handleRemoveClick
}) => (
    <div className="input-output__tr">
        <div className="input-output__td">
            <Input
                errorMessage={nameErrorMessage}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                type="text"
                value={name}
            />
        </div>
        <div className="input-output__td">
            <select
                className="input-output-select"
                value={type}
                onChange={handleTypeChange}>
                {types.map((type, i) => (
                    <option key={`type.${i}`} value={type}>
                        {type}
                    </option>
                ))}
            </select>
        </div>
        <div className="input-output__td input-output__td--unflex">
            <Checkbox
                value="myVal"
                onChange={handleMandatoryChange}
                checked={mandatory}
            />
        </div>
        <div className="input-output__td input-output__td--unflex input-output__td--icon">
            <SVGIcon name="trashO" onClick={handleRemoveClick} />
        </div>
    </div>
);

DataRow.propTypes = {
    data: PropTypes.object,
    types: PropTypes.array,
    nameErrorMessage: PropTypes.string,
    handleNameChange: PropTypes.func,
    handleNameBlur: PropTypes.func,
    handleTypeChange: PropTypes.func,
    handleMandatoryChange: PropTypes.func,
    handleRemoveClick: PropTypes.func
};

export default DataRow;
