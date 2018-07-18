/*!
 * Copyright © 2016-2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
// import i18n from 'nfvo-utils/i18n/i18n.js';

import SVGIcon from 'sdc-ui/lib/react/SVGIcon.js';
const VCButton = ({ name, tooltipText, disabled, onClick, dataTestId }) => {
    let onClickAction = disabled ? () => {} : onClick;
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

const Separator = () => <div className="vc-separator" />;

const SubmitButton = ({ onClick, disabled }) => (
    <div
        onClick={() => onClick()}
        data-test-id="vc-submit-btn"
        className={`vc-submit-button ${disabled ? 'disabled' : ''}`}>
        <SVGIcon name="check" iconClassName="vc-v-submit" disabled={disabled} />
        {'Submit'}
    </div>
);

const ActionButtons = ({
    isReadOnlyMode,
    onSubmit,
    onRevert,
    onSave,
    isFormDataValid,
    isArchived,

    onOpenRevisionsModal,
    itemPermissions: { isCertified, isCollaborator, isOutOfSync, isUpToDate }
}) => (
    <div className="action-buttons">
        {isCollaborator &&
            !isArchived && (
                <div className="collaborator-action-buttons">
                    <Separator />
                    {onSave && (
                        <div className="vc-save-section">
                            <VCButton
                                dataTestId="vc-save-btn"
                                onClick={() => onSave()}
                                name="version-controller-save"
                                tooltipText={'Save'}
                                disabled={isReadOnlyMode || !isFormDataValid}
                            />
                            <Separator />
                        </div>
                    )}
                    {onRevert && (
                        <VCButton
                            dataTestId="vc-revert-btn"
                            onClick={onOpenRevisionsModal}
                            name="version-controller-revert"
                            tooltipText={'Revert'}
                            disabled={isReadOnlyMode || isOutOfSync}
                        />
                    )}
                    {onSubmit && (
                        <div className="vc-submit-section">
                            <Separator />
                            <SubmitButton
                                onClick={onSubmit}
                                disabled={
                                    isReadOnlyMode ||
                                    isOutOfSync ||
                                    !isUpToDate ||
                                    isCertified
                                }
                            />
                        </div>
                    )}
                </div>
            )}
    </div>
);

ActionButtons.propTypes = {
    version: PropTypes.object,
    onSubmit: PropTypes.func,
    onRevert: PropTypes.func,
    onSave: PropTypes.func,
    isLatestVersion: PropTypes.bool,
    isCheckedIn: PropTypes.bool,
    isCheckedOut: PropTypes.bool,
    isFormDataValid: PropTypes.bool,
    isReadOnlyMode: PropTypes.bool
};

export default ActionButtons;
