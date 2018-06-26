package org.onap.sdc.workflow.services;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.collection.IsCollectionWithSize.hasSize;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.api.RestConstants;
import org.onap.sdc.workflow.services.impl.WorkflowVersionManagerImpl;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@RunWith(MockitoJUnitRunner.class)
public class WorkflowVersionManagerTest {

    private static final String USER_ID = "cs0008";
    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final String VERSION2_ID = "version_id_2";
    private List<Version> versionList;

    @Mock
    private static VersioningManager versioningManagerMock;

    @TestConfiguration
    static class WorkflowVersionManagerTestContextConfiguration {

        @Bean
        public WorkflowVersionManager WorkflowVersionManagerImpl() {
            return new WorkflowVersionManagerImpl(versioningManagerMock);
        }
    }

    @Autowired
    private WorkflowVersionManager workflowVersionManager;



    @Before
    public void setUp(){
        versionList = Arrays.asList( new Version(VERSION1_ID),new Version(VERSION2_ID));

    }


    @Test
    public void shouldReturnWorkflowVersionList(){


    }

}
