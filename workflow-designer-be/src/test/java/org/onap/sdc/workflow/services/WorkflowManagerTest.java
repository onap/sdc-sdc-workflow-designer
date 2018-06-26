package org.onap.sdc.workflow.services;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.services.impl.WorkflowManagerImpl;
import org.openecomp.sdc.versioning.ItemManager;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@RunWith(MockitoJUnitRunner.class)
public class WorkflowManagerTest {

    private MockMvc mockMvc;

    @Mock
    private ItemManager itemManager;

    @Mock
    private UniqueValueService uniqueValueService;

    @InjectMocks
    private WorkflowManagerImpl workflowManager;


    @Before
    public void setUp(){
        mockMvc = MockMvcBuilders.standaloneSetup(workflowManager).build();
    }


    @Test
    public void testCreate(){

    }

}
