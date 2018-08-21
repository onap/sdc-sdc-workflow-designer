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
import { I18n } from 'react-redux-i18n';
import { Input, Button } from 'sdc-ui/lib/react';
import PropTypes from 'prop-types';

import Description from 'shared/components/Description';
import { VersionInfo, LabeledValue } from 'shared/components/VersionInfo';

class WorkflowDetails extends Component {
    handleSubmitForm = e => {
        e.preventDefault();
        const { description } = this.props;
        this.props.updateWorkflow(description);
    };

    render() {
        const {
            name,
            workflowId,
            versionId,
            description,
            workflowDetailsChanged
        } = this.props;
        return (
            <div className="workflow-details">
                <form onSubmit={this.handleSubmitForm}>
                    <Input
                        name="workflowName"
                        value={name || ''}
                        type="text"
                        label={I18n.t('workflow.general.name')}
                        isRequired
                        disabled
                    />
                    <Description
                        description={description}
                        onDataChange={workflowDetailsChanged}
                    />
                    <div className="save-description">
                        <Button btnType="primary">
                            {I18n.t('buttons.saveBtn')}
                        </Button>
                    </div>
                </form>
                <VersionInfo>
                    {versionId && (
                        <LabeledValue title="UUID" value={versionId} />
                    )}
                    <LabeledValue title="Invariant UUID" value={workflowId} />
                </VersionInfo>
            </div>
        );
    }
}

WorkflowDetails.propTypes = {
    name: PropTypes.string,
    created: PropTypes.string,
    modified: PropTypes.string,
    description: PropTypes.string,
    defaultDescription: PropTypes.string,
    workflowId: PropTypes.string,
    versionId: PropTypes.string,
    updateWorkflow: PropTypes.func,
    workflowDetailsChanged: PropTypes.func
};

export default WorkflowDetails;
