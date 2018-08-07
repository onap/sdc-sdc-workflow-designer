/*
 * Copyright © 2016-2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflow.activityspec.be.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.activityspec.utils.ActivitySpecConstant.ACTIVITY_SPEC_NOT_FOUND;
import static org.onap.sdc.workflow.activityspec.utils.ActivitySpecConstant.VERSION_ID_DEFAULT_VALUE;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.onap.sdc.workflow.activityspec.api.rest.types.ActivitySpecAction;
import org.onap.sdc.workflow.activityspec.be.dao.ActivitySpecDao;
import org.onap.sdc.workflow.activityspec.be.dao.types.ActivitySpecEntity;
import org.onap.sdc.workflow.activityspec.be.datatypes.ActivitySpecParameter;
import org.onap.sdc.workflow.activityspec.errors.VersionStatusModificationException;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.openecomp.sdc.common.errors.SdcRuntimeException;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
import org.openecomp.sdc.versioning.types.Item;

public class ActivitySpecManagerImplTest {

    private static final String STRING_TYPE = "String";
    private static final String TEST_ERROR_MSG = "Test Error";
    private static final String ID = "ID1";
    private Version version01 = new Version("12345");
    private ActivitySpecEntity input;

    @Spy
    @InjectMocks
    private ActivitySpecManagerImpl activitySpecManager;
    @Mock
    private ItemManager itemManagerMock;
    @Mock
    private VersioningManager versionManagerMock;
    @Mock
    private ActivitySpecDao activitySpecDaoMock;
    @Mock
    private UniqueValueService uniqueValueServiceMock;

    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @After
    public void tearDown() {
        activitySpecManager = null;
    }

    @Test
    public void testCreate() {
        ActivitySpecEntity activitySpecToCreate = new ActivitySpecEntity();
        activitySpecToCreate.setName("startserver");
        activitySpecToCreate.setDescription("start the server");
        activitySpecToCreate.setVersion(version01);

        List<String> categoryList = new ArrayList<>();
        categoryList.add("category1");
        categoryList.add("category2");
        activitySpecToCreate.setCategoryList(categoryList);

        ActivitySpecParameter inputParams = new ActivitySpecParameter("dbhost", STRING_TYPE);
        inputParams.setValue("localhost");
        ActivitySpecParameter inputParams1 = new ActivitySpecParameter("dbname", STRING_TYPE);
        inputParams.setValue("prod");
        List<ActivitySpecParameter> inputs = new ArrayList<>();
        inputs.add(inputParams);
        inputs.add(inputParams1);
        activitySpecToCreate.setInputs(inputs);

        ActivitySpecParameter outputParams = new ActivitySpecParameter("status", STRING_TYPE);
        outputParams.setValue("started");
        List<ActivitySpecParameter> outputs = new ArrayList<>();
        outputs.add(outputParams);
        activitySpecToCreate.setOutputs(outputs);

        activitySpecToCreate.setId("ID1");
        activitySpecToCreate.setVersion(version01);

        Item item = new Item();
        doReturn(item).when(itemManagerMock).create(any());

        ActivitySpecEntity activitySpec = activitySpecManager.createActivitySpec(activitySpecToCreate);

        Assert.assertNotNull(activitySpec);
        activitySpec.setId("ID1");
        activitySpec.setStatus(VersionStatus.Draft.name());
        assertActivitySpecEquals(activitySpec, activitySpecToCreate);
    }

    private void assertActivitySpecEquals(ActivitySpecEntity actual, ActivitySpecEntity expected) {
        Assert.assertEquals(actual.getId(), expected.getId());
        Assert.assertEquals(actual.getName(), expected.getName());
        Assert.assertEquals(actual.getDescription(), expected.getDescription());
        Assert.assertEquals(actual.getCategoryList(), expected.getCategoryList());
        Assert.assertEquals(actual.getInputs(), expected.getInputs());
        Assert.assertEquals(actual.getOutputs(), expected.getOutputs());
    }

    @Test
    public void testList() {
        ActivitySpecEntity activitySpec = new ActivitySpecEntity();
        activitySpec.setName("stopServer");
        doReturn(Collections.singletonList(activitySpec)).when(itemManagerMock).list(any());
        final Collection<Item> activitySpecs = activitySpecManager.list("Certified");
        Assert.assertEquals(1, activitySpecs.size());
    }

    @Test
    public void testListInvalidFilter() {
        final Collection<Item> activitySpecs = activitySpecManager.list("invalid_status");
        Assert.assertEquals(0, activitySpecs.size());
    }

    @Test
    public void testListNoFilter() {
        final Collection<Item> activitySpecs = activitySpecManager.list(null);
        Assert.assertEquals(0, activitySpecs.size());
    }

    @Test
    public void testGet() {
        input = new ActivitySpecEntity();
        input.setId(ID);
        input.setVersion(version01);

        mockListVersions();
        doReturn(input).when(activitySpecDaoMock).get(any());
        version01.setStatus(VersionStatus.Draft);
        doReturn(version01).when(versionManagerMock).get(any(), any());
        ActivitySpecEntity retrieved = activitySpecManager.get(input);
        assertActivitySpecEquals(retrieved, input);
        Assert.assertEquals(retrieved.getStatus(), VersionStatus.Draft.name());


        input.setVersion(new Version(VERSION_ID_DEFAULT_VALUE));
        retrieved = activitySpecManager.get(input);
        assertActivitySpecEquals(retrieved, input);
        Assert.assertEquals(retrieved.getStatus(), VersionStatus.Draft.name());
    }

    private void mockListVersions() {
        doReturn(Collections.singletonList(version01)).when(versionManagerMock).list(any());
    }

    @Test
    public void testGetActivitySpecDaoFail() {
        input = new ActivitySpecEntity();
        input.setId(ID);
        input.setVersion(version01);
        mockListVersions();
        doReturn(input).when(activitySpecDaoMock).get(any());
        Mockito.doThrow(new SdcRuntimeException(TEST_ERROR_MSG)).when(activitySpecDaoMock).get(any());
        try {
            activitySpecManager.get(input);
            Assert.fail();
        } catch (EntityNotFoundException exception) {
            Assert.assertEquals(ACTIVITY_SPEC_NOT_FOUND, exception.getMessage());
        }
    }

    @Test
    public void testListVersionFail() {
        input = new ActivitySpecEntity();
        input.setId(ID);
        input.setVersion(version01);
        input.getVersion().setId(VERSION_ID_DEFAULT_VALUE);
        Mockito.doThrow(new SdcRuntimeException(TEST_ERROR_MSG)).when(versionManagerMock).list(any());
        try {
            activitySpecManager.get(input);
            Assert.fail();
        } catch (EntityNotFoundException exception) {
            Assert.assertEquals(ACTIVITY_SPEC_NOT_FOUND, exception.getMessage());
        }
    }

    @Test(expected = VersionStatusModificationException.class)
    public void testInvalidDeprecate() {
        Version version = new Version(version01.getId());
        version.setStatus(VersionStatus.Draft);
        doReturn(version).when(versionManagerMock).get(ID, version01);
        activitySpecManager.actOnAction(ID, version01.getId(), ActivitySpecAction.DEPRECATE);
    }

    @Test(expected = VersionStatusModificationException.class)
    public void testInvalidDelete() {
        mockCertifiedVersion();
        activitySpecManager.actOnAction(ID, version01.getId(), ActivitySpecAction.DELETE);
    }

    private void mockCertifiedVersion() {
        Version version = new Version(version01.getId());
        version.setStatus(VersionStatus.Certified);
        doReturn(version).when(versionManagerMock).get(ID, version01);
    }

    @Test(expected = VersionStatusModificationException.class)
    public void testInvalidCertify() {
        mockCertifiedVersion();
        activitySpecManager.actOnAction(ID, version01.getId(), ActivitySpecAction.CERTIFY);
    }

    @Test
    public void testCertify() {
        mockListVersions();
        version01.setStatus(VersionStatus.Draft);
        doReturn(version01).when(versionManagerMock).get(any(), any());
        activitySpecManager.actOnAction(ID, version01.getId(), ActivitySpecAction.CERTIFY);

        verify(versionManagerMock).updateVersion(ID, version01);
        verify(itemManagerMock).updateVersionStatus(ID, VersionStatus.Certified, VersionStatus.Draft);
        verify(versionManagerMock).publish(any(), any(), any());
    }

    @Test
    public void testGetVersionFailOnStatusChangeAction() {
        mockListVersions();
        Mockito.doThrow(new SdcRuntimeException(TEST_ERROR_MSG)).when(versionManagerMock).get(any(), any());
        try {
            activitySpecManager.actOnAction(ID, version01.getId(), ActivitySpecAction.CERTIFY);
            Assert.fail();
        } catch (EntityNotFoundException exception) {
            Assert.assertEquals(ACTIVITY_SPEC_NOT_FOUND, exception.getMessage());
        }
    }

    @Test
    public void testDeprecate() {
        version01.setStatus(VersionStatus.Certified);
        Version retrivedVersion = new Version("12");
        retrivedVersion.setStatus(VersionStatus.Certified);
        mockListVersions();
        doReturn(retrivedVersion).when(versionManagerMock).get(any(), any());
        activitySpecManager.actOnAction(ID, VERSION_ID_DEFAULT_VALUE, ActivitySpecAction.DEPRECATE);

        verify(versionManagerMock).updateVersion(ID, retrivedVersion);
        verify(itemManagerMock).updateVersionStatus(ID, VersionStatus.Deprecated, VersionStatus.Certified);
        verify(versionManagerMock).publish(any(), any(), any());
    }

    @Test
    public void testDelete() {
        ActivitySpecEntity activitySpec = new ActivitySpecEntity();
        version01.setStatus(VersionStatus.Deprecated);
        activitySpec.setName("stopServer");
        activitySpec.setVersion(version01);

        Version retrivedVersion = new Version("12");
        retrivedVersion.setStatus(VersionStatus.Deprecated);

        mockListVersions();
        doReturn(retrivedVersion).when(versionManagerMock).get(any(), any());
        doReturn(activitySpec).when(activitySpecDaoMock).get(any());
        activitySpecManager.actOnAction(ID, VERSION_ID_DEFAULT_VALUE, ActivitySpecAction.DELETE);

        verify(versionManagerMock).updateVersion(ID, version01);
        verify(itemManagerMock).updateVersionStatus(ID, VersionStatus.Deleted, VersionStatus.Deprecated);
        verify(versionManagerMock).publish(any(), any(), any());
    }
}
