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
import { versionState as versionStateType } from 'features/version/versionConstants';

export default class VersionControllerView extends Component {
    static propTypes = {
        location: PropTypes.object,
        workflowName: PropTypes.string,
        currentWorkflowVersion: PropTypes.object,
        viewableVersions: PropTypes.arrayOf(Object),
        getVersions: PropTypes.func,
        versionsList: PropTypes.array,
        history: PropTypes.object,
        getOverview: PropTypes.func,
        match: PropTypes.object,
        savedParams: PropTypes.object,
        saveParamsToServer: PropTypes.func,
        workflowId: PropTypes.string,
        versionState: PropTypes.string,
        certifyVersion: PropTypes.func,
        changeVersion: PropTypes.func,
        getIOErrors: PropTypes.bool
    };

    constructor(props) {
        super(props);
    }

    routeToOverview = () => {
        const { history, match } = this.props;
        const workflowId = match.params.workflowId;
        history.push('/workflow/' + workflowId + '/overview');
    };

    sendSaveParamsToServer = () => {
        const { savedParams, saveParamsToServer, workflowId } = this.props;
        saveParamsToServer({ params: savedParams, workflowId });
    };

    certifyVersion = () => {
        const {
            certifyVersion,
            workflowId,
            currentWorkflowVersion
        } = this.props;
        certifyVersion({ workflowId, versionId: currentWorkflowVersion.id });
    };

    versionChangeCallback = versionId => {
        const { changeVersion, workflowId } = this.props;
        changeVersion({ versionId, workflowId });
    };

    undoClickCallback = () => {
        const {
            currentWorkflowVersion,
            changeVersion,
            workflowId
        } = this.props;
        changeVersion({ versionId: currentWorkflowVersion.id, workflowId });
    };

    render() {
        const {
            currentWorkflowVersion,
            workflowName,
            versionsList,
            versionState,
            getIOErrors
        } = this.props;
        let isCertifyDisable =
            versionState &&
            versionState.toLowerCase() === versionStateType.CERTIFIED;
        return (
            <div className="version-controller-bar">
                <WorkflowTitle workflowName={workflowName} />
                <div className="vc-container">
                    <VersionContainer
                        currentWorkflowVersion={currentWorkflowVersion}
                        viewableVersions={versionsList}
                        onOverviewClick={this.routeToOverview}
                        onVersionSelectChange={this.versionChangeCallback}
                    />
                    <ActionButtons
                        saveDisabled={isCertifyDisable || getIOErrors}
                        onSaveClick={this.sendSaveParamsToServer}
                        certifyDisabled={isCertifyDisable}
                        onCertifyClick={this.certifyVersion}
                        onUndoClick={this.undoClickCallback}
                    />
                </div>
            </div>
        );
    }
}

VersionControllerView.defaultProps = {
    getVersions: () => {}
};
