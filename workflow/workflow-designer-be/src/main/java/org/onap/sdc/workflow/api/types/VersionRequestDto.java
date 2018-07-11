package org.onap.sdc.workflow.api.types;

import lombok.Data;

@Data
public class VersionRequestDto {

    private String description;
    private String baseVersionId;

}
