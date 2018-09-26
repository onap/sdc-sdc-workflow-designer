import inherits from 'inherits';

import ImplementationTypeHelper from 'bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper';
import ServiceTaskDelegateProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ServiceTaskDelegateProps';
import workflowImplementationType from './implementation/WorkflowImplementationType';
import workflowActivity from './implementation/WorkflowActivity';
import {
    implementationType as implementationTypeConst,
    serviceTaskEntries
} from './implementation/implementationConstants';
import Delegate from './implementation/Delegate';
import ResultVariable from './implementation/ResultVariable';

const getImplementationType = element => {
    let implementationType = ImplementationTypeHelper.getImplementationType(
        element
    );

    if (!implementationType || implementationType === 'expression') {
        const bo = getBusinessObject(element);
        if (bo) {
            if (
                typeof bo.get(implementationTypeConst.ACTIVITY) !== 'undefined'
            ) {
                return 'workflowActivity';
            }
        }
    }

    return implementationType;
};

const hideResultVariable = element => {
    return getImplementationType(element) !== 'expression';
};

const getBusinessObject = element =>
    ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);

const isDmnCapable = element => ImplementationTypeHelper.isDmnCapable(element);

const isExternalCapable = element =>
    ImplementationTypeHelper.isExternalCapable(element);

const isServiceTaskLike = element =>
    ImplementationTypeHelper.isServiceTaskLike(element);

function WorkflowServiceTaskDelegateProps(
    group,
    element,
    config,
    bpmnFactory,
    translate
) {
    ServiceTaskDelegateProps.call(this, group, element, bpmnFactory, translate);

    if (isServiceTaskLike(getBusinessObject(element))) {
        group.entries = group.entries.filter(
            entry =>
                entry.id !== serviceTaskEntries.IMPLEMENTATION &&
                entry.id !== serviceTaskEntries.DELEGATE &&
                entry.id !== serviceTaskEntries.RESULT_VARIABLE
        );

        group.entries = group.entries.concat(
            workflowImplementationType(
                element,
                bpmnFactory,
                {
                    getBusinessObject: getBusinessObject,
                    getImplementationType: getImplementationType,
                    hasDmnSupport: isDmnCapable(element),
                    hasExternalSupport: isExternalCapable(
                        getBusinessObject(element)
                    ),
                    hasServiceTaskLikeSupport: true
                },
                translate
            )
        );
        group.entries = group.entries.concat(
            workflowActivity(
                element,
                config,
                bpmnFactory,
                {
                    getBusinessObject: getBusinessObject,
                    getImplementationType: getImplementationType
                },
                translate
            )
        );

        group.entries = group.entries.concat(
            Delegate(
                element,
                bpmnFactory,
                {
                    getBusinessObject: getBusinessObject,
                    getImplementationType: getImplementationType
                },
                translate
            )
        );

        group.entries = group.entries.concat(
            ResultVariable(
                element,
                bpmnFactory,
                {
                    getBusinessObject: getBusinessObject,
                    getImplementationType: getImplementationType,
                    hideResultVariable: hideResultVariable
                },
                translate
            )
        );
    }
}

inherits(WorkflowServiceTaskDelegateProps, ServiceTaskDelegateProps);

export default WorkflowServiceTaskDelegateProps;
