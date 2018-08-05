package org.onap.sdc.workflow.api.types;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;

@Getter
public class VersionStatesFormatter {

    private static final Logger LOGGER = LoggerFactory.getLogger(VersionStatesFormatter.class);

    private Set<WorkflowVersionState> versionStates = null;

    public void setVersionState(String value) {
        this.versionStates = formatString(value);
    }

    public void setState(String value) {
        this.versionStates = formatString(value);
    }

    private static Set<WorkflowVersionState> formatString(String value) {
        try {
            return value == null ? null : Arrays.stream(value.split(",")).map(WorkflowVersionState::valueOf)
                                                .collect(Collectors.toSet());
        } catch (Exception ignore) {
            LOGGER.info(
                    "value is invalid and cannot be formatted to a set of version states, therefore it set to empty set");
            return Collections.emptySet();
        }
    }
}
