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
import { I18n } from 'react-redux-i18n';

import OverviewView from 'features/workflow/overview/OverviewView';
import {
    getSortedVersions,
    getSelectedVersionId,
    getWorkflowData,
    getAllIsVersionsCertifies
} from 'features/workflow/overview/overviewSelectors';
import { isWorkflowArchive } from 'features/workflow/workflowSelectors';
import {
    getVersionsAction,
    updateWorkflowAction,
    archiveWorkflowAction,
    restoreWorkflowAction
} from 'features/workflow/overview/overviewConstansts';
import { NEW_VERSION_MODAL } from 'shared/modal/modalWrapperComponents';
import {
    showCustomModalAction,
    showAlertModalAction,
    hideModalAction
} from 'shared/modal/modalWrapperActions';
import { inputChangeAction } from 'features/workflow/create/createWorkflowConstants';

function mapStateToProps(state) {
    return {
        versions: getSortedVersions(state),
        selectedVersion: getSelectedVersionId(state),
        workflow: getWorkflowData(state),
        isVersionsCertifies: getAllIsVersionsCertifies(state),
        isArchive: isWorkflowArchive(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getOverview: workflowId => dispatch(getVersionsAction(workflowId)),
        showNewVersionModal: () =>
            dispatch(
                showCustomModalAction({
                    customComponentName: NEW_VERSION_MODAL,
                    title: 'New Version'
                })
            ),
        workflowInputChange: payload => dispatch(inputChangeAction(payload)),
        updateWorkflow: payload => dispatch(updateWorkflowAction(payload)),
        archiveWorkflow: payload => {
            dispatch(
                showAlertModalAction({
                    title: I18n.t('workflow.overview.archive'),
                    body: I18n.t('workflow.overview.confirmArchive', {
                        name: payload.name
                    }),
                    withButtons: true,
                    actionButtonText: I18n.t('workflow.overview.archive'),
                    actionButtonClick: () => {
                        dispatch(archiveWorkflowAction(payload));
                        dispatch(hideModalAction());
                    }
                })
            );
        },
        restoreWorkflow: payload => dispatch(restoreWorkflowAction(payload))
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OverviewView);
