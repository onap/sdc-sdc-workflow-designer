/*
 * Copyright (C) 2026 Deutsche Telekom AG.
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
import { SVGIcon } from 'onap-ui-react';
import { activateOnKey } from 'shared/a11y/activateOnKey';

/*
 * Same markup and classes as onap-ui-react's Tile (1.0.2, which passes no extra attributes through),
 * operable as a button.
 */
const WorkflowTile = ({ name, onClick, dataTestId }) => (
    <div
        className="sdc-tile"
        role="button"
        tabIndex={0}
        aria-label={name}
        onClick={onClick}
        onKeyDown={activateOnKey(onClick)}
        data-test-id={dataTestId}>
        <div className="sdc-tile-header blue" aria-hidden="true">
            WF
        </div>
        <div className="sdc-tile-content">
            <div className="sdc-tile-content-icon blue">
                <SVGIcon name="workflow" aria-hidden="true" />
            </div>
            <div className="sdc-tile-content-info ">
                <div className="sdc-tile-info-line title ">{name}</div>
            </div>
        </div>
    </div>
);

WorkflowTile.propTypes = {
    name: PropTypes.string,
    onClick: PropTypes.func,
    dataTestId: PropTypes.string
};

export default WorkflowTile;
