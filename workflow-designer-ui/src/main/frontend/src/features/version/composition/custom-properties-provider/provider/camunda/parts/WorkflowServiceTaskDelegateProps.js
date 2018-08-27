import inherits from 'inherits';

import ImplementationTypeHelper from 'bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper';
import ServiceTaskDelegateProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ServiceTaskDelegateProps';
import workflowImplementationType from './implementation/WorkflowImplementationType';
import workflowActivity from './implementation/WorkflowActivity';
import { implementationType as implementationTypeConst } from './implementation/implementationConstants';

const getImplementationType = element => {
    let implementationType = ImplementationTypeHelper.getImplementationType(
        element
    );

    if (!implementationType) {
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
            entry => entry.id !== 'implementation'
        );

        group.entries = [
            ...workflowImplementationType(
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
            ),
            ...group.entries,
            ...workflowActivity(
                element,
                config,
                bpmnFactory,
                {
                    getBusinessObject: getBusinessObject,
                    getImplementationType: getImplementationType
                },
                translate
            )
        ];
    }
}

inherits(WorkflowServiceTaskDelegateProps, ServiceTaskDelegateProps);

export default WorkflowServiceTaskDelegateProps;
