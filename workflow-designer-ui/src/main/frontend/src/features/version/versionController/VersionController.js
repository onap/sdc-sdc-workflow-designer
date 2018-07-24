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
import {
    getVersionsList,
    getSavedObjParams
} from 'features/version/versionController/versionControllerSelectors';
import VersionControllerView from 'features/version/versionController/VersionControllerView';
import { getVersions } from 'features/workflow/overview/overviewSelectors';
import {
    getWorkflowId,
    getWorkflowName
} from 'features/workflow/workflowSelectors';
import {
    saveParamsAction,
    certifyVersionAction
} from 'features/version/versionController/versionControllerConstants';

function mapStateToProps(state) {
    return {
        workflowName: getWorkflowName(state),
        workflowId: getWorkflowId(state),
        versionsList: getVersionsList(state),
        savedParams: getSavedObjParams(state),
        currentWorkflowVersion: state.currentVersion.general.id,
        versionState: state.currentVersion.general.state
    };
}

function mapDispatchToProps(dispatch) {
    return {
        callForAction: (action, payload) =>
            dispatch({ type: action, payload: payload }),
        getVersions: () => dispatch(getVersions),
        saveParamsToServer: params => dispatch(saveParamsAction(params)),
        certifyVersion: payload => dispatch(certifyVersionAction(payload))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    VersionControllerView
);
