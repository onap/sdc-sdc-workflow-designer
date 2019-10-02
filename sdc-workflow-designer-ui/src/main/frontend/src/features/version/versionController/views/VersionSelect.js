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
import isEmpty from 'lodash.isempty';

const VersionSelect = props => {
    const {
        currentWorkflowVersion,
        viewableVersions,
        onVersionSelectChange
    } = props;

    function onChangeHandler(ev) {
        const versionIndex = Object.keys(viewableVersions).find(
            key => viewableVersions[key].id === ev.target.value
        );
        const currentVersion = viewableVersions[versionIndex].id;
        onVersionSelectChange(currentVersion);
    }

    return (
        <select
            className="version-selector"
            key={'selector'}
            value={currentWorkflowVersion.id}
            onChange={onChangeHandler}
            data-test-id="vc-versions-select-box">
            {!isEmpty(viewableVersions) &&
                viewableVersions.map(item => {
                    const displayedName = `${item.name} ${
                        currentWorkflowVersion.id === item.id
                            ? currentWorkflowVersion.state.toUpperCase()
                            : item.state
                    }`;
                    return (
                        <option
                            key={'versionSelect' + item.id}
                            value={item.id}
                            data-test-id="vc-version-option">
                            {displayedName}
                        </option>
                    );
                })}
        </select>
    );
};

VersionSelect.propTypes = {
    currentWorkflowVersion: PropTypes.object,
    viewableVersions: PropTypes.arrayOf(Object),
    onVersionSelectChange: PropTypes.func
};

export default VersionSelect;
