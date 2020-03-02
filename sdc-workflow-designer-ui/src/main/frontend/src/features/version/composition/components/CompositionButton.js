/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
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

const CompositionButton = ({ onClick, name, title, disabled }) => (
    <div
        onClick={disabled ? () => {} : onClick}
        className={`diagram-btn ${disabled ? 'disabled' : ''}`}>
        <SVGIcon title={title} name={name} />
    </div>
);

CompositionButton.propTypes = {
    onClick: PropTypes.func,
    className: PropTypes.string,
    name: PropTypes.string,
    title: PropTypes.string,
    disabled: PropTypes.bool
};

export default CompositionButton;
