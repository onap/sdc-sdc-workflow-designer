import inputOutputParameter from './implementation/InputOutputParameter';
import assign from 'lodash.assign';

export default function(
    group,
    element,
    bpmnFactory,
    options,
    translate,
    config
) {
    group.entries = group.entries.concat(
        inputOutputParameter(
            element,
            bpmnFactory,
            assign({}, options),
            translate,
            config
        )
    );
}
