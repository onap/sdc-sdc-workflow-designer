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
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { i18nSelector } from 'appSelectors';
import { hideModalAction } from 'shared/modal/modalWrapperActions';
import CreateWorkflowView from 'features/workflow/create/CreateWorkflowView';
import { getWorkflowParams } from 'features/workflow/create/createWorkflowSelector';
import {
    getWorkflowDescription,
    getWorkflowName
} from 'features/workflow/workflowSelectors';
import {
    inputChangeAction,
    submitWorkflowAction,
    clearValidationError
} from 'features/workflow/create/createWorkflowConstants';
import { clearWorkflowAction } from 'features/workflow/workflowConstants';

function mapStateToProps(state) {
    return {
        translation: i18nSelector(state),
        workflowDescription: getWorkflowDescription(state),
        workflowName: getWorkflowName(state),
        workflowParams: getWorkflowParams(state),
        errorMessage: state.workflow.data.error
    };
}

function mapDispatchToProps(dispatch) {
    return {
        submitWorkflow: payload => {
            dispatch(submitWorkflowAction(payload));
        },
        closeCreateWorkflowModal: () => dispatch(hideModalAction()),
        clearValidationError: () => dispatch(clearValidationError()),
        workflowInputChange: payload => dispatch(inputChangeAction(payload)),
        clearWorkflow: () => dispatch(clearWorkflowAction)
    };
}

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(CreateWorkflowView)
);
