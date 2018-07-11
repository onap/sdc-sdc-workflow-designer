package org.onap.sdc.workflow.services.impl.mappers;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.onap.sdc.workflow.TestUtil.createItem;
import static org.onap.sdc.workflow.TestUtil.createWorkflow;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.onap.sdc.workflow.persistence.types.Workflow;
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

        Item item = createItem(1,false,true);
        Workflow mappedWorkflow = workflowMapper.itemToWorkflow(item);
        assertEquals(mappedWorkflow.getId(), item.getId());
        assertEquals(mappedWorkflow.getDescription(), item.getDescription());
        assertEquals(mappedWorkflow.getName(), item.getName());
    }

    @Test
    public void shouldMapWorkflowToItem(){

       Workflow workflow = createWorkflow(1,true);
       Item mappedItem = workflowMapper.workflowToItem(workflow);
        assertEquals(mappedItem.getId(), workflow.getId());
        assertEquals(mappedItem.getDescription(), workflow.getDescription());
        assertEquals(mappedItem.getName(), workflow.getName());
    }

}