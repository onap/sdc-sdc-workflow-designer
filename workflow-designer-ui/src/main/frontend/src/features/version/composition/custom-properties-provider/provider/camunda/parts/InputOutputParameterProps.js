'use strict';

import inputOutputParameter from './implementation/InputOutputParameter';
import assign from 'lodash.assign';

module.exports = function(group, element, bpmnFactory, options, translate) {
    group.entries = group.entries.concat(
        inputOutputParameter(
            element,
            bpmnFactory,
            assign({}, options),
            translate
        )
    );
};
