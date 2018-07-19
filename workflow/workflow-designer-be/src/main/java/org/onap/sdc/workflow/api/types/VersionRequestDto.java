package org.onap.sdc.workflow.api.types;

import java.util.Collection;
import java.util.Collections;
import lombok.Data;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;

@Data
public class VersionRequestDto {

    private String description;
    private String baseVersionId;
    private Collection<ParameterEntity> inputs = Collections.emptyList();
    private Collection<ParameterEntity> outputs = Collections.emptyList();

}
