package org.onap.sdc.workflow.api;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
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

import java.util.Arrays;
import java.util.Collection;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.RestPath;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterType;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.onap.sdc.workflow.services.types.WorkflowVersion;
import org.onap.sdc.workflow.services.utilities.JsonUtil;
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

    private MockMvc mockMvc;

    @Mock
    private WorkflowVersionManager workflowVersionManagerMock;

    @InjectMocks
    private WorkflowVersionController workflowVersionController;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(workflowVersionController).build();
    }

    @Test
    public void shouldReturnWorkflowVersionListWhenCallingVersionGetREST() throws Exception {
        doReturn(Arrays.asList(new Version(VERSION1_ID), new Version(VERSION2_ID))).when(workflowVersionManagerMock)
                .list(ITEM1_ID, null);
        mockMvc.perform(get(RestPath.getWorkflowVersions(ITEM1_ID)).header(RestParams.USER_ID_HEADER, USER_ID)
                                .contentType(APPLICATION_JSON)).andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(2))).andExpect(jsonPath("$.items[0].id", is(VERSION1_ID)))
                .andExpect(jsonPath("$.items[1].id", is(VERSION2_ID)));

        verify(workflowVersionManagerMock, times(1)).list(ITEM1_ID, null);
    }


    @Test
    public void shouldCreateWorkflowVersionWhenCallingVersionsPostREST() throws Exception {

        WorkflowVersion version = new WorkflowVersion();
        version.setDescription("VersionDescription");
        mockMvc.perform(post(RestPath.getWorkflowVersions(ITEM1_ID)).header(RestParams.USER_ID_HEADER, USER_ID)
                                .contentType(APPLICATION_JSON).content(JsonUtil.object2Json(version)))
                .andExpect(status().isCreated());

        verify(workflowVersionManagerMock, times(1)).create(ITEM1_ID, null, version);
    }

    @Test
    public void shouldFailCreateWorkflowVersionWhenCallingVersionsPostRESTWithDuplicateInput() throws Exception {

        WorkflowVersion version = new WorkflowVersion();
        Collection<ParameterEntity> inputs =
                Arrays.asList(createParameterEntity("name1"), createParameterEntity("name1"));
        version.setInputs(inputs);
        version.setDescription("VersionDescription");
        mockMvc.perform(post(RestPath.getWorkflowVersions(ITEM1_ID)).header(RestParams.USER_ID_HEADER, USER_ID)
                                .contentType(APPLICATION_JSON).content(JsonUtil.object2Json(version)))
                .andExpect(status().isBadRequest());

    }


    @Test
    public void shouldReturnWorkflowVersionWhenExists() throws Exception {
        WorkflowVersion version = new WorkflowVersion(VERSION1_ID);
        doReturn(version).when(workflowVersionManagerMock).get(ITEM1_ID, VERSION1_ID);
        mockMvc.perform(
                get(RestPath.getWorkflowVersion(ITEM1_ID, VERSION1_ID)).header(RestParams.USER_ID_HEADER, USER_ID)
                        .contentType(APPLICATION_JSON)).andDo(print()).andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(version.getId())));
        verify(workflowVersionManagerMock, times(1)).get(ITEM1_ID, VERSION1_ID);
    }

    @Test
    public void shouldUpdateWorkflowVersionWhenCallingPutREST() throws Exception {
        WorkflowVersion version = new WorkflowVersion();
        version.setDescription("Updated");

        MockHttpServletResponse result = mockMvc.perform(
                put(RestPath.getWorkflowVersion(ITEM1_ID, VERSION1_ID)).header(RestParams.USER_ID_HEADER, USER_ID)
                        .contentType(APPLICATION_JSON).content(JsonUtil.object2Json(version))).andReturn()
                                                 .getResponse();

        assertEquals(HttpStatus.OK.value(), result.getStatus());
        version.setId(VERSION1_ID);
        verify(workflowVersionManagerMock, times(1)).update(ITEM1_ID, version);

    }

    private ParameterEntity createParameterEntity(String name) {
        ParameterEntity parameterEntity = new ParameterEntity();
        parameterEntity.setName(name);
        parameterEntity.setMandatory(false);
        parameterEntity.setType(ParameterType.STRING);
        return parameterEntity;
    }

}
