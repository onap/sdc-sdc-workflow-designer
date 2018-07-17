import { connect } from 'react-redux';
import VersionView from './VersionView';
import { workflowVersionFetchRequestedAction } from './versionConstants';

const mapDispatchToProps = dispatch => ({
    loadSelectedVersion: payload =>
        dispatch(workflowVersionFetchRequestedAction(payload))
});

export default connect(null, mapDispatchToProps)(VersionView);
