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

const BackBtn = ({ history }) => (
    <SVGIcon
        onClick={() => history.push('/')}
        label={I18n.t('workflow.overview.backBtnLabel')}
        className="go-catalog-btn"
        labelPosition="right"
        name="back"
    />
);

BackBtn.propTypes = {
    history: PropTypes.object
};

const Title = ({ name }) => (
    <div className="title">
        {name} - {I18n.t('workflow.overview.title')}
    </div>
);
Title.propTypes = {
    name: PropTypes.string
};

const WorkflowHeader = ({ name, history }) => {
    return (
        <div className="overview-header">
            <Title name={name} />
            <BackBtn history={history} />
        </div>
    );
};

WorkflowHeader.propTypes = {
    name: PropTypes.string,
    history: PropTypes.object
};

export default WorkflowHeader;
