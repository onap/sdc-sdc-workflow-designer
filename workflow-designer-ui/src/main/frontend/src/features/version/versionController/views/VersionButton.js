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
import { Button } from 'sdc-ui/lib/react';
import { I18n } from 'react-redux-i18n';
import PropTypes from 'prop-types';

const VersionButton = props => {
    const { onClick, actiontype } = props;
    let onClickAction = () => onClick(actiontype);
    return (
        <div>
            <Button btnType="primary" onClick={onClickAction}>
                {I18n.t('buttons.certifyBtn')}
            </Button>
        </div>
    );
};

VersionButton.propTypes = {
    onClick: PropTypes.func,
    actiontype: PropTypes.string
};

export default VersionButton;
