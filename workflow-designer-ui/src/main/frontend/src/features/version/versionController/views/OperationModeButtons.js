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
import { I18n } from 'react-redux-i18n';
import { Button } from 'sdc-ui/lib/react';
import PropTypes from 'prop-types';
import SvgButton from 'features/version/versionController/views/SvgButton';

const OperationModeButtons = props => {
    const {
        onSaveClick,
        saveDisabled,
        sendMsgToCatalog,
        onCertifyClick
    } = props;
    return (
        <div className="save-submit-cancel-container">
            <div className="action-buttons">
                <div className="select-action-buttons">
                    <SvgButton
                        dataTestId="vc-save-btn"
                        name="version-controller-save"
                        tooltipText={I18n.t('buttons.saveBtn')}
                        disabled={saveDisabled}
                        onClick={onSaveClick}
                    />

                    <Button
                        disabled={saveDisabled}
                        className="certifyBtn"
                        btnType="primary"
                        onClick={onCertifyClick}>
                        {I18n.t('buttons.completeBtn')}
                    </Button>

                    <SvgButton
                        tooltipText={I18n.t('buttons.backToCatalog')}
                        className="vs-back-btn"
                        dataTestId="vc-back-btn"
                        name="upload"
                        onClick={sendMsgToCatalog}
                    />
                </div>
            </div>
        </div>
    );
};

OperationModeButtons.propTypes = {
    onSaveClick: PropTypes.func,
    saveDisabled: PropTypes.bool,
    sendMsgToCatalog: PropTypes.func,
    onCertifyClick: PropTypes.func
};

export default OperationModeButtons;
