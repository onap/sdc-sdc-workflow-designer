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
import OperationModeButtons from 'features/version/versionController/views/OperationModeButtons';
import VersionContainer from 'features/version/versionController/views/VersionsContainer';
import WorkflowTitle from 'features/version/versionController/views/WorkflowTitle';
import { PluginPubSub } from 'shared/pubsub/plugin-pubsub.ts';
import {
    notificationType,
    CATALOG_PATH
} from 'wfapp/pluginContext/pluginContextConstants';
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
        certifyVersion: PropTypes.func,
        changeVersion: PropTypes.func,
        isCertifyDisable: PropTypes.bool,
        hasErrors: PropTypes.bool,
        isArchive: PropTypes.bool,
        operationMode: PropTypes.bool,
        pluginContext: PropTypes.object
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
        const {
            savedParams,
            saveParamsToServer,
            workflowId,
            workflowName
        } = this.props;
        saveParamsToServer({ params: savedParams, workflowId, workflowName });
    };
    handleSendMsgToCatalog = () => {
        const {
            pluginContext: { eventsClientId, parentUrl },
            workflowId,
            isCertifyDisable
        } = this.props;
        const client = new PluginPubSub(eventsClientId, parentUrl);
        client.notify(notificationType.CLOSE, {
            isCompleted: isCertifyDisable,
            workflowId,
            path: CATALOG_PATH
        });
    };
    certifyVersion = () => {
        const {
            certifyVersion,
            workflowId,
            currentWorkflowVersion,
            savedParams,
            workflowName
        } = this.props;
        certifyVersion({
            workflowId,
            workflowName,
            versionId: currentWorkflowVersion.id,
            params: savedParams
        });
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
            hasErrors,
            isCertifyDisable,
            isArchive,
            operationMode
        } = this.props;
        const isReadonly = isCertifyDisable || hasErrors || isArchive;
        return (
            <div className="version-controller-bar">
                <WorkflowTitle workflowName={workflowName} />
                <div
                    className={`vc-container ${
                        operationMode ? 'vs-container-operation' : ''
                    }`}>
                    {!operationMode && (
                        <VersionContainer
                            currentWorkflowVersion={currentWorkflowVersion}
                            viewableVersions={versionsList}
                            onOverviewClick={this.routeToOverview}
                            onVersionSelectChange={this.versionChangeCallback}
                            isArchive={isArchive}
                        />
                    )}
                    {operationMode && (
                        <OperationModeButtons
                            sendMsgToCatalog={this.handleSendMsgToCatalog}
                            saveDisabled={isReadonly}
                            onSaveClick={this.sendSaveParamsToServer}
                            onCertifyClick={this.certifyVersion}
                        />
                    )}
                    {!operationMode && (
                        <ActionButtons
                            saveDisabled={isReadonly}
                            onSaveClick={this.sendSaveParamsToServer}
                            certifyDisabled={isReadonly}
                            onCertifyClick={this.certifyVersion}
                            onUndoClick={this.undoClickCallback}
                        />
                    )}
                </div>
            </div>
        );
    }
}

VersionControllerView.defaultProps = {
    getVersions: () => {}
};
