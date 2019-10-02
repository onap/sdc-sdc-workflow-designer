import { connect } from 'react-redux';
import VersionView from 'features/version/VersionView';
import { workflowVersionFetchRequestedAction } from 'features/version/versionConstants';

const mapStateToProps = ({ currentVersion: { operationMode } }) => {
    return {
        operationMode
    };
};

const mapDispatchToProps = dispatch => ({
    loadSelectedVersion: payload =>
        dispatch(workflowVersionFetchRequestedAction(payload))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VersionView);
