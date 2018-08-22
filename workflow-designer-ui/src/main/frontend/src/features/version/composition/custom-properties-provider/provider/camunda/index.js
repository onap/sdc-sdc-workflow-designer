import ElementTemplates from 'bpmn-js-properties-panel/lib/provider/camunda/element-templates';
import Translate from 'diagram-js/lib/i18n/translate';

import WorkflowPropertiesProvider from './WorkflowPropertiesProvider';

export default {
    __depends__: [ElementTemplates, Translate],
    __init__: ['propertiesProvider'],
    propertiesProvider: ['type', WorkflowPropertiesProvider]
};
