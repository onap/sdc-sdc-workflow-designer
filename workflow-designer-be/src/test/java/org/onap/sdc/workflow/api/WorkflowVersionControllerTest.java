package org.onap.sdc.workflow.api;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.collection.IsCollectionWithSize.hasSize;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.api.impl.WorkflowVersionControllerImpl;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@RunWith(MockitoJUnitRunner.class)
public class WorkflowVersionControllerTest {

    private static final String USER_ID = "cs0008";
    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final String VERSION2_ID = "version_id_2";
    private List<Version> versionList;

    private static final Gson GSON = new Gson();

    private MockMvc mockMvc;

    @Mock
    private WorkflowVersionManager workflowVersionManagerMock;

    @InjectMocks
    private WorkflowVersionControllerImpl workflowVersionController;

    @Before
    public void setUp() {
        versionList = Arrays.asList( new Version(VERSION1_ID),new Version(VERSION2_ID));
        mockMvc = MockMvcBuilders.standaloneSetup(workflowVersionController).build();
    }

    @Test
    public void shouldReturnVersionListOfWorkflow() throws Exception {

        doReturn(versionList).when(workflowVersionManagerMock).list(ITEM1_ID);
        mockMvc.perform(get("/workflows/item_id_1/versions").header(RestConstants.USER_ID_HEADER_PARAM, USER_ID)
                                                            .contentType(APPLICATION_JSON)).andExpect(status().isOk())
               .andExpect(jsonPath("$.results", hasSize(2)))
               .andExpect(jsonPath("$.results[0].id", equalTo(VERSION1_ID)))
               .andExpect(jsonPath("$.results[1].id", equalTo(VERSION2_ID)));

        verify(workflowVersionManagerMock, times(1)).list(ITEM1_ID);
    }


    @Test
    public void shouldCreateWorkflowVersion() throws Exception {

        Version version = new Version();
        version.setDescription("VersionDescription");
        mockMvc.perform(post("/workflows/item_id_1/versions").header(RestConstants.USER_ID_HEADER_PARAM, USER_ID)
                                                             .contentType(APPLICATION_JSON)
                                                             .content(GSON.toJson(version)))
               .andExpect(status().isCreated());

        verify(workflowVersionManagerMock, times(1)).create(ITEM1_ID, version);
    }


    @Test
    public void shouldReturnWorkflowVersionWhenExists() throws Exception {
        Version version = new Version(VERSION1_ID);
        doReturn(version).when(workflowVersionManagerMock).get(ITEM1_ID, version);
        mockMvc.perform(
                get("/workflows/item_id_1/versions/" + VERSION1_ID).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID)
                                                                   .contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.id", is(version.getId())));
        verify(workflowVersionManagerMock, times(1)).get(ITEM1_ID, version);
    }

    @Test
    public void shouldUpdateWorkflowVersion() throws Exception {
        Version version = new Version();
        version.setDescription("Updated");

        MockHttpServletResponse result = mockMvc.perform(
                put("/workflows/item_id_1/versions/" + VERSION1_ID).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID)
                                                                   .contentType(APPLICATION_JSON)
                                                                   .content(GSON.toJson(version))).andReturn()
                                                .getResponse();

        assertEquals(HttpStatus.OK.value(), result.getStatus());
        version.setId(VERSION1_ID);
        verify(workflowVersionManagerMock, times(1)).update(ITEM1_ID, version);

    }

}
