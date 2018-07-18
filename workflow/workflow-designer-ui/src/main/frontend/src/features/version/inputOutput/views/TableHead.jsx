/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http: //www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import React from 'react';
import { Translate } from 'react-redux-i18n';

export default class TableHead extends React.Component {
    render() {
        return (
            <div className="input-output__table__thead">
                <div className="input-output__tr">
                    <div className="input-output__th">
                        <Translate value="workflow.inputOutput.name" />
                    </div>
                    <div className="input-output__th">
                        <Translate value="workflow.inputOutput.type" />
                    </div>
                    <div className="input-output__th input-output__th--unflex">
                        <Translate value="workflow.inputOutput.mandatory" />
                    </div>
                    <div className="input-output__th input-output__th--unflex input-output__th--icon">
                        ...
                    </div>
                </div>
            </div>
        );
    }
}
