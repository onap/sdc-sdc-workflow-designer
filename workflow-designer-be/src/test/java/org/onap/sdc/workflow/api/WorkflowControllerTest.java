package org.onap.sdc.workflow.api;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.collection.IsCollectionWithSize.hasSize;
import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.TestUtil.createWorkflow;
import static org.onap.sdc.workflow.api.RestConstants.LIMIT_PARAM;
import static org.onap.sdc.workflow.api.RestConstants.OFFSET_PARAM;
import static org.onap.sdc.workflow.api.RestConstants.SORT_FIELD_NAME;
import static org.onap.sdc.workflow.api.RestConstants.SORT_ORDER_ASC;
import static org.onap.sdc.workflow.api.RestConstants.SORT_ORDER_DESC;
import static org.onap.sdc.workflow.api.RestConstants.SORT_PARAM;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;

import java.util.ArrayList;
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
    private static final Gson GSON = new Gson();
    private static final String USER_ID_HEADER = "USER_ID";
    private static final String INVALID_PAGINATION_PARAMETER_FORMAT = "Requested %s: %s %s";
    private static final String PAGINATION_PARAMETER_POSITIVE_INTEGER_SUFFIX = "must be a positive integer";
    private static final String PAGINATION_PARAMETER_INVALID_SORT_SUFFIX = "must be of form <field_name>:<order>";
    private static final String PAGINATION_PARAMETER_INVALID_SORT_FIELD_SUFFIX =
            "is not supported. Supported values are: ";

    private MockMvc mockMvc;


    @InjectMocks
    private WorkflowControllerImpl workflowController;

    @Mock
    private WorkflowManager workflowManagerMock;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(workflowController)
                .setControllerAdvice(new CustomizedResponseEntityExceptionHandler())
                .build();
    }

    @Test
    public void shouldReturnErrorWhenMissingUserIdInGetReqHeader() throws Exception {
        Workflow workflowMock = createWorkflow(1, true);
        MockHttpServletResponse response =
                mockMvc.perform(get(RestPath.getWorkflowPath(workflowMock.getId())).contentType(APPLICATION_JSON))
                       .andDo(print()).andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn()
                       .getResponse();
        assertEquals(String.format(MISSING_REQUEST_HEADER_ERRROR_FORMAT, "USER_ID"), response.getContentAsString());
    }

    @Test
    public void shouldReturnWorkflowDataWhenRequestPathIsOk() throws Exception {
        Workflow workflowMock = createWorkflow(1, true);
        doReturn(workflowMock).when(workflowManagerMock).get(any(Workflow.class));
        mockMvc.perform(
                get(RestPath.getWorkflowPath(workflowMock.getId())).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID)
                                                                   .contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.id", is(workflowMock.getId())))
               .andExpect(jsonPath("$.name", is(workflowMock.getName())));
    }

    @Test
    public void shouldReturnErrorWhenMissingUserIdInListReqHeader() throws Exception {
        MockHttpServletResponse response =
                mockMvc.perform(get(RestPath.getWorkflowsPath()).contentType(APPLICATION_JSON)).andDo(print())
                       .andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn().getResponse();
        assertEquals(String.format(MISSING_REQUEST_HEADER_ERRROR_FORMAT, USER_ID_HEADER), response.getContentAsString());
    }

    @Test
    public void shouldReturn5WorkflowWhen5WorkflowsExists() throws Exception {
        int numOfWorkflows = 5;
        List<Workflow> workflowMocks = createWorkflows(numOfWorkflows);
        doReturn(workflowMocks).when(workflowManagerMock).list(any());
        mockMvc.perform(
                get(RestPath.getWorkflowsPath()).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(numOfWorkflows)));
    }

    @Test
    public void shouldReturnSortedLimitOffsetAppliedWorkflows() throws Exception {
        List<Workflow> workflowMocks = createLimit2AndOffset1For5WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any());
        mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams("name:asc", "2", "1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(2)));
    }

    @Test
    public void shouldThrowExceptionWhenLimitIsNegative() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams("name:asc", "-2", "1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn()
                .getResponse();
        assertEquals(String.format(INVALID_PAGINATION_PARAMETER_FORMAT, LIMIT_PARAM, "-2",
                PAGINATION_PARAMETER_POSITIVE_INTEGER_SUFFIX), response.getContentAsString());
    }

    @Test
    public void shouldThrowExceptionWhenOffsetIsNegative() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams("name:asc", "2", "-1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn()
                .getResponse();
        assertEquals(String.format(INVALID_PAGINATION_PARAMETER_FORMAT, OFFSET_PARAM, "-1",
                PAGINATION_PARAMETER_POSITIVE_INTEGER_SUFFIX), response.getContentAsString());
    }

    @Test
    public void shouldThrowExceptionWhenLimitIsNotAnInteger() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams("name:asc", "abc", "0"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn()
                .getResponse();
        assertEquals(String.format(INVALID_PAGINATION_PARAMETER_FORMAT, LIMIT_PARAM, "abc",
                PAGINATION_PARAMETER_POSITIVE_INTEGER_SUFFIX), response.getContentAsString());
    }

    @Test
    public void shouldThrowExceptionWhenOffsetIsNotAnInteger() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams("name:asc", "2", "abc"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn()
                .getResponse();
        assertEquals(String.format(INVALID_PAGINATION_PARAMETER_FORMAT, OFFSET_PARAM, "abc",
                PAGINATION_PARAMETER_POSITIVE_INTEGER_SUFFIX), response.getContentAsString());
    }

    @Test
    public void shouldThrowExceptionWhenSortParameterFormatIsInvalid() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams("invalidSortFormat", "2", "1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn()
                .getResponse();
        assertEquals(String.format(INVALID_PAGINATION_PARAMETER_FORMAT, SORT_PARAM, "invalidSortFormat",
                PAGINATION_PARAMETER_INVALID_SORT_SUFFIX), response.getContentAsString());
    }

    @Test
    public void shouldThrowExceptionWhenSortFieldIsInvalid() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams("invalidSortField:asc", "2", "1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn()
                .getResponse();
        assertEquals(String.format(INVALID_PAGINATION_PARAMETER_FORMAT, SORT_PARAM, "invalidSortField",
                PAGINATION_PARAMETER_INVALID_SORT_FIELD_SUFFIX + getSupportedSortFields()),
                response.getContentAsString());
    }

    @Test
    public void shouldThrowExceptionWhenSortOrderIsInvalid() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                get(RestPath.getWorkflowsPathAllQueryParams("name:invalidOrder", "2", "1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isBadRequest()).andExpect(status().is(400)).andReturn()
                .getResponse();
        assertEquals(String.format(INVALID_PAGINATION_PARAMETER_FORMAT, SORT_PARAM, "invalidOrder",
                PAGINATION_PARAMETER_INVALID_SORT_FIELD_SUFFIX + getSupportedSortOrders()),
                response.getContentAsString());
    }

    @Test
    public void shouldReturnAscSortedLimitOffsetAppliedWorkflowsWhenSortIsNotSpecified() throws Exception {
        List<Workflow> workflowMocks = createLimit2AndOffset1For5WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any());
        mockMvc.perform(
                get(RestPath.getWorkflowsPathNoSort("2", "1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(2)));
    }

    @Test
    public void shouldReturnDefaultLimitOffsetAppliedWorkflowsWhenLimitIsNotSpecified() throws Exception {
        List<Workflow> workflowMocks = createLimit2AndOffset1For5WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any());
        mockMvc.perform(
                get(RestPath.getWorkflowsPathNoSortAndLimit("1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(2)));
    }

    @Test
    public void shouldReturnDefaultOffsetAppliedWorkflowsWhenOffsetIsNotSpecified() throws Exception {
        List<Workflow> workflowMocks = createLimit1WorkflowList();
        doReturn(workflowMocks).when(workflowManagerMock).list(any());
        mockMvc.perform(
                get(RestPath.getWorkflowsPathNoSortAndOffset("1"))
                        .header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON))
                .andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.results", hasSize(1)));
    }

    @Test
    public void shouldCreateWorkflowWhenCallingPostRESTRequest() throws Exception {
        Item item = new Item();
        item.setId("abc");
        Workflow reqWorkflow = createWorkflow(1, false);
        mockMvc.perform(
                post(RestPath.getWorkflowsPath()).header(RestConstants.USER_ID_HEADER_PARAM, USER_ID).contentType(APPLICATION_JSON)
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

    private List<Workflow> createLimit2AndOffset1For5WorkflowList() {
        List<Workflow> workflowList = new ArrayList<>();
        workflowList.add(createWorkflow(2, true));
        workflowList.add(createWorkflow(3, true));
        return workflowList;
    }

    private List<Workflow> createLimit1WorkflowList() {
        List<Workflow> workflowList = new ArrayList<>();
        workflowList.add(createWorkflow(0, true));
        return workflowList;
    }


    private Set<String> getSupportedSortFields() {
        return ImmutableSet.of(SORT_FIELD_NAME);
    }

    private Set<String> getSupportedSortOrders() {
        return ImmutableSet.of(SORT_ORDER_ASC, SORT_ORDER_DESC);
    }

}