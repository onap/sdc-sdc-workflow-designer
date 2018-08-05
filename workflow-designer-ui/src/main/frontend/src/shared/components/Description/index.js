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
import { I18n } from 'react-redux-i18n';

const Description = ({ description, onDataChange, dataTestId }) => (
    <div className="description-part">
        <div className="sdc-input">
            <div className="sdc-input__label">
                {I18n.t('workflow.general.description')}
            </div>
            <textarea
                value={description}
                data-test-id={dataTestId || 'description'}
                onChange={event => {
                    onDataChange({ description: event.target.value });
                }}
                className="custom-textarea field-section sdc-input__input"
            />
        </div>
    </div>
);

Description.propTypes = {
    description: PropTypes.string,
    onDataChange: PropTypes.func,
    dataTestId: PropTypes.string
};

export default Description;
