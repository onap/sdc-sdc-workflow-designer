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
    @ComponentScan(basePackageClasses = {WorkflowMapper.class})
    public static class WorkflowMapperSpringTestConfig { }

    @Autowired
    WorkflowMapper workflowMapper;

    @Test
    public void shouldMapItemToWorkflow() {

        Item item = createMockItem();
        Workflow mappedWorkflow = workflowMapper.itemToWorkflow(item);
        assertEquals(mappedWorkflow.getId(), item.getId());
        assertEquals(mappedWorkflow.getDescription(), item.getDescription());
        assertEquals(mappedWorkflow.getName(), item.getName());
    }

    @Test
    public void shouldMapWorkflowToItem(){

       Workflow workflow = createMockWorkflow();
       Item mappedItem = workflowMapper.workflowToItem(workflow);
        assertEquals(mappedItem.getId(), workflow.getId());
        assertEquals(mappedItem.getDescription(), workflow.getDescription());
        assertEquals(mappedItem.getName(), workflow.getName());
    }

    private Item createMockItem() {
        Item item = new Item();
        item.setId("id");
        item.setDescription("item description");
        item.setName("item name");
        return item;
    }

    private Workflow createMockWorkflow() {
        Workflow workflow = new Workflow();
        workflow.setId("id");
        workflow.setDescription("workflow description");
        workflow.setName("workflow name");
        return workflow;
    }

}