package org.onap.sdc.workflow.services;

import java.util.Collection;

import org.onap.sdc.workflow.api.types.PaginationParameters;
import org.onap.sdc.workflow.persistence.types.Workflow;

public interface WorkflowManager {

    Collection<Workflow> list(PaginationParameters paginationParameters);

    Workflow get(Workflow workflow);

    void create(Workflow workflow);

    void update(Workflow workflow);
}
