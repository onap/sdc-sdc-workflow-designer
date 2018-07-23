package org.onap.sdc.workflow.api;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.collection.IsCollectionWithSize.hasSize;
import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.TestUtil.createWorkflow;
import static org.onap.sdc.workflow.api.RestConstants.PAGE_DEFAULT;
import static org.onap.sdc.workflow.api.RestConstants.SIZE_DEFAULT;
import static org.onap.sdc.workflow.api.RestConstants.SORT_FIELD_NAME;
import static org.onap.sdc.workflow.api.RestConstants.SORT_PARAM;
import static org.onap.sdc.workflow.api.RestConstants.USER_ID_HEADER_PARAM;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.amdocs.zusammen.datatypes.Id;
import com.amdocs.zusammen.datatypes.item.Item;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.RestPath;
import org.onap.sdc.workflow.api.exceptionshandlers.CustomizedResponseEntityExceptionHandler;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.onap.sdc.workflow.services.WorkflowManager;
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
    private static final String USER_ID_HEADER = "USER_ID";
    private static final String INVALID_PAGINATION_PARAMETER_FORMAT = "Requested %s: %s %s";
    private static final String PAGINATION_PARAMETER_INVALID_SORT_FIELD_SUFFIX =
            "is not supported. Supported values are: ";
    private static final String DEFAULT_SORT_VALUE = "name,asc";

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
        mockMvc.perform(get(RestPath.getWorkflowPath(workflowMock.getId())).header(USER_ID_HEADER_PARAM, USER_ID)
                                                                           .contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.id", is(workflowMock.getId())))
               .andExpect(jsonPath("$.name", is(workflowMock.getName())));
    }

    @Test
    public void shouldReturnErrorWhenMissingUserIdInListReqHeader() throws Exception {
        MockHttpServletResponse response =
                mockMvc.perform(get(RestPath.getWorkflowsPath()).contentType(APPLICATION_JSON)).andDo(print())
                       .andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn().getResponse();
        assertEquals(String.format(MISSING_REQUEST_HEADER_ERRROR_FORMAT, USER_ID_HEADER_PARAM),
                response.getContentAsString());
    }

    @Test
    public void shouldReturn5WorkflowWhen5WorkflowsExists() throws Exception {
        int numOfWorkflows = 5;
        List<Workflow> workflowMocks = createWorkflows(numOfWorkflows);
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        mockMvc.perform(
                get(RestPath.getWorkflowsPath()).header(USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(numOfWorkflows)));
    }

    @Test
    public void listWithValidVersionStateFilter() throws Exception {
        int numOfWorkflows = 3;
        List<Workflow> workflows = createWorkflows(numOfWorkflows);
        doReturn(workflows).when(workflowManagerMock)
                           .list(eq(Collections.singleton(WorkflowVersionState.CERTIFIED)), any());
        mockMvc.perform(
                get(RestPath.getWorkflowsWithVersionStateFilterPath("CERTIFIED")).header(USER_ID_HEADER_PARAM, USER_ID)
                                                                                 .contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.total", is(numOfWorkflows)))
               .andExpect(jsonPath("$.results", hasSize(numOfWorkflows)));
    }

    @Test
    public void listWithInvalidVersionStateFilter() throws Exception {
        mockMvc.perform(
                get(RestPath.getWorkflowsWithVersionStateFilterPath("hasdhf")).header(USER_ID_HEADER_PARAM, USER_ID)
                                                                              .contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.total", is(0)));
    }

    @Test
    public void shouldReturnSortedSizeOffsetAppliedWorkflows() throws Exception {
        List<Workflow> workflowMocks = createSize2AndOffset1For5WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        mockMvc.perform(get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "2", "1"))
                                .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(2)));
    }

    @Test
    public void shouldReturnResultsWithDefaultWhenSizeIsNegative() throws Exception {
        List<Workflow> workflowMocks = createSize2AndOffset1For5WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "-2", "1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                                                  .andDo(print()).andExpect(status().isOk()).andExpect(status().is(200))
                                                  .andReturn().getResponse();
        CollectionWrapper workflowListResponse =
                new ObjectMapper().readValue(response.getContentAsString(), CollectionWrapper.class);
        assertEquals(SIZE_DEFAULT, workflowListResponse.getSize());
        assertEquals(1, workflowListResponse.getPage());
        assertEquals(2, workflowListResponse.getTotal());
    }

    @Test
    public void shouldFallbackOnDefaultOffsetWhenOffsetIsNegative() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "2", "-1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                                                  .andDo(print()).andExpect(status().isOk()).andExpect(status().is(200))
                                                  .andReturn().getResponse();
        CollectionWrapper workflowListResponse =
                new ObjectMapper().readValue(response.getContentAsString(), CollectionWrapper.class);
        assertEquals(2, workflowListResponse.getSize());
        assertEquals(PAGE_DEFAULT, workflowListResponse.getPage());
        assertEquals(0, workflowListResponse.getTotal());
    }

    @Test
    public void shouldFallbackOnDefaultSizeWhenSizeIsNotAnInteger() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "abc", "0"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                                                  .andDo(print()).andExpect(status().isOk()).andExpect(status().is(200))
                                                  .andReturn().getResponse();
        CollectionWrapper workflowListResponse =
                new ObjectMapper().readValue(response.getContentAsString(), CollectionWrapper.class);
        assertEquals(SIZE_DEFAULT, workflowListResponse.getSize());
        assertEquals(0, workflowListResponse.getPage());
        assertEquals(0, workflowListResponse.getTotal());
    }

    @Test
    public void shouldFallbackOnDefaultOffsetWhenOffsetIsNotAnInteger() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "2", "abc"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                                                  .andDo(print()).andExpect(status().isOk()).andExpect(status().is(200))
                                                  .andReturn().getResponse();
        CollectionWrapper workflowListResponse =
                new ObjectMapper().readValue(response.getContentAsString(), CollectionWrapper.class);
        assertEquals(2, workflowListResponse.getSize());
        assertEquals(PAGE_DEFAULT, workflowListResponse.getPage());
        assertEquals(0, workflowListResponse.getTotal());
    }

    @Test
    public void shouldThrowExceptionWhenSortFieldIsInvalid() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams("invalidSortField,asc", "2", "1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                                                  .andDo(print()).andExpect(status().isBadRequest())
                                                  .andExpect(status().is(400)).andReturn().getResponse();
        assertEquals(String.format(INVALID_PAGINATION_PARAMETER_FORMAT, SORT_PARAM, "invalidSortField",
                PAGINATION_PARAMETER_INVALID_SORT_FIELD_SUFFIX + getSupportedSortFields()),
                response.getContentAsString());
    }

    @Test
    public void shouldReturnAscSortedSizeOffsetAppliedWorkflowsWhenSortIsNotSpecified() throws Exception {
        List<Workflow> workflowMocks = createSize2AndOffset1For5WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        mockMvc.perform(
                get(RestPath.getWorkflowsPathNoSort("2", "1")).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID)
                                                              .contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(2)));
    }

    @Test
    public void shouldReturnDefaultSizeOffsetAppliedWorkflowsWhenSizeIsNotSpecified() throws Exception {
        List<Workflow> workflowMocks = createSize2AndOffset1For5WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        mockMvc.perform(
                get(RestPath.getWorkflowsPathNoSortAndSize("1")).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID)
                                                                .contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(2)));
    }

    @Test
    public void shouldReturnDefaultOffsetAppliedWorkflowsWhenOffsetIsNotSpecified() throws Exception {
        List<Workflow> workflowMocks = createSize1WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any(), any());
        mockMvc.perform(
                get(RestPath.getWorkflowsPathNoSortAndOffset("1")).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID)
                                                                  .contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(1)));
    }

    @Test
    public void shouldCreateWorkflowWhenCallingPostRESTRequest() throws Exception {
        Item item = new Item();
        item.setId(new Id("abc"));
        Workflow reqWorkflow = createWorkflow(1, false);
        mockMvc.perform(
                post(RestPath.getWorkflowsPath()).header(USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON)
                                                 .content(GSON.toJson(reqWorkflow))).andDo(print())
               .andExpect(status().isCreated());
        verify(workflowManagerMock).create(reqWorkflow);
    }

    private List<Workflow> createWorkflows(int numOfWorkflows) {
        List<Workflow> workflowList = new ArrayList<>(numOfWorkflows);
        for (int i = 0; i < numOfWorkflows; i++) {
            workflowList.add(createWorkflow(i, true));
        }

        return workflowList;
    }

    private List<Workflow> createSize2AndOffset1For5WorkflowList() {
        List<Workflow> workflowList = new ArrayList<>();
        workflowList.add(createWorkflow(2, true));
        workflowList.add(createWorkflow(3, true));
        return workflowList;
    }

    private List<Workflow> createSize1WorkflowList() {
        List<Workflow> workflowList = new ArrayList<>();
        workflowList.add(createWorkflow(0, true));
        return workflowList;
    }


    private Set<String> getSupportedSortFields() {
        return ImmutableSet.of(SORT_FIELD_NAME);
    }

}