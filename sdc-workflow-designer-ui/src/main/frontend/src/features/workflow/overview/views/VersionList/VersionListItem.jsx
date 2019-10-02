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
import { Localize, Translate } from 'react-redux-i18n';

const VersionListItem = ({ data, onSelectVersion, isHeader, isSelected }) => {
    let { modificationTime, name, state, description } = data;
    const modificationText = !isHeader ? (
        <Localize value={modificationTime} dateFormat="date.long" />
    ) : (
        <Translate value="workflow.overview.lastEdited" />
    );

    function onVersionClick() {
        onSelectVersion(data);
    }

    return (
        <div
            data-test-id="version-item-row"
            className={`version-item-row ${
                isHeader ? 'header-row' : 'clickable'
            } ${isSelected ? 'selected' : ''}`}
            onClick={onVersionClick}>
            <div
                className={`version-item-field ${
                    isHeader ? 'header-field item-version' : 'item-version'
                }`}>
                {name}
            </div>
            <div
                className={`version-item-field ${
                    isHeader ? 'header-field item-status' : 'item-status'
                }`}>
                {state}
            </div>
            <div
                className={`version-item-field ${
                    isHeader ? 'header-field' : 'item-last-edited'
                }`}>
                {modificationText}
            </div>
            <div
                className={`version-item-field ${
                    isHeader ? 'header-field' : 'item-description'
                }`}>
                <div className="description-text">{description}</div>
            </div>
        </div>
    );
};

VersionListItem.propTypes = {
    data: PropTypes.object,
    onSelectVersion: PropTypes.func,
    isHeader: PropTypes.bool,
    isSelected: PropTypes.bool
};

export default VersionListItem;
