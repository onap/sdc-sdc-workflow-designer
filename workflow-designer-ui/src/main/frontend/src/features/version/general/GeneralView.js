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

import Description from 'shared/components/Description';
import { VersionInfo, LabeledValue } from 'shared/components/VersionInfo';

const GeneralView = ({ onDataChange, versionInfo, isCertified }) => {
    const modifiedValue = I18n.l(versionInfo.modificationTime, {
        dateFormat: 'date.short'
    });
    const createdValue = I18n.l(versionInfo.creationTime, {
        dateFormat: 'date.short'
    });

    return (
        <div className="general-page">
            <div className="general-page-content">
                <Description
                    description={versionInfo.description}
                    onDataChange={onDataChange}
                    disabled={isCertified}
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
    versionInfo: PropTypes.object,
    isCertified: PropTypes.bool
};

export default GeneralView;
