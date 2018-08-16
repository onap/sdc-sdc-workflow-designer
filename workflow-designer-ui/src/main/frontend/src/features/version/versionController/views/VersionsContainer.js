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
import VersionSelect from 'features/version/versionController/views/VersionSelect';
import { I18n } from 'react-redux-i18n';
import PropTypes from 'prop-types';

const VersionContainer = props => {
    let {
        currentWorkflowVersion,
        viewableVersions,
        onOverviewClick,
        onVersionSelectChange
    } = props;

    return (
        <div className="version-section-wrapper">
            <div className="version-status-container">
                {I18n.t('workflow.version')}
                <VersionSelect
                    currentWorkflowVersion={currentWorkflowVersion}
                    viewableVersions={viewableVersions}
                    onVersionSelectChange={onVersionSelectChange}
                />
                <span
                    className="version-selector-more-versions"
                    data-test-id="vc-versions-page-link"
                    onClick={onOverviewClick}>
                    {I18n.t('workflow.overview.viewOverview')}
                </span>
            </div>
        </div>
    );
};

VersionContainer.propTypes = {
    currentWorkflowVersion: PropTypes.object,
    viewableVersions: PropTypes.arrayOf(Object),
    onOverviewClick: PropTypes.func,
    onVersionSelectChange: PropTypes.func
};

export default VersionContainer;
