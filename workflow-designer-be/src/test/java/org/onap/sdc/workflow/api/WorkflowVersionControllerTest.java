/*-
 * ============LICENSE_START=======================================================
 * SDC
 * ================================================================================
 * Copyright (C) 2019 AT&T Intellectual Property. All rights reserved.
 * ================================================================================
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
 * ============LICENSE_END=========================================================
 */

package org.onap.sdc.workflow.api;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.doReturn;
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
import org.onap.sdc.workflow.api.mappers.WorkflowVersionDtoMapper;
import org.onap.sdc.workflow.api.types.Parameter;
import org.onap.sdc.workflow.api.types.WorkflowVersionRequest;
import org.onap.sdc.workflow.api.types.WorkflowVersionResponse;
import org.onap.sdc.workflow.persistence.types.ParameterType;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.onap.sdc.workflow.services.types.WorkflowVersion;
import org.onap.sdc.workflow.services.utilities.JsonUtil;
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
    @Mock
    private WorkflowVersionDtoMapper versionDtoMapperMock;
    @InjectMocks
    private WorkflowVersionController workflowVersionController;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(workflowVersionController).build();
    }

    @Test
    public void shouldReturnWorkflowVersionListWhenCallingVersionGetREST() throws Exception {
        WorkflowVersion version1 = new WorkflowVersion(VERSION1_ID);
        WorkflowVersion version2 = new WorkflowVersion(VERSION2_ID);
        doReturn(Arrays.asList(version1, version2)).when(workflowVersionManagerMock).list(ITEM1_ID, null);

        WorkflowVersionResponse response1 = new WorkflowVersionResponse();
        response1.setId(VERSION1_ID);
        doReturn(response1).when(versionDtoMapperMock).workflowVersionToResponse(version1);
        WorkflowVersionResponse response2 = new WorkflowVersionResponse();
        response2.setId(VERSION2_ID);
        doReturn(response2).when(versionDtoMapperMock).workflowVersionToResponse(version2);

        mockMvc.perform(get(RestPath.getWorkflowVersions(ITEM1_ID)).header(RestParams.USER_ID_HEADER, USER_ID)
                                .contentType(APPLICATION_JSON)).andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(2))).andExpect(jsonPath("$.items[0].id", is(VERSION1_ID)))
                .andExpect(jsonPath("$.items[1].id", is(VERSION2_ID)));

        verify(workflowVersionManagerMock).list(ITEM1_ID, null);
    }

    @Test
    public void shouldCreateWorkflowVersionWhenCallingVersionsPostREST() throws Exception {

        WorkflowVersionRequest request = new WorkflowVersionRequest();
        request.setDescription("Updated");
        WorkflowVersion version = new WorkflowVersion();
        version.setDescription("Updated");
        doReturn(version).when(versionDtoMapperMock).requestToWorkflowVersion(request);

        mockMvc.perform(post(RestPath.getWorkflowVersions(ITEM1_ID)).header(RestParams.USER_ID_HEADER, USER_ID)
                                .contentType(APPLICATION_JSON).content(JsonUtil.object2Json(request)))
                .andExpect(status().isCreated());

        verify(workflowVersionManagerMock).create(ITEM1_ID, null, version);
    }

    @Test
    public void shouldFailCreateWorkflowVersionWhenCallingVersionsPostRESTWithDuplicateInput() throws Exception {

        WorkflowVersionRequest version = new WorkflowVersionRequest();
        Collection<Parameter> inputs = Arrays.asList(createParameter("name1"), createParameter("name1"));
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
        WorkflowVersionResponse response = new WorkflowVersionResponse();
        response.setId(VERSION1_ID);
        doReturn(response).when(versionDtoMapperMock).workflowVersionToResponse(version);

        mockMvc.perform(
                get(RestPath.getWorkflowVersion(ITEM1_ID, VERSION1_ID)).header(RestParams.USER_ID_HEADER, USER_ID)
                        .contentType(APPLICATION_JSON)).andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(VERSION1_ID)));
        verify(workflowVersionManagerMock).get(ITEM1_ID, VERSION1_ID);
    }

    @Test
    public void shouldUpdateWorkflowVersionWhenCallingPutREST() throws Exception {
        WorkflowVersionRequest request = new WorkflowVersionRequest();
        request.setDescription("Updated");
        WorkflowVersion version = new WorkflowVersion();
        version.setDescription("Updated");
        doReturn(version).when(versionDtoMapperMock).requestToWorkflowVersion(request);

        MockHttpServletResponse result = mockMvc.perform(
                put(RestPath.getWorkflowVersion(ITEM1_ID, VERSION1_ID)).header(RestParams.USER_ID_HEADER, USER_ID)
                        .contentType(APPLICATION_JSON).content(JsonUtil.object2Json(request))).andReturn()
                                                 .getResponse();

        assertEquals(HttpStatus.OK.value(), result.getStatus());

        verify(workflowVersionManagerMock).update(ITEM1_ID, version);
    }

    private Parameter createParameter(String name) {
        Parameter parameter = new Parameter();
        parameter.setName(name);
        parameter.setMandatory(false);
        parameter.setType(ParameterType.STRING);
        return parameter;
    }
}
