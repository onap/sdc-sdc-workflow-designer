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

import VersionList from 'features/workflow/overview/views/VersionList';
import VersionTree from 'features/workflow/overview/views//VersionTree';
import NewVersionContainer from 'features/version/create/views/NewVersionContainer';

const WorkflowVersions = ({
    nodeVersions,
    versions,
    onCreateVersion,
    onSelectVersion,
    selectedVersion,
    isVersionsCertifies
}) => {
    return (
        <div className="workflow-versions">
            <div className="versions-page-view">
                <NewVersionContainer
                    onCreateVersion={onCreateVersion}
                    isVersionsCertifies={isVersionsCertifies}
                />
                <div className="versions-page-list-and-tree">
                    <VersionTree
                        nodeVersions={nodeVersions}
                        selectedVersion={selectedVersion}
                    />
                    <VersionList
                        versions={versions}
                        selectedVersion={selectedVersion}
                        onSelectVersion={onSelectVersion}
                    />
                </div>
            </div>
        </div>
    );
};

WorkflowVersions.propTypes = {
    nodeVersions: PropTypes.array,
    versions: PropTypes.array,
    onCreateVersion: PropTypes.func,
    onSelectVersion: PropTypes.func,
    selectedVersion: PropTypes.string,
    isVersionsCertifies: PropTypes.bool
};

export default WorkflowVersions;
