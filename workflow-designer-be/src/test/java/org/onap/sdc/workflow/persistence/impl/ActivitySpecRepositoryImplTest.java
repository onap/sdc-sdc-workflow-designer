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

package org.onap.sdc.workflow.persistence.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.onap.sdc.common.zusammen.services.ZusammenElementUtil.ELEMENT_TYPE_PROPERTY;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ElementInfo;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.Id;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import com.amdocs.zusammen.datatypes.item.Info;
import com.amdocs.zusammen.datatypes.item.ItemVersion;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.common.versioning.persistence.zusammen.ZusammenSessionContextCreator;
import org.onap.sdc.common.zusammen.services.ZusammenAdaptor;
import org.onap.sdc.workflow.persistence.impl.ActivitySpecRepositoryImpl.InfoPropertyName;
import org.onap.sdc.workflow.persistence.impl.types.ActivitySpecData;
import org.onap.sdc.workflow.persistence.impl.types.ActivitySpecElementType;
import org.onap.sdc.workflow.persistence.types.ActivitySpecEntity;
import org.onap.sdc.workflow.persistence.types.ActivitySpecParameter;
import org.onap.sdc.workflow.services.utilities.JsonUtil;

@RunWith(MockitoJUnitRunner.class)
public class ActivitySpecRepositoryImplTest {

    private static final String versionId = "1234";
    private static final String itemId = "5678";

    @Mock
    private ZusammenAdaptor zusammenAdaptor;
    @Mock
    private ZusammenSessionContextCreator contextCreator;
    @InjectMocks
    private ActivitySpecRepositoryImpl daoImpl;

    private ActivitySpecEntity entity;
    private final Map<String, Element> elementMap = new HashMap<>();
    private String elementId;

    @Before
    public void setUp() {
        daoImpl = new ActivitySpecRepositoryImpl(zusammenAdaptor, contextCreator);
        entity = new ActivitySpecEntity();
        entity = new ActivitySpecEntity();

        entity.setId(itemId);
        entity.setVersionId(versionId);
        entity.setName("activitySpec");
        List<String> categoryList = new ArrayList<>();
        categoryList.add("category1");
        entity.setCategoryList(categoryList);
        ActivitySpecParameter inputParams = new ActivitySpecParameter("dbhost", "String", null);
        inputParams.setValue("localhost");
        List<ActivitySpecParameter> inputs = new ArrayList<>();
        inputs.add(inputParams);
        entity.setInputs(inputs);


        mockZusammenAdapter();
    }

    @Test
    public void testCreate() {
        ItemVersion itemVersionmock = new ItemVersion();
        itemVersionmock.setId(new Id());

        daoImpl.create(entity);
        ElementContext elementContext = new ElementContext(entity.getId(), entity.getVersionId());
        Optional<ElementInfo> testElementInfo = zusammenAdaptor
                                                        .getElementInfoByName(contextCreator.create(), elementContext,
                                                                Id.ZERO, ActivitySpecElementType.ACTIVITYSPEC.name());
        Assert.assertTrue(testElementInfo.isPresent());
        Assert.assertEquals(testElementInfo.get().getInfo().getName(), ActivitySpecElementType.ACTIVITYSPEC.name());
        Assert.assertEquals(testElementInfo.get().getInfo()
                                    .getProperty(ActivitySpecRepositoryImpl.InfoPropertyName.DESCRIPTION.getValue()),
                entity.getDescription());
        Assert.assertEquals(testElementInfo.get().getInfo().getProperty(InfoPropertyName.CATEGORY.getValue()),
                entity.getCategoryList());
        Assert.assertEquals(testElementInfo.get().getInfo()
                                    .getProperty(ActivitySpecRepositoryImpl.InfoPropertyName.NAME.getValue()),
                entity.getName());

        final Optional<Element> testElement =
                zusammenAdaptor.getElement(contextCreator.create(), elementContext, new Id(elementId));
        final InputStream data = testElement.get().getData();
        final ActivitySpecData activitySpecData = JsonUtil.json2Object(data, ActivitySpecData.class);
        Assert.assertEquals(activitySpecData.getInputs().get(0).getName(), entity.getInputs().get(0).getName());
    }

    @Test
    public void testGet() {
        final ActivitySpecEntity retrieved = daoImpl.get(entity);
        Assert.assertEquals(retrieved.getName(), entity.getName());
        Assert.assertEquals(retrieved.getDescription(), entity.getDescription());
        Assert.assertEquals(retrieved.getCategoryList(), entity.getCategoryList());
    }

    @Test
    public void testUpdate() {
        entity.setDescription("Update AS version1");
        daoImpl.update(entity);
        final ActivitySpecEntity retrieved = daoImpl.get(entity);
        Assert.assertEquals(retrieved.getName(), entity.getName());
        Assert.assertEquals(retrieved.getDescription(), entity.getDescription());
        Assert.assertEquals(retrieved.getCategoryList(), entity.getCategoryList());
    }


    private void mockZusammenAdapter() {

        doAnswer(invocationOnMock -> {
            Id elementId = invocationOnMock.getArgument(2);
            return Optional.of(elementMap.get(elementId.getValue()));
        }).when(zusammenAdaptor).getElement(any(), any(), any());

        doAnswer(invocationOnMock -> {
            ZusammenElement element = new ZusammenElement();
            Info info = new Info();
            element.setElementId(Id.ZERO);
            info.addProperty("name", entity.getName());
            info.addProperty("description", entity.getDescription());
            info.addProperty("category", entity.getCategoryList());
            element.setInfo(info);
            return Optional.of(element);
        }).when(zusammenAdaptor).getElementByName(any(), any(), any(), any());

        doAnswer(invocationOnMock -> {
            String elementName = invocationOnMock.getArgument(3);
            return elementMap.values().stream()
                           .filter(element -> elementName.equals(element.getInfo().getProperty(ELEMENT_TYPE_PROPERTY)))
                           .map(element -> {
                               ElementInfo elementInfo = new ElementInfo();
                               elementInfo.setId(element.getElementId());
                               elementInfo.setInfo(element.getInfo());
                               return elementInfo;
                           }).findAny();
        }).when(zusammenAdaptor).getElementInfoByName(any(), any(), any(), any());

        doAnswer(invocationOnMock -> {
            ZusammenElement element = invocationOnMock.getArgument(2);
            if (element.getAction().equals(Action.CREATE) || element.getAction().equals(Action.UPDATE)) {
                element.setElementId(new Id(UUID.randomUUID().toString()));
            }
            elementMap.put(element.getElementId().getValue(), element);
            elementId = element.getElementId().getValue();
            return element;
        }).when(zusammenAdaptor).saveElement(any(), any(), any(), any());
    }
}
