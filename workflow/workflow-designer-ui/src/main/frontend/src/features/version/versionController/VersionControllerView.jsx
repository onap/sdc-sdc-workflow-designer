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

import ActionButtons from 'features/version/versionController/views/ActionButtons';
import VersionContainer from 'features/version/versionController/views/VersionsContainer';
import WorkflowTitle from 'features/version/versionController/views/WorkflowTitle';

export default class VersionControllerView extends Component {
    static propTypes = {
        location: PropTypes.object,
        workflowName: PropTypes.string,
        currentWorkflowVersion: PropTypes.string,
        viewableVersions: PropTypes.arrayOf(Object),
        callForAction: PropTypes.func,
        getVersions: PropTypes.func,
        versionsList: PropTypes.array,
        history: PropTypes.object,
        getOverview: PropTypes.func,
        match: PropTypes.object,
        savedParams: PropTypes.object,
        saveParamsToServer: PropTypes.func,
        workflowId: PropTypes.string,
        isVersionsCertified: PropTypes.bool
    };

    constructor(props) {
        super(props);
    }

    dynamicDispatcher = (action, payload) => {
        const { history, callForAction } = this.props;
        const actionName =
            typeof action === 'object'
                ? action.target.attributes.actionType.value
                : action;
        let pageName = history.location.pathname.split('/').pop();
        callForAction(pageName + '/' + actionName, payload);
    };

    routeToOverview = () => {
        const { history, match } = this.props;
        const workflowId = match.params.workflowId;
        history.push('/workflow/' + workflowId + '/overview');
    };

    sendSaveParamsToServer = () => {
        const { savedParams, saveParamsToServer, workflowId } = this.props;
        saveParamsToServer({ params: savedParams, workflowId });
    };

    render() {
        const {
            currentWorkflowVersion,
            workflowName,
            versionsList,
            isVersionsCertified
        } = this.props;
        return (
            <div className="version-controller-bar">
                <WorkflowTitle workflowName={workflowName} />
                <div className="vc-container">
                    <VersionContainer
                        currentWorkflowVersion={currentWorkflowVersion}
                        viewableVersions={versionsList}
                        onOverviewClick={this.routeToOverview}
                    />
                    <ActionButtons
                        onSaveClick={this.sendSaveParamsToServer}
                        certifyDisabled={isVersionsCertified}
                    />
                </div>
            </div>
        );
    }
}

VersionControllerView.defaultProps = {
    getVersions: () => {},
    callForAction: () => {}
};
