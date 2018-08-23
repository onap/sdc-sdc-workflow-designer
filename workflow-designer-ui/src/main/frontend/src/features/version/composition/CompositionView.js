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
import CustomModeler from './custom-modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from './custom-properties-provider/provider/camunda';
import camundaModuleDescriptor from './custom-properties-provider/descriptors/camunda';
import newDiagramXML from './newDiagram.bpmn';
import PropTypes from 'prop-types';
import CompositionButtons from './components/CompositionButtonsPanel';
import { setElementInputsOutputs } from './bpmnUtils.js';
import { I18n } from 'react-redux-i18n';

class CompositionView extends Component {
    static propTypes = {
        compositionUpdate: PropTypes.func,
        showErrorModal: PropTypes.func,
        composition: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        name: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        inputOutput: PropTypes.object,
        activities: PropTypes.array
    };
    constructor() {
        super();
        this.generatedId = 'bpmn-container' + Date.now();
        this.fileInput = React.createRef();
        this.selectedElement = false;
        this.state = {
            diagram: false
        };
    }

    componentDidMount() {
        const { composition } = this.props;

        this.modeler = new CustomModeler({
            propertiesPanel: {
                parent: '#js-properties-panel'
            },
            additionalModules: [
                propertiesPanelModule,
                propertiesProviderModule
            ],
            moddleExtensions: {
                camunda: camundaModuleDescriptor
            },
            workflow: {
                activities: this.props.activities,
                onChange: this.onActivityChanged
            }
        });

        this.modeler.attachTo('#' + this.generatedId);
        this.setDiagramToBPMN(composition ? composition : newDiagramXML);
        this.modeler.on('element.out', () => this.exportDiagramToStore());
    }
    onActivityChanged = async (bo, selectedValue) => {
        const selectedActivity = this.props.activities.find(
            el => el.name === selectedValue
        );

        if (selectedActivity) {
            const inputsOutputs = {
                inputs: selectedActivity.inputs,
                outputs: selectedActivity.outputs
            };
            setElementInputsOutputs(
                bo,
                inputsOutputs,
                this.modeler.get('moddle')
            );
        }
    };

    setDiagramToBPMN = diagram => {
        let modeler = this.modeler;
        this.modeler.importXML(diagram, err => {
            if (err) {
                return this.props.showErrorModal(
                    I18n.t('workflow.composition.importErrorMsg')
                );
            }
            let canvas = modeler.get('canvas');
            canvas.zoom('fit-viewport');
            setElementInputsOutputs(
                canvas._rootElement.businessObject,
                this.props.inputOutput,
                this.modeler.get('moddle')
            );
        });
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
        const { name, showErrorModal } = this.props;
        this.modeler.saveXML({ format: true }, (err, xml) => {
            if (err) {
                return showErrorModal(
                    I18n.t('workflow.composition.exportErrorMsg')
                );
            }
            const blob = new Blob([xml], { type: 'text/html;charset=utf-8' });
            fileSaver.saveAs(blob, `${name}-diagram.bpmn`);
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
                    onBlur={() => {
                        this.exportDiagramToStore();
                    }}
                    className="bpmn-container"
                    id={this.generatedId}
                />
                <div className="bpmn-sidebar">
                    <div
                        className="properties-panel"
                        id="js-properties-panel"
                    />
                    <CompositionButtons
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
