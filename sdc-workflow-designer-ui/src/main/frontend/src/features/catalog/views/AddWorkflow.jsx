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
import { Translate } from 'react-redux-i18n';
import { SVGIcon } from 'onap-ui-react';

class AddWorkflow extends React.Component {
    render() {
        const { onClick } = this.props;
        return (
            <div
                className="add-workflow"
                data-test-id="wf-catalog-add-workflow"
                onClick={onClick}>
                <div className="add-workflow__icon">
                    <SVGIcon name="plusCircleThick" />
                </div>
                <div className="add-workflow__label">
                    <Translate value="catalog.addWorkflow" />
                </div>
            </div>
        );
    }
}

AddWorkflow.propTypes = {
    onClick: PropTypes.func
};

export default AddWorkflow;
