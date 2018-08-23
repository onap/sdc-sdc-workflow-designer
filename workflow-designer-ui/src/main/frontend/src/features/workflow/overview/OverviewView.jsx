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

import WorkflowDetails from 'features/workflow/overview/views/WorkflowDetails';
import WorkflowVersions from 'features/workflow/overview/views/WorkflowVersions';
import WorkflowHeader from 'features/workflow/overview/views/WorkflowHeader';

class OverviewView extends Component {
    static propTypes = {
        getOverview: PropTypes.func,
        versions: PropTypes.array,
        onSelectVersion: PropTypes.func,
        onCreateVersion: PropTypes.func,
        selectedVersion: PropTypes.string,
        workflow: PropTypes.object,
        history: PropTypes.object,
        showNewVersionModal: PropTypes.func,
        isVersionsCertifies: PropTypes.bool,
        location: PropTypes.object,
        match: PropTypes.object,
        updateWorkflow: PropTypes.func,
        workflowInputChange: PropTypes.func
    };

    constructor(props) {
        super(props);
    }

    getOverviewFromRouter = () => {
        const { match } = this.props;
        const workflowId = match.params.workflowId;
        this.props.getOverview(workflowId);
    };

    componentDidMount() {
        this.getOverviewFromRouter();
    }

    onSelectVersionFromTable = data => {
        const { onSelectVersion, history, workflow } = this.props;
        onSelectVersion({ workflowId: workflow.id, versionId: data.id });
        history.push('/workflow/' + workflow.id + '/version/' + data.id);
    };

    onCreateNewVersionFromTable = () => {
        const { showNewVersionModal } = this.props;
        showNewVersionModal();
    };

    onUpdateWorkflow = payload => {
        const { updateWorkflow, workflow } = this.props;
        updateWorkflow({ ...workflow, ...payload });
    };

    workflowDetailsChanged = payload => {
        const { workflowInputChange } = this.props;
        workflowInputChange({ ...payload });
    };

    render() {
        const {
            versions,
            selectedVersion,
            workflow,
            isVersionsCertifies,
            history
        } = this.props;
        const nodeVersions = versions.map(version => ({
            id: version.id,
            name: version.name,
            parent: version.baseId || ''
        }));

        return (
            <div className="overview-page">
                <WorkflowHeader history={history} name={workflow.name} />
                <div className="overview-content">
                    <WorkflowDetails
                        name={workflow.name}
                        description={workflow.description}
                        modified={workflow.modified}
                        created={workflow.created}
                        workflowId={workflow.id}
                        versionId={selectedVersion}
                        workflowDetailsChanged={this.workflowDetailsChanged}
                        updateWorkflow={this.onUpdateWorkflow}
                    />

                    <div className={'separator overview-separator'} />
                    <WorkflowVersions
                        nodeVersions={nodeVersions}
                        versions={versions}
                        onCreateVersion={this.onCreateNewVersionFromTable}
                        onSelectVersion={this.onSelectVersionFromTable}
                        selectedVersion={selectedVersion}
                        isVersionsCertifies={isVersionsCertifies}
                    />
                </div>
            </div>
        );
    }
}

OverviewView.defaultProps = {
    versions: [],
    getOverview: () => {},
    onSelectVersion: () => {},
    selectedVersion: ''
};

export default OverviewView;
