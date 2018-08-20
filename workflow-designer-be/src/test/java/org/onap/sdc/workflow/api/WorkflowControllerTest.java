package org.onap.sdc.workflow.api;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.collection.IsCollectionWithSize.hasSize;
import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
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
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.RestPath;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.types.Page;
import org.onap.sdc.workflow.services.types.PagingRequest;
import org.onap.sdc.workflow.services.types.RequestSpec;
import org.onap.sdc.workflow.services.types.Sort;
import org.onap.sdc.workflow.services.types.Workflow;
import org.onap.sdc.workflow.services.utilities.JsonUtil;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@RunWith(MockitoJUnitRunner.class)
public class WorkflowControllerTest {

    private static final String USER_ID = "userId";
    private static final String MISSING_USER_HEADER_ERROR =
            "Missing request header 'USER_ID' for method parameter of type String";
    private static final String DEFAULT_SORT_VALUE = "name:asc";

    private MockMvc mockMvc;

    @Mock
    private WorkflowManager workflowManagerMock;
    @Captor
    private ArgumentCaptor<RequestSpec> requestSpecArg;
    @InjectMocks
    private WorkflowController workflowController;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(workflowController)
                                 .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                                 .setControllerAdvice(new ExceptionsHandler()).build();
    }

    @Test
    public void shouldReturnErrorWhenMissingUserIdInGetReqHeader() throws Exception {
        Workflow workflowMock = createWorkflow(1, true);
        mockMvc.perform(get(RestPath.getWorkflowPath(workflowMock.getId())).contentType(APPLICATION_JSON))
               .andDo(print()).andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.message", is(MISSING_USER_HEADER_ERROR)));
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
        mockMvc.perform(get(RestPath.getWorkflowsPath()).contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message", is(MISSING_USER_HEADER_ERROR)));
    }

    @Test
    public void listWhenExist() throws Exception {
        mockManagerList3();
        ResultActions result = mockMvc.perform(
                get(RestPath.getWorkflowsPath()).header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON))
                                      .andDo(print()).andExpect(status().isOk())
                                      .andExpect(jsonPath("$.items", hasSize(3)));
        for (int i = 0; i < 3; i++) {
            result.andExpect(jsonPath(String.format("$.items[%s].id", i), is(String.valueOf(i + 1))));
        }

        verify(workflowManagerMock).list(any(), requestSpecArg.capture());
        assertRequestSpec(requestSpecArg.getValue(), DEFAULT_OFFSET, DEFAULT_LIMIT, Collections.emptyList());
    }

    @Test
    public void listWhenPagingAndSortingAreSet() throws Exception {
        mockManagerList3();
        mockMvc.perform(get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "2", "1"))
                                .header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(3)));
        verify(workflowManagerMock).list(any(), requestSpecArg.capture());
        assertRequestSpec(requestSpecArg.getValue(), 1, 2, Collections.singletonList(new Sort("name", true)));
    }

    @Test
    public void shouldReturnResultsWithDefaultWhenLimitIsNegative() throws Exception {
        mockManagerList3();
        mockMvc.perform(get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "-2", "1"))
                                .header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(3)));
        verify(workflowManagerMock).list(any(), requestSpecArg.capture());
        assertRequestSpec(requestSpecArg.getValue(), 1, DEFAULT_LIMIT,
                Collections.singletonList(new Sort("name", true)));
    }

    @Test
    public void shouldFallbackOnDefaultOffsetWhenOffsetIsNegative() throws Exception {
        mockManagerList3();
        mockMvc.perform(get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "2", "-1"))
                                .header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(3)));
        verify(workflowManagerMock).list(any(), requestSpecArg.capture());
        assertRequestSpec(requestSpecArg.getValue(), DEFAULT_OFFSET, 2,
                Collections.singletonList(new Sort("name", true)));
    }

    @Test
    public void shouldFallbackOnDefaultLimitWhenLimitIsNotAnInteger() throws Exception {
        mockManagerList3();
        mockMvc.perform(get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "abc", "0"))
                                .header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(3)));
        verify(workflowManagerMock).list(any(), requestSpecArg.capture());
        assertRequestSpec(requestSpecArg.getValue(), 0, DEFAULT_LIMIT,
                Collections.singletonList(new Sort("name", true)));
    }

    @Test
    public void shouldFallbackOnDefaultOffsetWhenOffsetIsNotAnInteger() throws Exception {
        mockManagerList3();
        mockMvc.perform(get(RestPath.getWorkflowsPathAllQueryParams(DEFAULT_SORT_VALUE, "2", "abc"))
                                .header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(jsonPath("$.items", hasSize(3)));
        verify(workflowManagerMock).list(any(), requestSpecArg.capture());
        assertRequestSpec(requestSpecArg.getValue(), DEFAULT_OFFSET, 2,
                Collections.singletonList(new Sort("name", true)));
    }

    @Test
    public void shouldReturnDefaultLimitOffsetAppliedWorkflowsWhenLimitIsNotSpecified() throws Exception {
        mockManagerList3();
        mockMvc.perform(get(RestPath.getWorkflowsPathNoSortAndLimit("1")).header(USER_ID_HEADER, USER_ID)
                                                                         .contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(jsonPath("$.items", hasSize(3)));
        verify(workflowManagerMock).list(any(), requestSpecArg.capture());
        assertRequestSpec(requestSpecArg.getValue(), 1, DEFAULT_LIMIT, Collections.emptyList());
    }

    @Test
    public void shouldReturnDefaultOffsetAppliedWorkflowsWhenOffsetIsNotSpecified() throws Exception {
        mockManagerList3();
        mockMvc.perform(get(RestPath.getWorkflowsPathNoSortAndOffset("1")).header(USER_ID_HEADER, USER_ID)
                                                                          .contentType(APPLICATION_JSON)).andDo(print())
               .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(3)));
        verify(workflowManagerMock).list(any(), requestSpecArg.capture());
        assertRequestSpec(requestSpecArg.getValue(), DEFAULT_OFFSET, 1, Collections.emptyList());
    }

    @Test
    public void shouldCreateWorkflowWhenCallingPostRESTRequest() throws Exception {
        Item item = new Item();
        item.setId(new Id("abc"));
        Workflow reqWorkflow = createWorkflow(1, false);
        mockMvc.perform(post(RestPath.getWorkflowsPath()).header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)
                                .content(JsonUtil.object2Json(reqWorkflow))).andDo(print())
                .andExpect(status().isCreated());
        verify(workflowManagerMock).create(reqWorkflow);
    }

    @Test
    public void shouldThrowExceptionWhenWorkflowNameInvalid() throws Exception {
        Workflow reqWorkflow = new Workflow();
        reqWorkflow.setName("Invalid workflow name %");
        mockMvc.perform(post(RestPath.getWorkflowsPath()).header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)
                                .content(JsonUtil.object2Json(reqWorkflow))).andDo(print())
                .andExpect(status().isBadRequest()).andExpect(
                jsonPath("$.message", is("Workflow name must contain only letters, digits and underscores")));
    }

    @Test
    public void shouldThrowExceptionWhenWorkflowNameBlank() throws Exception {
        Workflow reqWorkflow = new Workflow();
        reqWorkflow.setName("  ");
        mockMvc.perform(post(RestPath.getWorkflowsPath()).header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)
                                                         .content(JsonUtil.object2Json(reqWorkflow))).andDo(print())
               .andExpect(status().isBadRequest());
    }

    @Test
    public void shouldThrowExceptionWhenWorkflowNameNull() throws Exception {
        Workflow reqWorkflow = new Workflow();
        reqWorkflow.setName(null);
        mockMvc.perform(post(RestPath.getWorkflowsPath()).header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)
                                                         .content(JsonUtil.object2Json(reqWorkflow))).andDo(print())
               .andExpect(status().isBadRequest());
    }

    @Test
    public void shouldThrowExceptionWhenWorkflowNameEmptyString() throws Exception {
        Workflow reqWorkflow = new Workflow();
        reqWorkflow.setName("");
        mockMvc.perform(post(RestPath.getWorkflowsPath()).header(USER_ID_HEADER, USER_ID).contentType(APPLICATION_JSON)
                                                         .content(JsonUtil.object2Json(reqWorkflow))).andDo(print())
               .andExpect(status().isBadRequest());
    }

    private void mockManagerList3() {
        doReturn(new Page<>(Arrays.asList(createWorkflow(1, true), createWorkflow(2, true), createWorkflow(3, true)),
                new PagingRequest(DEFAULT_OFFSET, DEFAULT_LIMIT), 3)).when(workflowManagerMock).list(any(), any());
    }

    private static void assertRequestSpec(RequestSpec actual, int expectedOffset, int expectedLimit,
            List<Sort> expectedSorts) {
        assertEquals(Integer.valueOf(expectedOffset), actual.getPaging().getOffset());
        assertEquals(Integer.valueOf(expectedLimit), actual.getPaging().getLimit());
        if (expectedSorts.isEmpty()) {
            assertEquals(expectedSorts, actual.getSorting().getSorts());
        } else {
            for (int i = 0; i < expectedSorts.size(); i++) {
                assertEquals(expectedSorts.get(i), actual.getSorting().getSorts().get(i));
            }
        }
    }
}