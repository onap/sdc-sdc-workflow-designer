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
import OverviewView from 'features/workflow/overview/OverviewView';
import {
    getSortedVersions,
    getSelectedVersionId,
    getWorkflowData,
    getAllIsVersionsCertifies
} from 'features/workflow/overview/overviewSelectors';
import {
    getVersionsAction,
    updateWorkflowAction,
    selectVersionAction
} from 'features/workflow/overview/overviewConstansts';
import { NEW_VERSION_MODAL } from 'shared/modal/modalWrapperComponents';
import { showCustomModalAction } from 'shared/modal/modalWrapperActions';
import { inputChangeAction } from 'features/workflow/create/createWorkflowConstants';

function mapStateToProps(state) {
    return {
        versions: getSortedVersions(state),
        selectedVersion: getSelectedVersionId(state),
        workflow: getWorkflowData(state),
        isVersionsCertifies: getAllIsVersionsCertifies(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getOverview: workflowId => dispatch(getVersionsAction(workflowId)),
        onSelectVersion: payload => dispatch(selectVersionAction(payload)),
        showNewVersionModal: () =>
            dispatch(
                showCustomModalAction({
                    customComponentName: NEW_VERSION_MODAL,
                    title: 'New Version'
                })
            ),
        workflowInputChange: payload => dispatch(inputChangeAction(payload)),
        updateWorkflow: payload => dispatch(updateWorkflowAction(payload))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(OverviewView);
