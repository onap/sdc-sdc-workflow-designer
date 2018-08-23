import inherits from 'inherits';
import CamundaPropertiesProvider from 'bpmn-js-properties-panel/lib/provider/camunda/CamundaPropertiesProvider';

import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import asyncCapableHelper from 'bpmn-js-properties-panel/lib/helper/AsyncCapableHelper';
import eventDefinitionHelper from 'bpmn-js-properties-panel/lib/helper/EventDefinitionHelper';
import implementationTypeHelper from 'bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper';

import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
import executableProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ExecutableProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import eventProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';

import elementTemplateChooserProps from 'bpmn-js-properties-panel/lib/provider/camunda/element-templates/parts/ChooserProps';
import elementTemplateCustomProps from 'bpmn-js-properties-panel/lib/provider/camunda/element-templates/parts/CustomProps';

import versionTag from 'bpmn-js-properties-panel/lib/provider/camunda/parts/VersionTagProps';
import userTaskProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/UserTaskProps';
import scriptProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ScriptTaskProps';
import callActivityProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/CallActivityProps';
import conditionalProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ConditionalProps';
import startEventInitiator from 'bpmn-js-properties-panel/lib/provider/camunda/parts/StartEventInitiator';
import multiInstanceProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/MultiInstanceLoopProps';
import asynchronousContinuationProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/AsynchronousContinuationProps';
import jobConfiguration from 'bpmn-js-properties-panel/lib/provider/camunda/parts/JobConfigurationProps';
import externalTaskConfiguration from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ExternalTaskConfigurationProps';
import candidateStarter from 'bpmn-js-properties-panel/lib/provider/camunda/parts/CandidateStarterProps';
import historyTimeToLive from 'bpmn-js-properties-panel/lib/provider/camunda/parts/HistoryTimeToLiveProps';

import createInputOutputTabGroups from './parts/createInputOutputTabGroups';
import workflowServiceTaskDelegateProps from './parts/WorkflowServiceTaskDelegateProps';

const PROCESS_KEY_HINT = 'This maps to the process definition key.';

const isExternalTaskPriorityEnabled = function(element) {
    const businessObject = getBusinessObject(element);

    // show only if element is a process, a participant ...
    if (
        is(element, 'bpmn:Process') ||
        (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
    ) {
        return true;
    }

    const externalBo = implementationTypeHelper.getServiceTaskLikeBusinessObject(
            element
        ),
        isExternalTask =
            implementationTypeHelper.getImplementationType(externalBo) ===
            'external';

    // ... or an external task with selected external implementation type
    return (
        !!implementationTypeHelper.isExternalCapable(externalBo) &&
        isExternalTask
    );
};

const isJobConfigEnabled = element => {
    const businessObject = getBusinessObject(element);

    if (
        is(element, 'bpmn:Process') ||
        (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
    ) {
        return true;
    }

    // async behavior
    const bo = getBusinessObject(element);
    if (
        asyncCapableHelper.isAsyncBefore(bo) ||
        asyncCapableHelper.isAsyncAfter(bo)
    ) {
        return true;
    }

    // timer definition
    if (is(element, 'bpmn:Event')) {
        return !!eventDefinitionHelper.getTimerEventDefinition(element);
    }

    return false;
};

function createGeneralTabGroups(
    element,
    config,
    bpmnFactory,
    elementRegistry,
    elementTemplates,
    translate
) {
    // refer to target element for external labels
    element = element.labelTarget || element;

    const generalGroup = {
        id: 'general',
        label: translate('General'),
        entries: []
    };

    let idOptions;
    let processOptions;

    if (is(element, 'bpmn:Process')) {
        idOptions = { description: PROCESS_KEY_HINT };
    }

    if (is(element, 'bpmn:Participant')) {
        processOptions = { processIdDescription: PROCESS_KEY_HINT };
    }

    idProps(generalGroup, element, translate, idOptions);
    nameProps(generalGroup, element, translate);
    processProps(generalGroup, element, translate, processOptions);
    versionTag(generalGroup, element, translate);
    executableProps(generalGroup, element, translate);
    elementTemplateChooserProps(
        generalGroup,
        element,
        elementTemplates,
        translate
    );

    const customFieldsGroups = elementTemplateCustomProps(
        element,
        elementTemplates,
        bpmnFactory,
        translate
    );

    const detailsGroup = {
        id: 'details',
        label: translate('Details'),
        entries: []
    };
    workflowServiceTaskDelegateProps(
        detailsGroup,
        element,
        config,
        bpmnFactory,
        translate
    );
    userTaskProps(detailsGroup, element, translate);
    scriptProps(detailsGroup, element, bpmnFactory, translate);
    linkProps(detailsGroup, element, translate);
    callActivityProps(detailsGroup, element, bpmnFactory, translate);
    eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);
    conditionalProps(detailsGroup, element, bpmnFactory, translate);
    startEventInitiator(detailsGroup, element, translate); // this must be the last element of the details group!

    const multiInstanceGroup = {
        id: 'multiInstance',
        label: translate('Multi Instance'),
        entries: []
    };
    multiInstanceProps(multiInstanceGroup, element, bpmnFactory, translate);

    const asyncGroup = {
        id: 'async',
        label: translate('Asynchronous Continuations'),
        entries: []
    };
    asynchronousContinuationProps(asyncGroup, element, bpmnFactory, translate);

    const jobConfigurationGroup = {
        id: 'jobConfiguration',
        label: translate('Job Configuration'),
        entries: [],
        enabled: isJobConfigEnabled
    };
    jobConfiguration(jobConfigurationGroup, element, bpmnFactory, translate);

    const externalTaskGroup = {
        id: 'externalTaskConfiguration',
        label: translate('External Task Configuration'),
        entries: [],
        enabled: isExternalTaskPriorityEnabled
    };
    externalTaskConfiguration(
        externalTaskGroup,
        element,
        bpmnFactory,
        translate
    );

    const candidateStarterGroup = {
        id: 'candidateStarterConfiguration',
        label: translate('Candidate Starter Configuration'),
        entries: []
    };
    candidateStarter(candidateStarterGroup, element, bpmnFactory, translate);

    const historyTimeToLiveGroup = {
        id: 'historyConfiguration',
        label: translate('History Configuration'),
        entries: []
    };
    historyTimeToLive(historyTimeToLiveGroup, element, bpmnFactory, translate);

    const documentationGroup = {
        id: 'documentation',
        label: translate('Documentation'),
        entries: []
    };
    documentationProps(documentationGroup, element, bpmnFactory, translate);

    const groups = [];
    groups.push(generalGroup);
    customFieldsGroups.forEach(function(group) {
        groups.push(group);
    });
    groups.push(detailsGroup);
    groups.push(externalTaskGroup);
    groups.push(multiInstanceGroup);
    groups.push(asyncGroup);
    groups.push(jobConfigurationGroup);
    groups.push(candidateStarterGroup);
    groups.push(historyTimeToLiveGroup);
    groups.push(documentationGroup);

    return groups;
}

function WorkflowPropertiesProvider(
    config,
    eventBus,
    bpmnFactory,
    elementRegistry,
    elementTemplates,
    translate
) {
    CamundaPropertiesProvider.call(
        this,
        eventBus,
        bpmnFactory,
        elementRegistry,
        elementTemplates,
        translate
    );

    this.getTabs = function(element) {
        const camundaPropertiesProvider = new CamundaPropertiesProvider(
            eventBus,
            bpmnFactory,
            elementRegistry,
            elementTemplates,
            translate
        );

        const tabs = camundaPropertiesProvider
            .getTabs(element)
            .filter(tab => tab.id !== 'general' && tab.id !== 'input-output');

        const generalTab = {
            id: 'general',
            label: translate('General'),
            groups: createGeneralTabGroups(
                element,
                config,
                bpmnFactory,
                elementRegistry,
                elementTemplates,
                translate
            )
        };

        const inputOutputTab = {
            id: 'input-output',
            label: translate('Input/Output'),
            groups: createInputOutputTabGroups(
                element,
                bpmnFactory,
                elementRegistry,
                translate
            )
        };
        tabs.unshift(inputOutputTab);
        tabs.unshift(generalTab);
        return tabs;
    };
}

WorkflowPropertiesProvider.$inject = [
    'config.workflow',
    'eventBus',
    'bpmnFactory',
    'elementRegistry',
    'elementTemplates',
    'translate'
];

inherits(WorkflowPropertiesProvider, CamundaPropertiesProvider);

export default WorkflowPropertiesProvider;
