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

import { hideModalAction } from 'shared/modal/modalWrapperActions';
import CreateVersionView from './CreateVersionView';
import {
    newVersionAction,
    submitVersionAction
} from './createVersionConstants';
import {
    getWorkflowId,
    getLatestBaseId
} from 'features/workflow/overview/overviewSelectors';

function mapStateToProps(state) {
    return {
        workflowId: getWorkflowId(state),
        versionBaseId: getLatestBaseId(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        submitNewVersion: payload => {
            dispatch(submitVersionAction(payload));
            dispatch(hideModalAction());
        },
        closeCreateVersionModal: () => dispatch(hideModalAction()),
        versionDetailsChanged: payload => dispatch(newVersionAction(payload))
    };
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(CreateVersionView)
);
