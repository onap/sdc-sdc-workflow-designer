import React from 'react';
import PropTypes from 'prop-types';
import { WORKFLOW_STATUS } from 'features/workflow/workflowConstants';

const StatusSelect = ({ status, onChange }) => (
    <select
        className="wf-status-select"
        value={status}
        data-test-id="status-select"
        onChange={e => onChange(e.target.value)}>
        {Object.keys(WORKFLOW_STATUS).map((type, i) => (
            <option key={`type.${i}`} value={WORKFLOW_STATUS[type]}>
                {type}
            </option>
        ))}
    </select>
);

StatusSelect.propTypes = {
    status: PropTypes.string,
    onChange: PropTypes.func
};

export default StatusSelect;
