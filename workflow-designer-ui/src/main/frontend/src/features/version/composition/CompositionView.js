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
import fileSaver from 'file-saver';
import isEqual from 'lodash.isequal';
import CustomModeler from './custom-modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from './custom-properties-provider/provider/camunda';
import camundaModuleDescriptor from './custom-properties-provider/descriptors/camunda';
import newDiagramXML from './newDiagram.bpmn';
import PropTypes from 'prop-types';
import CompositionButtons from './components/CompositionButtonsPanel';
import { setElementInputsOutputs } from './bpmnUtils.js';
import { I18n } from 'react-redux-i18n';
import {
    PROCESS_DEFAULT_ID,
    COMPOSITION_ERROR_COLOR,
    COMPOSITION_VALID_COLOR,
    CAMUNDA_PANEL_INPUTS_NAMES
} from './compositionConstants';
import readOnly from './readOnly';

function setStatusToElement(type, status, parent) {
    let elements = parent.getElementsByTagName(type);
    for (let item of elements) {
        if (item.name !== 'selectedExtensionElement') {
            item.readOnly = status;
            item.disabled = status;
        }
    }
}

function disablePanelInputs(status) {
    let panel = document.getElementById('js-properties-panel');

    if (panel) {
        setStatusToElement('input', status, panel);
        setStatusToElement('button', status, panel);
        setStatusToElement('select', status, panel);

        //distinguish editable and clickable fields using attr and style
        CAMUNDA_PANEL_INPUTS_NAMES.map(name => {
            const div = document.getElementById(name);
            if (div) {
                div.setAttribute('editable-readonly', !status);
            }
        });
    }
}
class CompositionView extends Component {
    static propTypes = {
        compositionUpdate: PropTypes.func,
        showErrorModal: PropTypes.func,
        composition: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        name: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        versionName: PropTypes.string,
        inputOutput: PropTypes.object,
        activities: PropTypes.array,
        validationUpdate: PropTypes.func,
        errors: PropTypes.array,
        isReadOnly: PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.generatedId = 'bpmn-container' + Date.now();
        this.fileInput = React.createRef();
        this.bpmnContainer = React.createRef();
        this.selectedElement = false;
        this.state = {
            diagram: false
        };
        this.versionChanged = false;
    }
    componentDidUpdate(prevProps) {
        const { errors, isReadOnly, versionName, composition } = this.props;
        if (!isEqual(prevProps.errors, errors)) {
            errors.map(item => {
                this.modeling.setColor([item.element], {
                    fill: item.isValid
                        ? COMPOSITION_VALID_COLOR
                        : COMPOSITION_ERROR_COLOR
                });
            });
        }
        if (prevProps.isReadOnly !== isReadOnly) {
            this.modeler.get('readOnly').readOnly(isReadOnly);
            disablePanelInputs(isReadOnly);
        }

        if (prevProps.versionName !== versionName) {
            this.versionChanged = true;
        }
        if (
            !isEqual(prevProps.composition, composition) &&
            this.versionChanged
        ) {
            this.setDiagramToBPMN(composition);
            this.versionChanged = false;
        }
    }
    componentDidMount() {
        const {
            composition,
            activities,
            inputOutput,
            validationUpdate,
            isReadOnly
        } = this.props;

        const readOnlyModule = {
            __init__: ['readOnly'],
            readOnly: ['type', readOnly]
        };
        this.modeler = new CustomModeler({
            propertiesPanel: {
                parent: '#js-properties-panel'
            },
            additionalModules: [
                propertiesPanelModule,
                propertiesProviderModule,
                readOnlyModule
            ],
            moddleExtensions: {
                camunda: camundaModuleDescriptor
            },
            workflow: {
                activities: activities,
                getActivityInputsOutputs: this.getActivityInputsOutputs,
                workflowInputOutput: inputOutput,
                validationUpdate: validationUpdate
            }
        });

        this.modeler.attachTo('#' + this.generatedId);
        this.setDiagramToBPMN(composition ? composition : newDiagramXML);
        this.modeler.on('element.out', () => this.exportDiagramToStore());
        this.modeler.on('element.click', this.handleCompositionStatus);
        this.modeler.on(
            'propertiesPanel.changed',
            this.handleCompositionStatus
        );
        this.modeling = this.modeler.get('modeling');
        this.modeler.get('readOnly').readOnly(isReadOnly);
    }
    handleCompositionStatus = () => {
        disablePanelInputs(this.props.isReadOnly);
    };
    getActivityInputsOutputs = selectedValue => {
        const selectedActivity = this.props.activities.find(
            el => el.name === selectedValue
        );

        if (selectedActivity) {
            const inputsOutputs = {
                inputs: selectedActivity.inputs,
                outputs: selectedActivity.outputs
            };
            return inputsOutputs;
        } else return { inputs: [], outputs: [] };
    };

    setDiagramToBPMN = diagram => {
        let modeler = this.modeler;
        this.modeler.importXML(diagram, err => {
            if (err) {
                return this.props.showErrorModal(
                    I18n.t('workflow.composition.importErrorMsg')
                );
            }
            const canvas = modeler.get('canvas');
            canvas.zoom('fit-viewport');
            const { businessObject } = canvas._rootElement;

            this.setDefaultIdAndName(businessObject);
            setElementInputsOutputs(
                businessObject,
                this.props.inputOutput,
                this.modeler.get('moddle')
            );
            disablePanelInputs(this.props.isReadOnly);
        });
    };
    setDefaultIdAndName = businessObject => {
        const { name = '' } = this.props;
        if (!businessObject.name) {
            businessObject.name = name;
        }

        if (businessObject.id === PROCESS_DEFAULT_ID || !businessObject.id) {
            businessObject.id = name.toLowerCase().replace(/\s/g, '_');
        }
    };
    exportDiagramToStore = () => {
        this.modeler.saveXML({ format: true }, (err, xml) => {
            if (err) {
                return this.props.showErrorModal(
                    I18n.t('workflow.composition.saveErrorMsg')
                );
            }
            return this.props.compositionUpdate(xml);
        });
    };

    exportDiagram = () => {
        const { name, showErrorModal, versionName } = this.props;
        this.modeler.saveXML({ format: true }, (err, xml) => {
            if (err) {
                return showErrorModal(
                    I18n.t('workflow.composition.exportErrorMsg')
                );
            }
            const blob = new Blob([xml], { type: 'text/html;charset=utf-8' });
            fileSaver.saveAs(
                blob,
                `${name.replace(/\s/g, '').toLowerCase()}-${versionName}.bpmn`
            );
        });
    };

    loadNewDiagram = () => {
        this.setDiagramToBPMN(newDiagramXML);
    };

    uploadDiagram = () => {
        this.fileInput.current.click();
    };

    handleFileInputChange = filesList => {
        const file = filesList[0];
        const reader = new FileReader();
        reader.onloadend = event => {
            var xml = event.target.result;
            this.setDiagramToBPMN(xml);
            this.fileInput.value = '';
        };
        reader.readAsText(file);
    };

    render() {
        return (
            <div className="composition-view content">
                <input
                    ref={this.fileInput}
                    onChange={e => this.handleFileInputChange(e.target.files)}
                    id="file-input"
                    accept=".bpmn, .xml"
                    type="file"
                    name="file-input"
                    style={{ display: 'none' }}
                />
                <div
                    ref={this.bpmnContainer}
                    className="bpmn-container"
                    id={this.generatedId}
                />
                <div className="bpmn-sidebar">
                    <div
                        className="properties-panel"
                        id="js-properties-panel"
                    />
                    <CompositionButtons
                        isReadOnly={this.props.isReadOnly}
                        onClean={this.loadNewDiagram}
                        onDownload={this.exportDiagram}
                        onUpload={this.uploadDiagram}
                    />
                </div>
            </div>
        );
    }
}

export default CompositionView;
