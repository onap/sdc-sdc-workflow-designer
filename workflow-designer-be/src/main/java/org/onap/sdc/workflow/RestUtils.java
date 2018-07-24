package org.onap.sdc.workflow;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;

public class RestUtils {

    private RestUtils() {
    }

    private static final Logger LOGGER = LoggerFactory.getLogger(RestUtils.class);

    public static Set<WorkflowVersionState> mapVersionStateFilter(String versionStateFilter) {
        Set<WorkflowVersionState> filter;
        try {
            filter = versionStateFilter == null ? null :
                             Arrays.stream(versionStateFilter.split(",")).map(WorkflowVersionState::valueOf)
                                   .collect(Collectors.toSet());
        } catch (Exception e) {
            LOGGER.info(
                    "version state filter value is invalid and cannot be mapped to a set of version states, therefore it is set to empty set");
            filter = Collections.emptySet();
        }
        return filter;
    }
}
