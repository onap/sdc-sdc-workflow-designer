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
import CompositionUpdate from 'features/version/composition/CompositionUpdate';

const ActionButtons = props => {
    const {
        onSaveClick,
        certifyDisabled,
        onCertifyClick,
        isCompositionUpdating,
        toggleCompositionUpdate,
        onUndoClick,
        saveDisabled
    } = props;

    return (
        <div className="save-submit-cancel-container">
            <div className="action-buttons">
                <div className="select-action-buttons">
                    <div className={'separator vc-separator'} />
                    <SvgButton
                        dataTestId="vc-save-btn"
                        name="version-controller-save"
                        tooltipText={I18n.t('buttons.saveBtn')}
                        disabled={saveDisabled}
                        onClick={onSaveClick}
                    />

                    <div className={'separator vc-separator'} />

                    <SvgButton
                        dataTestId="vc-undo-btn"
                        name="version-controller-undo"
                        tooltipText={I18n.t('buttons.undoBtn')}
                        disabled={certifyDisabled}
                        onClick={onUndoClick}
                    />

                    <div className={'separator vc-separator'} />

                    <Button
                        className="certifyBtn"
                        btnType="primary"
                        disabled={certifyDisabled}
                        onClick={() => toggleCompositionUpdate(true)}>
                        {I18n.t('buttons.certifyBtn')}
                    </Button>

                    {isCompositionUpdating && (
                        <CompositionUpdate
                            certifyBack={() => {
                                toggleCompositionUpdate(false);
                                onCertifyClick();
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

ActionButtons.propTypes = {
    onSaveClick: PropTypes.func,
    certifyDisabled: PropTypes.bool,
    onCertifyClick: PropTypes.func,
    onUndoClick: PropTypes.func,
    saveDisabled: PropTypes.bool,
    isCompositionUpdating: PropTypes.bool,
    toggleCompositionUpdate: PropTypes.func
};

export default ActionButtons;
