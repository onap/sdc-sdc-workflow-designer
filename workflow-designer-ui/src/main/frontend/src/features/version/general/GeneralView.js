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
import { I18n, Translate } from 'react-redux-i18n';

import Description from 'shared/components/Description';
import { VersionInfo, LabeledValue } from 'shared/components/VersionInfo';

const GeneralView = ({ onDataChange, description, created, modified }) => {
    const modifiedValue = I18n.l(modified, { dateFormat: 'date.short' });
    const createdValue = I18n.l(created, { dateFormat: 'date.short' });

    return (
        <div className="general-page">
            <div className="general-page-title">
                <Translate value="workflow.general.headerTitle" />
            </div>
            <div className="general-page-content">
                <Description
                    description={description}
                    onDataChange={onDataChange}
                />
                <VersionInfo>
                    <LabeledValue
                        title={I18n.t('workflow.general.modified')}
                        value={modifiedValue}
                    />
                    <LabeledValue
                        title={I18n.t('workflow.general.created')}
                        value={createdValue}
                    />
                </VersionInfo>
            </div>
        </div>
    );
};

GeneralView.propTypes = {
    onDataChange: PropTypes.func,
    description: PropTypes.string,
    created: PropTypes.string,
    modified: PropTypes.string
};

export default GeneralView;
