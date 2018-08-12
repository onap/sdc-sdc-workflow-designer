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

import static org.openecomp.core.zusammen.api.ZusammenUtil.buildStructuralElement;
import static org.openecomp.core.zusammen.api.ZusammenUtil.createSessionContext;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.SessionContext;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import com.amdocs.zusammen.datatypes.item.Info;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Objects;
import java.util.Optional;
import org.onap.sdc.workflow.persistence.ActivitySpecRepository;
import org.onap.sdc.workflow.persistence.impl.types.ActivitySpecData;
import org.onap.sdc.workflow.persistence.impl.types.ActivitySpecElementType;
import org.onap.sdc.workflow.persistence.types.ActivitySpecEntity;
import org.onap.sdc.workflow.services.ActivitySpecConstant;
import org.onap.sdc.workflow.services.utilities.JsonUtil;
import org.openecomp.core.zusammen.api.ZusammenAdaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ActivitySpecRepositoryImpl implements ActivitySpecRepository {

    private final ZusammenAdaptor zusammenAdaptor;

    @Autowired
    public ActivitySpecRepositoryImpl(ZusammenAdaptor zusammenAdaptor) {
        this.zusammenAdaptor = zusammenAdaptor;
    }

    @Override
    public void create(ActivitySpecEntity activitySpec) {
        SessionContext context = createSessionContext();
        ZusammenElement generalElement = mapActivityDetailsToZusammenElement(activitySpec, Action.CREATE);

        ElementContext elementContext = new ElementContext(activitySpec.getId(), activitySpec.getVersion().getId());
        zusammenAdaptor
                .saveElement(context, elementContext, generalElement, "Create Activity Spec General Info Element");
    }

    @Override
    public ActivitySpecEntity get(ActivitySpecEntity entity) {
        SessionContext context = createSessionContext();

        ElementContext elementContext = new ElementContext(entity.getId(), entity.getVersion().getId());
        Optional<Element> element =
                zusammenAdaptor.getElementByName(context, elementContext, null, ActivitySpecElementType.ACTIVITYSPEC.name());
        return element.map(this::mapZusammenElementToActivityDetails).orElse(null);
    }

    @Override
    public void update(ActivitySpecEntity entity) {
        SessionContext context = createSessionContext();
        ZusammenElement generalElement = mapActivityDetailsToZusammenElement(entity, Action.UPDATE);

        ElementContext elementContext = new ElementContext(entity.getId(), entity.getVersion().getId());
        zusammenAdaptor
                .saveElement(context, elementContext, generalElement, "Update Activity Spec General Info Element");
    }

    private ZusammenElement mapActivityDetailsToZusammenElement(ActivitySpecEntity entity, Action action) {
        ZusammenElement generalElement = buildStructuralElement(ActivitySpecElementType.ACTIVITYSPEC.name(), action);

        enrichElementInfoFromEntity(generalElement, entity);
        enrichElementDataFromEntity(generalElement, entity);
        return generalElement;
    }

    private void enrichElementInfoFromEntity(ZusammenElement element, ActivitySpecEntity entity) {
        element.getInfo().addProperty(InfoPropertyName.DESCRIPTION.getValue(), entity.getDescription());
        element.getInfo().addProperty(InfoPropertyName.NAME.getValue(), entity.getName());
        element.getInfo().addProperty(InfoPropertyName.CATEGORY.getValue(), entity.getCategoryList());
    }

    private void enrichElementDataFromEntity(ZusammenElement element, ActivitySpecEntity entity) {
        ActivitySpecData activitySpecData = new ActivitySpecData();
        activitySpecData.setInputs(entity.getInputs());
        activitySpecData.setOutputs(entity.getOutputs());
        activitySpecData.setType(entity.getType());
        activitySpecData.setContent(entity.getContent());
        element.setData(new ByteArrayInputStream(JsonUtil.object2Json(activitySpecData).getBytes()));
    }

    private ActivitySpecEntity mapZusammenElementToActivityDetails(Element element) {
        ActivitySpecEntity entity = new ActivitySpecEntity();
        entity.setId(element.getElementId().getValue());
        enrichEntityFromElementData(entity, element.getData());
        enrichEntityFromElementInfo(entity, element.getInfo());
        return entity;
    }

    private void enrichEntityFromElementData(ActivitySpecEntity entity, InputStream data) {
        ActivitySpecData activitySpecData = JsonUtil.json2Object(data, ActivitySpecData.class);
        if (Objects.nonNull(activitySpecData)) {
            entity.setInputs(activitySpecData.getInputs());
            entity.setOutputs(activitySpecData.getOutputs());
            entity.setType(activitySpecData.getType());
            entity.setContent(activitySpecData.getContent());
        }
    }

    private void enrichEntityFromElementInfo(ActivitySpecEntity entity, Info info) {
        entity.setName(info.getProperty(InfoPropertyName.NAME.getValue()));
        entity.setDescription(info.getProperty(InfoPropertyName.DESCRIPTION.getValue()));
        entity.setCategoryList(info.getProperty(InfoPropertyName.CATEGORY.getValue()));
    }

    public enum InfoPropertyName {
        DESCRIPTION("description"), NAME("name"), CATEGORY(ActivitySpecConstant.CATEGORY_ATTRIBUTE_NAME);

        private final String value;

        InfoPropertyName(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

}
