package org.onap.sdc.workflow.services.mappers;

import java.util.HashMap;
import java.util.Map;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.MapperConfig;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.persistence.types.WorkflowProperty;
import org.openecomp.sdc.versioning.types.Item;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface WorkflowMapper{

    @Mapping(source = "properties", target = "category", qualifiedByName = "propertiesToCategoryMapper")
    Workflow itemToWorkflow(Item item);

    @Mapping(source = "category", target = "properties", qualifiedByName = "categoryToPropertiesMapper")
    @InheritInverseConfiguration
    Item workflowToItem(Workflow workflow);

    @Named("propertiesToCategoryMapper")
    default String customPropertiesToCategoryMapper(Map<String, Object> properties){
        return String.class.cast(properties.get(WorkflowProperty.CATEGORY));
    }

    @Named("categoryToPropertiesMapper")
    default Map<String, Object> customCategoryToPropertiesMapper(String category){
        Map<String, Object> properties = new HashMap<>();
        properties.put(WorkflowProperty.CATEGORY,category);
        return properties;
    }
}
