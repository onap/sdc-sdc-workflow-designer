/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*http://www.apache.org/licenses/LICENSE-2.0
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

import CustomModeler from 'features/version/composition/custom-modeler';
import camundaModuleDescriptor from 'features/version/composition/custom-properties-provider/descriptors/camunda';
import { setElementInputsOutputs } from 'features/version/composition/bpmnUtils.js';

import { connect } from 'react-redux';
import { updateComposition } from 'features/version/composition/compositionActions';
import { showErrorModalAction } from 'shared/modal/modalWrapperActions';
import { getComposition } from 'features/version/composition/compositionSelectors';
import { getWorkflowName } from 'features/workflow/workflowSelectors';
import { activitiesSelector } from 'features/activities/activitiesSelectors';
import { getInputOutputForComposition } from 'features/version/inputOutput/inputOutputSelectors';

class CompositionUpdate extends Component {
    static propTypes = {
        compositionUpdate: PropTypes.func,
        showErrorModal: PropTypes.func,
        composition: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        inputOutput: PropTypes.object,
        activities: PropTypes.object,
        certifyBack: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.generatedId = 'bpmn-container' + Date.now();
        this.fileInput = React.createRef();
        this.bpmnContainer = React.createRef();
    }

    componentDidMount() {
        const { composition, activities, inputOutput } = this.props;

        this.modeler = new CustomModeler({
            moddleExtensions: {
                camunda: camundaModuleDescriptor
            },
            workflow: {
                activities: activities,
                workflowInputOutput: inputOutput
            }
        });

        this.setDiagramToBPMN(composition);
    }

    setDiagramToBPMN = diagram => {
        let modeler = this.modeler;
        this.modeler.importXML(diagram, err => {
            if (err) {
                return this.props.showErrorModal(
                    I18n.t('workflow.composition.importErrorMsg')
                );
            }
            const canvas = modeler.get('canvas');
            const { businessObject } = canvas._rootElement;

            setElementInputsOutputs(
                businessObject,
                this.props.inputOutput,
                this.modeler.get('moddle')
            );

            this.exportDiagramToStore();
        });
    };

    exportDiagramToStore = () => {
        this.modeler.saveXML({ format: true }, (err, xml) => {
            if (err) {
                return this.props.showErrorModal(
                    I18n.t('workflow.composition.saveErrorMsg')
                );
            }
            this.props.compositionUpdate(xml);
            this.props.certifyBack();
        });
    };

    render() {
        return <div />;
    }
}

function mapStateToProps(state) {
    return {
        composition: getComposition(state),
        name: getWorkflowName(state),
        activities: activitiesSelector(state),
        inputOutput: getInputOutputForComposition(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        compositionUpdate: composition =>
            dispatch(updateComposition(composition)),
        showErrorModal: msg =>
            dispatch(
                showErrorModalAction({
                    title: I18n.t('workflow.composition.bpmnError'),
                    body: msg,
                    withButtons: true,
                    closeButtonText: I18n.t('buttons.okBtn')
                })
            )
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CompositionUpdate);
