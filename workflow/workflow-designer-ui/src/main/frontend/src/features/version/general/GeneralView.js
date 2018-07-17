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
import Description from 'shared/componenets/Description';
import { VersionInfo } from 'shared/componenets/VersionInfo';

const GeneralView = ({ onDataChange, description, created, modified }) => (
    <div className="general-page">
        <Description description={description} onDataChange={onDataChange} />
        <VersionInfo modified={modified} created={created} />
    </div>
);

GeneralView.propTypes = {
    onDataChange: PropTypes.func,
    description: PropTypes.string,
    created: PropTypes.string,
    modified: PropTypes.string
};

export default GeneralView;
