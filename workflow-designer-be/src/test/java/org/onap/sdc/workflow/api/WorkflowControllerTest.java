package org.onap.sdc.workflow.api;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.collection.IsCollectionWithSize.hasSize;
import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.TestUtil.createWorkflow;
import static org.onap.sdc.workflow.api.RestParams.USER_ID_HEADER;
import static org.onap.sdc.workflow.services.types.PagingConstants.DEFAULT_LIMIT;
import static org.onap.sdc.workflow.services.types.PagingConstants.DEFAULT_OFFSET;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.amdocs.zusammen.datatypes.Id;
import com.amdocs.zusammen.datatypes.item.Item;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.RestPath;
import org.onap.sdc.workflow.api.exceptionshandlers.CustomizedResponseEntityExceptionHandler;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.types.Page;
import org.onap.sdc.workflow.services.types.PagingRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@RunWith(MockitoJUnitRunner.class)
public class WorkflowControllerTest {


    private static final String MISSING_REQUEST_HEADER_ERRROR_FORMAT =
            "Missing request header '%s' for method parameter of type String";
    private static final String USER_ID = "userId";
    private static final Gson GSON = new Gson();
    private static final String DEFAULT_SORT_VALUE = "name:asc";

    private MockMvc mockMvc;


    @InjectMocks
    private WorkflowController workflowController;

    @Mock
    private WorkflowManager workflowManagerMock;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(workflowController)
                                 .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                                 .setControllerAdvice(new CustomizedResponseEntityExceptionHandler()).build();
    }

    @Test
    public void shouldReturnErrorWhenMissingUserIdInGetReqHeader() throws Exception {
        Workflow workflowMock = createWorkflow(1, true);
        MockHttpServletResponse response =
                mockMvc.perform(get(RestPath.getWorkflowPath(workflowMock.getId())).contentType(APPLICATION_JSON))
                       .andDo(print()).andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn()
                       .getResponse();
        assertEquals(String.format(MISSING_REQUEST_HEADER_ERRROR_FORMAT, USER_ID_HEADER),
                response.getContentAsString());
    }

    @Test
    public void shouldReturnWorkflowDataWhenRequestPathIsOk() throws Exception {
        Workflow workflowMock = createWorkflow(1, true);
        doReturn(workflowMock).when(workflowManagerMock).get(any(Workflow.class));
        mockMvc.perform(get(RestPath.getWorkflowPath(workflowMock.getId())).header(USER_ID_HEADER, USER_ID)
                                                                           .contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.id", is(workflowMock.getId())))
               .andExpect(jsonPath("$.name", is(workflowMock.getName())));
    }

    @Test
    public void shouldReturnErrorWhenMissingUserIdInListReqHeader() throws Exception {
        MockHttpServletResponse response =
                mockMvc.perform(get(RestPath.getWorkflowsPath()).contentType(APPLICATION_JSON)).andDo(print())
                       .andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn().getResponse();
        assertEquals(String.format(MISSING_REQUEST_HEADER_ERRROR_FORMAT, USER_ID_HEADER),
                response.getContentAsString());
    }

    @Test
    public void shouldReturn5WorkflowWhen5WorkflowsExists() throws Exception {
        int numOfWorkflows = 5;
        Page<Workflow> workflowMocks = createWorkflows(numOfWorkflows);
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        mockMvc.perform(get(RestPath.getWorkflowsPath()).header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(numOfWorkflows)));
    }

    @Test
    public void listWithValidVersionStateFilter() throws Exception {
        int numOfWorkflows = 3;
        Page<Workflow> workflows = createWorkflows(numOfWorkflows);
        doReturn(workflows).when(workflowManagerMock)
                           .list(eq(Collections.singleton(WorkflowVersionState.CERTIFIED)), any());
        mockMvc.perform(
                get(RestPath.getWorkflowsWithVersionStateFilterPath("CERTIFIED")).header(USER_ID_HEADER, USER_ID)
                                                                                 .contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.paging.total", is(numOfWorkflows)))
               .andExpect(jsonPath("$.items", hasSize(numOfWorkflows)));
    }

    @Test
    public void listWithInvalidVersionStateFilter() throws Exception {
        int numOfWorkflows = 0;
        Page<Workflow> workflows = createWorkflows(numOfWorkflows);
        doReturn(workflows).when(workflowManagerMock).list(eq(Collections.emptySet()), any());

        mockMvc.perform(
                get(RestPath.getWorkflowsWithVersionStateFilterPath("gibberish")).header(USER_ID_HEADER, USER_ID)
                                                                                 .contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.paging.total", is(numOfWorkflows)));
    }

    @Test
    public void shouldReturnSortedLimitOffsetAppliedWorkflows() throws Exception {
        Page<Workflow> workflowMocks = createLimit2AndOffset1For5WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        mockMvc.perform(get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "2", "1"))
                                .header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(2)));
    }

    @Test
    public void shouldReturnResultsWithDefaultWhenLimitIsNegative() throws Exception {
        Page<Workflow> workflowMocks = createLimit2AndOffset1For5WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        mockMvc.perform(get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "-2", "1"))
                                .header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.paging.offset", is(1)))
               .andExpect(jsonPath("$.paging.limit", is(DEFAULT_LIMIT)))
               .andExpect(jsonPath("$.paging.total", is(2)));
    }

    @Test
    public void shouldFallbackOnDefaultOffsetWhenOffsetIsNegative() throws Exception {
        mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "2", "-1"))
                        .header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)).andDo(print())
                                                  .andExpect(status().isOk())
               .andExpect(jsonPath("$.paging.offset", is(DEFAULT_OFFSET)))
               .andExpect(jsonPath("$.paging.limit", is(2)))
               .andExpect(jsonPath("$.paging.total", is(0)));
    }

    @Test
    public void shouldFallbackOnDefaultLimitWhenLimitIsNotAnInteger() throws Exception {
        mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "abc", "0"))
                        .header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)).andDo(print())
                                                  .andExpect(status().isOk())
                                                  .andExpect(jsonPath("$.paging.offset", is(0)))
                                                  .andExpect(jsonPath("$.paging.limit", is(DEFAULT_LIMIT)))
                                                  .andExpect(jsonPath("$.paging.total", is(0)));
    }

    @Test
    public void shouldFallbackOnDefaultOffsetWhenOffsetIsNotAnInteger() throws Exception {
        mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "2", "abc"))
                        .header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)).andDo(print())
                                                  .andExpect(status().isOk())
                                                  .andExpect(jsonPath("$.paging.offset", is(DEFAULT_OFFSET)))
                                                  .andExpect(jsonPath("$.paging.limit", is(2)))
                                                  .andExpect(jsonPath("$.paging.total", is(0)));
    }

    @Test
    public void shouldReturnDefaultLimitOffsetAppliedWorkflowsWhenLimitIsNotSpecified() throws Exception {
        Page<Workflow> workflowMocks = createLimit2AndOffset1For5WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        mockMvc.perform(get(RestPath.getWorkflowsPathNoSortAndLimit("1")).header(USER_ID_HEADER, USER_ID)
                                                                         .contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(2)));
    }

    @Test
    public void shouldReturnDefaultOffsetAppliedWorkflowsWhenOffsetIsNotSpecified() throws Exception {
        Page<Workflow> workflowMocks = createLimit1WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        mockMvc.perform(get(RestPath.getWorkflowsPathNoSortAndOffset("1")).header(USER_ID_HEADER, USER_ID)
                                                                          .contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(1)));
    }

    @Test
    public void shouldCreateWorkflowWhenCallingPostRESTRequest() throws Exception {
        Item item = new Item();
        item.setId(new Id("abc"));
        Workflow reqWorkflow = createWorkflow(1, false);
        mockMvc.perform(post(RestPath.getWorkflowsPath()).header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)
                                                         .content(GSON.toJson(reqWorkflow))).andDo(print())
               .andExpect(status().isCreated());
        verify(workflowManagerMock).create(reqWorkflow);
    }

    @Test
    public void shouldThrowExceptionWhenWorkflowNameInvalid() throws Exception {

        Workflow reqWorkflow = new Workflow();
        reqWorkflow.setName("Invalid workflow name %");
        MockHttpServletResponse response = mockMvc.perform(
                post(RestPath.getWorkflowsPath()).header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)
                                                 .content(GSON.toJson(reqWorkflow))).andDo(print())
                                                  .andExpect(status().isBadRequest()).andReturn().getResponse();
        assertEquals("Workflow name must contain only letters, digits and underscores", response.getContentAsString());
    }

    private Page<Workflow> createWorkflows(int numOfWorkflows) {
        List<Workflow> workflows = new ArrayList<>(numOfWorkflows);
        for (int i = 0; i < numOfWorkflows; i++) {
            workflows.add(createWorkflow(i, true));
        }
        return new Page<>(workflows, new PagingRequest(0, 200), numOfWorkflows);
    }

    private Page<Workflow> createLimit2AndOffset1For5WorkflowList() {
        List<Workflow> workflows = new ArrayList<>();
        workflows.add(createWorkflow(2, true));
        workflows.add(createWorkflow(3, true));
        return new Page<>(workflows, new PagingRequest(1, 200), 5);
    }

    private Page<Workflow> createLimit1WorkflowList() {
        List<Workflow> workflows = new ArrayList<>();
        workflows.add(createWorkflow(0, true));
        return new Page<>(workflows, new PagingRequest(0, 1), 1);
    }
}