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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from 'sdc-ui/lib/react';
import { I18n } from 'react-redux-i18n';
import Description from 'shared/components/Description';

class CreateWorkflowView extends Component {
    static propTypes = {
        submitWorkflow: PropTypes.func,
        workflowInputChange: PropTypes.func,
        workflowDescription: PropTypes.string,
        workflowName: PropTypes.string,
        closeCreateWorkflowModal: PropTypes.func,
        workflowParams: PropTypes.object,
        history: PropTypes.object,
        errorMessage: PropTypes.string,
        clearValidationError: PropTypes.func,
        clearWorkflow: PropTypes.func
    };

    componentDidMount() {
        const { clearValidationError, clearWorkflow } = this.props;
        clearValidationError();
        clearWorkflow();
    }
    handleSubmitForm = e => {
        e.preventDefault();
        const { workflowParams, history, submitWorkflow } = this.props;
        submitWorkflow({ ...workflowParams, history });
    };

    render() {
        const {
            workflowInputChange,
            workflowDescription,
            workflowName,
            closeCreateWorkflowModal,
            errorMessage
        } = this.props;
        return (
            <form onSubmit={this.handleSubmitForm} autoComplete="off">
                <div className="new-workflow-page custom-modal-wrapper">
                    <div className="form-custom-modal">
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
                            errorMessage={errorMessage}
                            isRequired
                        />
                        <Description
                            value={workflowDescription || ''}
                            label={I18n.t('workflow.general.description')}
                            onDataChange={workflowInputChange}
                        />
                    </div>
                    <div className="modal-action-bar sdc-modal__footer">
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
    }
}

CreateWorkflowView.defaultProps = {
    submitWorkflow: () => {},
    workflowInputChange: () => {},
    closeCreateWorkflowModal: () => {},
    clearWorkflow: () => {}
};

export default CreateWorkflowView;
