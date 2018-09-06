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
import { I18n } from 'react-redux-i18n';
import { Button } from 'sdc-ui/lib/react';
import Description from 'shared/components/Description';
import Select from 'shared/components/Select/index';
import { VERSION_LEVEL_LIST } from 'appConstants';

class CreateVersionView extends Component {
    static propTypes = {
        versionCategories: PropTypes.array,
        closeCreateVersionModal: PropTypes.func,
        versionDetailsChanged: PropTypes.func,
        submitNewVersion: PropTypes.func,
        workflowId: PropTypes.string,
        baseVersionId: PropTypes.string,
        history: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            newVersion: ''
        };
    }
    handleSubmitForm = () => {
        const {
            submitNewVersion,
            workflowId,
            baseVersionId,
            history
        } = this.props;
        submitNewVersion({
            description: this.state.newVersion.description,
            workflowId: workflowId,
            baseId: baseVersionId || null,
            history: history
        });
    };

    versionDetailsChanged = val => {
        this.setState({ newVersion: val });
    };

    render() {
        const { closeCreateVersionModal } = this.props;
        return (
            <form onSubmit={this.handleSubmitForm} autoComplete="off">
                <div className="new-version-page custom-modal-wrapper">
                    <div className="form-custom-modal">
                        <Select
                            dataObj={VERSION_LEVEL_LIST}
                            selectedItem={VERSION_LEVEL_LIST[0].value}
                            label={I18n.t('version.category')}
                            disabled
                        />
                        <Description
                            name="version-description"
                            description={this.state.newVersion.description}
                            dataTestId="new-version-description"
                            onDataChange={this.versionDetailsChanged}
                        />
                    </div>
                    <div className="modal-action-bar sdc-modal__footer">
                        <Button btnType="primary">
                            {I18n.t('buttons.createBtn')}
                        </Button>
                        <Button
                            btnType="secondary"
                            onClick={closeCreateVersionModal}>
                            {I18n.t('buttons.closeBtn')}
                        </Button>
                    </div>
                </div>
            </form>
        );
    }
}

export default CreateVersionView;
