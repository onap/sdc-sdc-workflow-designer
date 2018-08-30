'use strict';

import inputOutputParameter from './implementation/InputOutputParameter';
import assign from 'lodash.assign';

function InputOutputParameterProps(
    group,
    element,
    bpmnFactory,
    options,
    translate
) {
    group.entries = group.entries.concat(
        inputOutputParameter(
            element,
            bpmnFactory,
            assign({}, options),
            translate
        )
    );
}

export default InputOutputParameterProps;
