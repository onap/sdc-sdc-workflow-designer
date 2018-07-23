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
import { Localize } from 'react-redux-i18n';
export const LabeledValue = ({ title, value }) => (
    <React.Fragment>
        <div className="label">{title}</div>
        <div className="value">{value}</div>
    </React.Fragment>
);

LabeledValue.propTypes = {
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export const VersionInfo = ({ created, modified, children }) => (
    <div className="version-info-part">
        <LabeledValue
            title={I18n.t('workflow.general.created')}
            value={<Localize value={created} dateFormat="date.short" />}
        />
        <LabeledValue
            title={I18n.t('workflow.general.modified')}
            value={<Localize value={modified} dateFormat="date.short" />}
        />
        {children}
    </div>
);

VersionInfo.defaultProps = {
    created: '',
    modified: ''
};

VersionInfo.propTypes = {
    created: PropTypes.string,
    modified: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};
