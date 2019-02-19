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
import React from 'react';
import PropTypes from 'prop-types';
import { I18n } from 'react-redux-i18n';
import SVGIcon from 'sdc-ui/lib/react/SVGIcon';
import Button from 'sdc-ui/lib/react/Button';
import ArchiveLabel from 'shared/archiveLabel/ArchiveLabel';

const Buttons = ({ history, archiveWorkflow, restoreWorkflow, isArchive }) => (
    <div className="header-buttons">
        <SVGIcon
            onClick={() => history.push('/workflows/')}
            label={I18n.t('workflow.overview.backBtnLabel')}
            className="go-catalog-btn"
            labelPosition="right"
            name="back"
        />
        <ArchiveBtn
            isArchive={isArchive}
            restoreWorkflow={restoreWorkflow}
            archiveWorkflow={archiveWorkflow}
        />
    </div>
);

Buttons.propTypes = {
    history: PropTypes.object,
    archiveWorkflow: PropTypes.func,
    isArchive: PropTypes.bool,
    restoreWorkflow: PropTypes.func
};

const Title = ({ name, isArchive }) => (
    <div className="title">
        {name} - {I18n.t('workflow.overview.title')}
        {isArchive && <ArchiveLabel />}
    </div>
);
Title.propTypes = {
    name: PropTypes.string,
    isArchive: PropTypes.bool
};

const ArchiveBtn = ({ isArchive, archiveWorkflow, restoreWorkflow }) => {
    return !isArchive ? (
        <SVGIcon
            onClick={archiveWorkflow}
            title="Archive workflow"
            className="archive-btn"
            name="archiveBox"
        />
    ) : (
        <Button className="restore-btn" onClick={restoreWorkflow}>
            RESTORE
        </Button>
    );
};
ArchiveBtn.propTypes = {
    status: PropTypes.string,
    archiveWorkflow: PropTypes.func,
    restoreWorkflow: PropTypes.func,
    isArchive: PropTypes.bool
};

const WorkflowHeader = ({
    name,
    history,
    archiveWorkflow,
    restoreWorkflow,
    isArchive
}) => {
    return (
        <div className="overview-header">
            <Title isArchive={isArchive} name={name} />
            <Buttons
                restoreWorkflow={restoreWorkflow}
                archiveWorkflow={archiveWorkflow}
                isArchive={isArchive}
                history={history}
            />
        </div>
    );
};

WorkflowHeader.propTypes = {
    name: PropTypes.string,
    history: PropTypes.object,
    archiveWorkflow: PropTypes.func,
    restoreWorkflow: PropTypes.func,
    isArchive: PropTypes.bool
};

export default WorkflowHeader;
