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

package org.onap.sdc.workflow.services.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.services.ActivitySpecConstant.ACTIVITY_SPEC_NOT_FOUND;
import static org.onap.sdc.workflow.services.ActivitySpecConstant.VERSION_ID_DEFAULT_VALUE;

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
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecAction;
import org.onap.sdc.workflow.persistence.ActivitySpecRepository;
import org.onap.sdc.workflow.persistence.types.ActivitySpecEntity;
import org.onap.sdc.workflow.persistence.types.ActivitySpecParameter;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.VersionStatusModificationException;
import org.onap.sdc.workflow.services.impl.mappers.ActivitySpecMapper;
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
    private ActivitySpecRepository activitySpecRepositoryMock;
    @Mock
    private UniqueValueService uniqueValueServiceMock;
    @Mock
    private ActivitySpecMapper activitySpecMapperMock;

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

        Item mappedItem = new Item();
        doReturn(mappedItem).when(activitySpecMapperMock).activitySpecToItem(activitySpecToCreate);
        doReturn(new Item()).when(itemManagerMock).create(mappedItem);

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
        Item item = new Item();
        item.setId(ID);
        doReturn(Collections.singletonList(item)).when(itemManagerMock).list(any());
        doReturn(new ActivitySpecEntity(ID, null)).when(activitySpecMapperMock).itemToActivitySpec(item);

        final Collection<ActivitySpecEntity> activitySpecs = activitySpecManager.list("Certified");
        Assert.assertEquals(1, activitySpecs.size());
        Assert.assertEquals(ID, activitySpecs.iterator().next().getId());
    }

    @Test
    public void testListInvalidFilter() {
        final Collection<ActivitySpecEntity> activitySpecs = activitySpecManager.list("invalid_status");
        Assert.assertEquals(0, activitySpecs.size());
    }

    @Test
    public void testListNoFilter() {
        final Collection<ActivitySpecEntity> activitySpecs = activitySpecManager.list(null);
        Assert.assertEquals(0, activitySpecs.size());
    }

    @Test
    public void testGet() {
        input = new ActivitySpecEntity();
        input.setId(ID);
        input.setVersion(version01);

        mockListVersions();
        doReturn(input).when(activitySpecRepositoryMock).get(any());
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
        doReturn(input).when(activitySpecRepositoryMock).get(any());
        Mockito.doThrow(new SdcRuntimeException(TEST_ERROR_MSG)).when(activitySpecRepositoryMock).get(any());
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
        activitySpecManager.actOnAction(new ActivitySpecEntity(ID, version01), ActivitySpecAction.DEPRECATE);
    }

    @Test(expected = VersionStatusModificationException.class)
    public void testInvalidDelete() {
        mockCertifiedVersion();
        activitySpecManager.actOnAction(new ActivitySpecEntity(ID, version01), ActivitySpecAction.DELETE);
    }

    private void mockCertifiedVersion() {
        Version version = new Version(version01.getId());
        version.setStatus(VersionStatus.Certified);
        doReturn(version).when(versionManagerMock).get(ID, version01);
    }

    @Test(expected = VersionStatusModificationException.class)
    public void testInvalidCertify() {
        mockCertifiedVersion();
        activitySpecManager.actOnAction(new ActivitySpecEntity(ID, version01), ActivitySpecAction.CERTIFY);
    }

    @Test
    public void testCertify() {
        Version retrievedVersion = new Version(version01.getId());
        retrievedVersion.setStatus(VersionStatus.Draft);
        doReturn(Collections.singletonList(retrievedVersion)).when(versionManagerMock).list(any());
        doReturn(retrievedVersion).when(versionManagerMock).get(any(), any());

        activitySpecManager.actOnAction(new ActivitySpecEntity(ID, version01), ActivitySpecAction.CERTIFY);

        verify(versionManagerMock).updateVersion(ID, retrievedVersion);
        verify(itemManagerMock).updateVersionStatus(ID, VersionStatus.Certified, VersionStatus.Draft);
        verify(versionManagerMock).publish(ID, retrievedVersion, "actionOnActivitySpec :CERTIFY");
    }

    @Test
    public void testGetVersionFailOnStatusChangeAction() {
        mockListVersions();
        Mockito.doThrow(new SdcRuntimeException(TEST_ERROR_MSG)).when(versionManagerMock).get(any(), any());
        try {
            activitySpecManager.actOnAction(new ActivitySpecEntity(ID, version01), ActivitySpecAction.CERTIFY);
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
        activitySpecManager.actOnAction(new ActivitySpecEntity(ID, new Version(VERSION_ID_DEFAULT_VALUE)), ActivitySpecAction.DEPRECATE);

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
        doReturn(activitySpec).when(activitySpecRepositoryMock).get(any());
        activitySpecManager.actOnAction(new ActivitySpecEntity(ID, new Version(VERSION_ID_DEFAULT_VALUE)), ActivitySpecAction.DELETE);

        verify(versionManagerMock).updateVersion(ID, version01);
        verify(itemManagerMock).updateVersionStatus(ID, VersionStatus.Deleted, VersionStatus.Deprecated);
        verify(versionManagerMock).publish(any(), any(), any());
    }
}
