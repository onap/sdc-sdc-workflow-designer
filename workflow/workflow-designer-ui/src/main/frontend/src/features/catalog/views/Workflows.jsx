/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http: //www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import React from 'react';
import PropTypes from 'prop-types';

import { Tile, TileInfo, TileInfoLine } from 'sdc-ui/lib/react';

const Workflows = ({ results, onWorkflowClick }) =>
    results.map((workflow, index) => (
        <Tile
            key={`workflow.${index}`}
            headerText="WF"
            headerColor="blue"
            iconName="workflow"
            iconColor="blue"
            onClick={() => onWorkflowClick(workflow.id)}>
            <TileInfo>
                <TileInfoLine type="title">{workflow.name}</TileInfoLine>
            </TileInfo>
        </Tile>
    ));

Workflows.propTypes = {
    results: PropTypes.array,
    onWorkflowClick: PropTypes.func
};

Workflows.defaultProps = {
    results: []
};

export default Workflows;
