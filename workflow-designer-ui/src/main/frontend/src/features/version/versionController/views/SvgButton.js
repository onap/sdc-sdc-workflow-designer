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
import SVGIcon from 'sdc-ui/lib/react/SVGIcon.js';
import PropTypes from 'prop-types';

const SvgButton = props => {
    const {
        name,
        tooltipText,
        disabled,
        onClick,
        dataTestId,
        actiontype
    } = props;
    let onClickAction = disabled ? () => {} : () => onClick(actiontype);
    return (
        <div
            className={`action-button-wrapper ${
                disabled ? 'disabled' : 'clickable'
            }`}
            onClick={onClickAction}>
            <div className="action-buttons-svg">
                <SVGIcon
                    label={tooltipText}
                    labelPosition="bottom"
                    labelClassName="action-button-label"
                    data-test-id={dataTestId}
                    name={name}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

SvgButton.propTypes = {
    name: PropTypes.string,
    tooltipText: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    dataTestId: PropTypes.string,
    actiontype: PropTypes.string
};

export default SvgButton;
