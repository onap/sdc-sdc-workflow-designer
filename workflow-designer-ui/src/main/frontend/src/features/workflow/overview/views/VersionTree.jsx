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
import Tree from 'shared/tree/Tree';
import PropTypes from 'prop-types';

const VersionTree = ({ nodeVersions, selectedVersion }) => {
    return (
        <div className="version-tree-wrapper">
            <div className="version-tree-title-container">
                <div className="version-tree-title">Version Tree</div>
            </div>
            <Tree
                name={'versions-tree'}
                width={200}
                allowScaleWidth={false}
                nodes={nodeVersions}
                selectedNodeId={selectedVersion}
            />
        </div>
    );
};

VersionTree.propTypes = {
    nodeVersions: PropTypes.array,
    selectedVersion: PropTypes.string
};

export default VersionTree;
