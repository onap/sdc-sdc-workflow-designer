package org.onap.sdc.workflow.services.exceptions;

import org.onap.sdc.workflow.services.types.WorkflowVersionState;

public class VersionStateModificationMissingArtifactException extends RuntimeException {

    public static final String WORKFLOW_MODIFICATION_STATE_MISSING_ARTIFACT_TEMPLATE =
            "Workflow %s, version %s: state can not be changed from %s to %s. Missing artifact";

    public VersionStateModificationMissingArtifactException(String workflowId, String versionId,
                                                            WorkflowVersionState sourceState,
                                                            WorkflowVersionState targetState) {
        super(String.format(WORKFLOW_MODIFICATION_STATE_MISSING_ARTIFACT_TEMPLATE, workflowId, versionId,
                sourceState.name(), targetState.name()));
    }
}
