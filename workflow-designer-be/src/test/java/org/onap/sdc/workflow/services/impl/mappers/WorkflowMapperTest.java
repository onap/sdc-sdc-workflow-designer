/*
 * Copyright © 2016-2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflow.services.impl.mappers;


import static org.junit.Assert.assertEquals;
import static org.onap.sdc.workflow.TestUtil.createItem;
import static org.onap.sdc.workflow.TestUtil.createWorkflow;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.onap.sdc.common.versioning.services.types.Item;
import org.onap.sdc.common.versioning.services.types.ItemStatus;
import org.onap.sdc.workflow.services.impl.ItemType;
import org.onap.sdc.workflow.services.types.ArchivingStatus;
import org.onap.sdc.workflow.services.types.Workflow;
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

        Item item = createItem(1, false, true, ItemStatus.ACTIVE);
        Workflow mappedWorkflow = workflowMapper.fromItem(item);
        assertEquals(mappedWorkflow.getId(), item.getId());
        assertEquals(mappedWorkflow.getDescription(), item.getDescription());
        assertEquals(mappedWorkflow.getName(), item.getName());
        assertEquals(mappedWorkflow.getArchiving().name(), item.getStatus().name());
    }

    @Test
    public void shouldMapWorkflowToItem() {

        Workflow workflow = createWorkflow(1, true, ArchivingStatus.ARCHIVED);
        Item mappedItem = new Item();
        workflowMapper.toItem(workflow, mappedItem);
        assertEquals(ItemType.WORKFLOW.name(), mappedItem.getType());
        assertEquals(workflow.getDescription(), mappedItem.getDescription());
        assertEquals(workflow.getName(), mappedItem.getName());
    }

}
