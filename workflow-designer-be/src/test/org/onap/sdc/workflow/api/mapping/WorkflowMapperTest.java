package org.onap.sdc.workflow.api.mapping;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.HashMap;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.persistence.types.WorkflowProperty;
import org.onap.sdc.workflow.services.mappers.WorkflowMapper;
import org.openecomp.sdc.versioning.types.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@ContextConfiguration(classes = WorkflowMapperTest.WorkflowMapperSpringTestConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class WorkflowMapperTest {

    @Configuration
    @ComponentScan(basePackageClasses = WorkflowMapperTest.class)
    public static class WorkflowMapperSpringTestConfig { }

    @Autowired
    WorkflowMapper workflowMapper;

    @Test
    public void shouldMapItemPropertyToWorkflowCategory() {

        Item item = createMockItem();
        HashMap<String, Object> properties = new HashMap<>();
        properties.put(WorkflowProperty.CATEGORY, "category");
        item.setProperties(properties);

        Workflow mappedWorkflow = workflowMapper.itemToWorkflow(item);
        assertEquals(mappedWorkflow.getId(), item.getId());
        assertEquals(mappedWorkflow.getDescription(), item.getDescription());
        assertEquals(mappedWorkflow.getName(), item.getName());
        assertEquals(mappedWorkflow.getCategory(), properties.get(WorkflowProperty.CATEGORY));
    }

    @Test
    public void shouldAddWorkflowCategoryToItemProperties(){
        Workflow workflow = new Workflow();
        workflow.setId("id");
        workflow.setCategory("cat");

        Item item = workflowMapper.workflowToItem(workflow);
        assertNotNull(item.getProperties().get(WorkflowProperty.CATEGORY));
    }

    private Item createMockItem() {
        Item item = new Item();
        item.setId("id");
        item.setDescription("item description");
        item.setName("item name");
        return item;
    }

}