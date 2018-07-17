package org.onap.sdc.workflow.api.types;

import java.util.Collection;
import lombok.Data;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;

@Data
public class VersionRequestDto {

    private String description;
    private String baseVersionId;
    private Collection<ParameterEntity> inputs;
    private Collection<ParameterEntity> outputs;

}
