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
//import camundaPropertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
//import propertiesProviderModule from './custom-properties-provider/provider/activity/';
import propertiesProviderModule from './custom-properties-provider/provider/camunda';
import camundaModuleDescriptor from './custom-properties-provider/descriptors/camunda';
import newDiagramXML from './newDiagram.bpmn';
import PropTypes from 'prop-types';
import CompositionButtons from './components/CompositionButtonsPanel';

function getExtension(element, type) {
    if (!element.extensionElements || !element.extensionElements.values) {
        return null;
    }

    return element.extensionElements.values.filter(function(e) {
        return e.$instanceOf(type);
    })[0];
}

function updatedData(moddle, inputData, existingArray, type) {
    return inputData.map(item => {
        const existingInput = existingArray.find(el => el.name === item.name);
        return moddle.create(
            type,
            existingInput ? { ...item, value: existingInput.value } : item
        );
    });
}
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
                propertiesProviderModule({ activities: this.props.activities })
            ],
            moddleExtensions: {
                camunda: camundaModuleDescriptor
            }
        });
        window.modeler = this.modeler;
        this.modeler.attachTo('#' + this.generatedId);
        this.setDiagram(composition ? composition : newDiagramXML);
        var eventBus = this.modeler.get('eventBus');
        eventBus.on('element.out', () => {
            this.exportDiagramToStore();
        });
        this.modeler.on('element.click', event =>
            this.elementClickHandler(event)
        );
    }

    setProcessInputsOutputs = (element, businessObject, inputOutput) => {
        const { inputs = [], outputs = [] } = inputOutput;
        const moddle = this.modeler.get('moddle');

        if (!businessObject.extensionElements) {
            console.log('creating new extension elements');
            businessObject.extensionElements = moddle.create(
                'bpmn:ExtensionElements'
            );
        }

        const existingInputOutput = getExtension(
            businessObject,
            'camunda:InputOutput'
        );
        console.log('existingInputOutput', existingInputOutput);

        const processInputs = updatedData(
            moddle,
            inputs,
            (existingInputOutput && existingInputOutput.inputParameters) || [],
            'camunda:InputParameter'
        );

        const processOutputs = updatedData(
            moddle,
            outputs,
            (existingInputOutput && existingInputOutput.outputParameters) || [],
            'camunda:OutputParameter'
        );

        const processInputOutput = moddle.create('camunda:InputOutput');
        processInputOutput.inputParameters = [...processInputs];
        processInputOutput.outputParameters = [...processOutputs];

        const extensionElements = businessObject.extensionElements.get(
            'values'
        );

        businessObject.extensionElements.set(
            'values',
            extensionElements
                .filter(item => item.$type !== 'camunda:InputOutput')
                .concat(processInputOutput)
        );
    };
    elementClickHandler(event) {
        const { element } = event;
        const businessObject = element.businessObject;

        this.selectedElement = businessObject;
        const activitySelector = document.getElementById(
            'camunda-selectedActivity-select'
        );
        if (activitySelector) {
            activitySelector.addEventListener('change', e =>
                this.selectChangedHandler(e)
            );
        }
    }
    selectChangedHandler(e) {
        console.log('selectChanged', e.target.value);
        console.log(this.selectedElement);
    }
    setDiagram = diagram => {
        this.setState(
            {
                diagram
            },
            this.importXML
        );
    };

    importXML = () => {
        const { diagram } = this.state;
        let modeler = this.modeler;
        this.modeler.importXML(diagram, err => {
            if (err) {
                //TDOD add i18n
                return this.props.showErrorModal('could not import diagram');
            }
            let canvas = modeler.get('canvas');
            canvas.zoom('fit-viewport');

            console.log(canvas._rootElement);
            this.setProcessInputsOutputs(
                canvas._rootElement,
                canvas._rootElement.businessObject,
                this.props.inputOutput
            );
        });
    };

    exportDiagramToStore = () => {
        this.modeler.saveXML({ format: true }, (err, xml) => {
            if (err) {
                //TODO   add i18n
                return this.props.showErrorModal('could not save diagram');
            }
            return this.props.compositionUpdate(xml);
        });
    };

    exportDiagram = () => {
        const { name, showErrorModal } = this.props;
        this.modeler.saveXML({ format: true }, (err, xml) => {
            if (err) {
                //TODO add i18n
                return showErrorModal('could not save diagram');
            }
            const blob = new Blob([xml], { type: 'text/html;charset=utf-8' });
            fileSaver.saveAs(blob, `${name}-diagram.bpmn`);
        });
    };

    loadNewDiagram = () => {
        this.setDiagram(newDiagramXML);
    };

    uploadDiagram = () => {
        this.fileInput.current.click();
    };

    handleFileInputChange = filesList => {
        const file = filesList[0];
        const reader = new FileReader();
        reader.onloadend = event => {
            var xml = event.target.result;
            this.setDiagram(xml);
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
