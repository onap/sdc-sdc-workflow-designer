package org.onap.sdc.workflow.persistence.types;

import lombok.Data;

@Data
public class ParameterEntity {

    private String id;
    private String name;
    private ParameterType type;
    private boolean mandatory;
}
