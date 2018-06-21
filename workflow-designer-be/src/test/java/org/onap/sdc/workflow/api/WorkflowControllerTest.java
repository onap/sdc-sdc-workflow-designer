package org.onap.sdc.workflow.api;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.collection.IsCollectionWithSize.hasSize;
import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.api.impl.WorkflowControllerImpl;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.openecomp.sdc.versioning.types.Item;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;


@RunWith(MockitoJUnitRunner.class)
public class WorkflowControllerTest {

    private static final String MISSING_REQUEST_HEADER_ERRROR_FORMAT =
            "Missing request header '%s' for method parameter of type String";
    private static final String USER_ID = "userId";
    private static final String WORKFLOWS_URL = "/workflows";
    private static final Gson GSON = new Gson();

    private MockMvc mockMvc;


    @InjectMocks
    private WorkflowControllerImpl workflowController;

    @Mock
    private WorkflowManager workflowManagerMock;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(workflowController).build();
    }

    @Test
    public void shouldReturnErrorWhenMissingUserIdInGetReqHeader() throws Exception {
        Workflow workflowMock = createWorkflow(1, true);
        MockHttpServletResponse response =
                mockMvc.perform(get(WORKFLOWS_URL + "/" + workflowMock.getId()).contentType(APPLICATION_JSON))
                       .andDo(print()).andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn()
                       .getResponse();
        assertEquals(String.format(MISSING_REQUEST_HEADER_ERRROR_FORMAT, "USER_ID"), response.getErrorMessage());
    }

    @Test
    public void shouldReturnWorkflowDataWhenRequestPathIsOk() throws Exception {
        Workflow workflowMock = createWorkflow(1, true);
        doReturn(workflowMock).when(workflowManagerMock).get(any(Workflow.class));
        mockMvc.perform(
                get(WORKFLOWS_URL + "/" + workflowMock.getId()).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID)
                                                               .contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.id", is(workflowMock.getId())))
               .andExpect(jsonPath("$.name", is(workflowMock.getName())));
    }

    @Test
    public void shouldReturnErrorWhenMissingUserIdInListReqHeader() throws Exception {
        MockHttpServletResponse response =
                mockMvc.perform(get(WORKFLOWS_URL).contentType(APPLICATION_JSON)).andDo(print())
                       .andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn().getResponse();
        assertEquals(String.format(MISSING_REQUEST_HEADER_ERRROR_FORMAT, "USER_ID"), response.getErrorMessage());
    }

    @Test
    public void shouldReturnListOfWorkflows() throws Exception {
        int numOfWorkflows = 5;
        List<Workflow> workflowMocks = createWorkflows(numOfWorkflows);
        doReturn(workflowMocks).when(workflowManagerMock).list();
        mockMvc.perform(
                get(WORKFLOWS_URL).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(numOfWorkflows)));
    }

    @Test
    public void create() throws Exception {
        Item item = new Item();
        item.setId("abc");
        Workflow reqWorkflow = createWorkflow(1, false);
        mockMvc.perform(
                post(WORKFLOWS_URL).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON)
                                   .content(GSON.toJson(reqWorkflow))).andDo(print()).andExpect(status().isCreated())
               .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE));
        verify(workflowManagerMock, times(1)).create(reqWorkflow);
    }

    private List<Workflow> createWorkflows(int numOfWorkflows) {
        List<Workflow> workflowList = new ArrayList<>(numOfWorkflows);
        for (int i = 0; i < numOfWorkflows; i++) {
            workflowList.add(createWorkflow(i, true));
        }

        return workflowList;
    }

    private Workflow createWorkflow(int workflowPropertySuffix, boolean createId) {
        Workflow workflow = new Workflow();
        if (createId) {
            workflow.setId("workflowId" + workflowPropertySuffix);
        }
        workflow.setName("workflowName" + workflowPropertySuffix);
        workflow.setDescription("workflowDesc" + workflowPropertySuffix);

        return workflow;
    }
}