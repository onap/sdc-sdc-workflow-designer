import { connect } from 'react-redux';
import dateformat from 'dateformat';

import GeneralView from './GeneralView';
import {
    getGeneralDescription,
    getCreationTime,
    getMofificationTime
} from './generalSelectors';
import { workflowVersionDetailsChangedAction } from './../versionConstants';

export function mapStateToProps(state) {
    return {
        description: getGeneralDescription(state),
        created: dateformat(getCreationTime(state), 'dd/mm/yy h:MM'),
        modified: dateformat(getMofificationTime(state), 'dd/mm/yy h:MM')
    };
}

export function mapDispatchToProps(dispatch) {
    return {
        onDataChange: payload =>
            dispatch(workflowVersionDetailsChangedAction(payload))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GeneralView);
