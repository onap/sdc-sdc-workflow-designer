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
import { Input, Button } from 'sdc-ui/lib/react';
import { I18n } from 'react-redux-i18n';
import InputBootstrap from 'common/shared-components/input/validation/Input';

const CreateWorkflowView = props => {
    const {
        workflowInputChange,
        workflowDescription,
        workflowName,
        submitWorkflow,
        closeCreateWorkflowModal,
        workflowParams,
        history
    } = props;

    function handleSubmitForm(e) {
        e.preventDefault();
        submitWorkflow({ ...workflowParams, history });
    }

    return (
        <form onSubmit={handleSubmitForm}>
            <div className="new-workflow-page custom-modal-wrapper">
                <Input
                    name="workflowName"
                    value={workflowName || ''}
                    type="text"
                    label={I18n.t('workflow.general.name')}
                    onChange={val =>
                        workflowInputChange({
                            name: val
                        })
                    }
                    isRequired
                />
                <InputBootstrap
                    groupClassName="multi-line-textarea"
                    type="textarea"
                    value={workflowDescription || ''}
                    label={I18n.t('workflow.general.description')}
                    overlayPos="bottom"
                    className="field-section"
                    data-test-id="description"
                    onChange={val => workflowInputChange({ description: val })}
                />
                <div className="modal-action-bar">
                    <Button btnType="primary">
                        {I18n.t('buttons.createBtn')}
                    </Button>
                    <Button
                        btnType="secondary"
                        onClick={closeCreateWorkflowModal}>
                        {I18n.t('buttons.closeBtn')}
                    </Button>
                </div>
            </div>
        </form>
    );
};

CreateWorkflowView.propTypes = {
    submitWorkflow: PropTypes.func,
    workflowInputChange: PropTypes.func,
    workflowDescription: PropTypes.string,
    workflowName: PropTypes.string,
    closeCreateWorkflowModal: PropTypes.func,
    workflowParams: PropTypes.object,
    history: PropTypes.object
};

CreateWorkflowView.defaultProps = {
    submitWorkflow: () => {},
    workflowInputChange: () => {},
    closeCreateWorkflowModal: () => {}
};

export default CreateWorkflowView;
