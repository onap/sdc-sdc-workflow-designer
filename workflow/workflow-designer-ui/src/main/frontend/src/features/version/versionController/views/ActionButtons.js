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
import SvgButton from './SvgButton';
import {
    SAVE_ACTION,
    UNDO_ACTION,
    CERTIFY_ACTION
} from '../versionControllerConstants';

const Separator = () => <div className="vc-separator" />;

const ActionButtons = props => {
    const { dynamicDispatcher } = props;
    const handleClick = action => dynamicDispatcher(action);
    return (
        <div className="save-submit-cancel-container">
            <div className="action-buttons">
                <div className="select-action-buttons">
                    <Separator />
                    <SvgButton
                        dataTestId="vc-save-btn"
                        name="version-controller-save"
                        tooltipText={I18n.t('buttons.saveBtn')}
                        disabled={false}
                        actiontype={SAVE_ACTION}
                        onClick={handleClick}
                    />
                    <Separator />
                    <SvgButton
                        dataTestId="vc-undo-btn"
                        name="version-controller-undo"
                        tooltipText={I18n.t('buttons.undoBtn')}
                        disabled={false}
                        actiontype={UNDO_ACTION}
                        onClick={handleClick}
                    />
                    <Separator />
                    <Button
                        btnType="primary"
                        actiontype={CERTIFY_ACTION}
                        onClick={handleClick}>
                        {I18n.t('buttons.certifyBtn')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

ActionButtons.propTypes = {
    dynamicDispatcher: PropTypes.func
};

export default ActionButtons;
