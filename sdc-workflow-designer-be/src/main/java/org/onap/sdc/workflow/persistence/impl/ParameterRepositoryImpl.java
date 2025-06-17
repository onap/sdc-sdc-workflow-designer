/*
 * Copyright © 2018 European Support Limited
 *
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
 */

package org.onap.sdc.workflow.persistence.impl;

import static org.onap.sdc.common.zusammen.services.ZusammenElementUtil.ELEMENT_TYPE_PROPERTY;
import static org.onap.sdc.common.zusammen.services.ZusammenElementUtil.buildElement;
import static org.onap.sdc.common.zusammen.services.ZusammenElementUtil.buildStructuralElement;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ElementInfo;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.Id;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import com.amdocs.zusammen.datatypes.item.Info;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;
import org.onap.sdc.common.versioning.persistence.zusammen.ZusammenSessionContextCreator;
import org.onap.sdc.common.zusammen.services.ZusammenAdaptor;
import org.onap.sdc.workflow.persistence.ParameterRepository;
import org.onap.sdc.workflow.persistence.impl.types.ParameterPropertyName;
import org.onap.sdc.workflow.persistence.impl.types.WorkflowElementType;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterRole;
import org.onap.sdc.workflow.persistence.types.ParameterType;
import org.springframework.stereotype.Repository;

@Repository
public class ParameterRepositoryImpl implements ParameterRepository {

    private final ZusammenAdaptor zusammenAdaptor;
    private final ZusammenSessionContextCreator contextCreator;

    public ParameterRepositoryImpl(ZusammenAdaptor zusammenAdaptor, ZusammenSessionContextCreator contextCreator) {
        this.zusammenAdaptor = zusammenAdaptor;
        this.contextCreator = contextCreator;
    }

    @Override
    public void createStructure(String id, String versionId) {
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement inputsElement = buildStructuralElement(WorkflowElementType.INPUTS.name(), Action.CREATE);
        ZusammenElement outputsElement = buildStructuralElement(WorkflowElementType.OUTPUTS.name(), Action.CREATE);

        zusammenAdaptor.saveElement(contextCreator.create(), elementContext, inputsElement, "Create WorkflowVersion INPUTS Element");
        zusammenAdaptor.saveElement(contextCreator.create(), elementContext, outputsElement, "Create WorkflowVersion OUTPUTS Element");
    }

    @Override
    public Collection<ParameterEntity> list(String id, String versionId, ParameterRole role) {
        ElementContext elementContext = new ElementContext(id, versionId);

        return zusammenAdaptor.listElementsByName(contextCreator.create(), elementContext, null, getParentElementType(role)).stream()
                       .map(this::mapElementInfoToParameter).collect(Collectors.toList());
    }

    @Override
    public void deleteAll(String id, String versionId, ParameterRole role) {
        ElementContext elementContext = new ElementContext(id, versionId);

        Optional<ElementInfo> optionalParentElement =
                zusammenAdaptor.getElementInfoByName(contextCreator.create(), elementContext, null, getParentElementType(role));

        if (!optionalParentElement.isPresent()) {
            throw new IllegalStateException(
                    String.format("Missing data for workflow id %s version id %s", id, versionId));
        }
        ZusammenElement parentElement = buildElement(optionalParentElement.get().getId(), Action.IGNORE);
        parentElement.setSubElements(optionalParentElement.get().getSubElements().stream()
                                             .map(parameter -> buildElement(parameter.getId(), Action.DELETE))
                                             .collect(Collectors.toList()));

        zusammenAdaptor.saveElement(contextCreator.create(), elementContext, parentElement, "Delete all " + role);
    }

    @Override
    public ParameterEntity get(String id, String versionId, String parameterId) {
        ElementContext elementContext = new ElementContext(id, versionId);

        Optional<ElementInfo> element = zusammenAdaptor.getElementInfo(contextCreator.create(), elementContext, new Id(parameterId));

        return element.map(this::mapElementInfoToParameter).orElse(null);
    }

    @Override
    public void delete(String id, String versionId, String parameterId) {
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement parameterElement = buildElement(new Id(parameterId), Action.DELETE);

        zusammenAdaptor.saveElement(contextCreator.create(), elementContext, parameterElement,
                String.format("Delete Parameter with id %s", parameterId));
    }

    @Override
    public ParameterEntity create(String id, String versionId, ParameterRole role, ParameterEntity parameter) {
        ZusammenElement parameterElement = parameterToZusammenElement(parameter, role, Action.CREATE);
        ZusammenElement parentElement = buildStructuralElement(getParentElementType(role), Action.IGNORE);
        parentElement.addSubElement(parameterElement);

        ElementContext elementContext = new ElementContext(id, versionId);

        Element savedElement = zusammenAdaptor.saveElement(contextCreator.create(), elementContext, parentElement,
                "Create WorkflowVersion Parameter Element");

        parameter.setId(savedElement.getSubElements().iterator().next().getElementId().getValue());
        return parameter;
    }

    @Override
    public void update(String id, String versionId, ParameterRole role, ParameterEntity parameter) {
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement parameterElement = parameterToZusammenElement(parameter, role, Action.UPDATE);

        zusammenAdaptor.saveElement(contextCreator.create(), elementContext, parameterElement, "Update WorkflowVersion Parameter");
    }

    private ZusammenElement parameterToZusammenElement(ParameterEntity parameter, ParameterRole role, Action action) {
        ZusammenElement parameterElement =
                buildElement(parameter.getId() == null ? null : new Id(parameter.getId()), action);
        Info info = new Info();
        info.setName(parameter.getName());
        info.addProperty(ELEMENT_TYPE_PROPERTY, WorkflowElementType.valueOf(role.name()));
        info.addProperty(ParameterPropertyName.TYPE.name(), parameter.getType());
        info.addProperty(ParameterPropertyName.MANDATORY.name(), parameter.isMandatory());
        parameterElement.setInfo(info);

        return parameterElement;
    }

    private ParameterEntity mapElementInfoToParameter(ElementInfo elementInfo) {
        ParameterEntity parameterEntity = new ParameterEntity();
        parameterEntity.setId(elementInfo.getId().getValue());
        parameterEntity.setName(elementInfo.getInfo().getName());
        parameterEntity
                .setType(ParameterType.valueOf(elementInfo.getInfo().getProperty(ParameterPropertyName.TYPE.name())));
        parameterEntity.setMandatory(elementInfo.getInfo().getProperty(ParameterPropertyName.MANDATORY.name()));
        return parameterEntity;
    }

    private static String getParentElementType(ParameterRole role) {
        switch (role) {
            case INPUT:
                return WorkflowElementType.INPUTS.name();
            case OUTPUT:
                return WorkflowElementType.OUTPUTS.name();
            default:
                throw new IllegalArgumentException("Wrong Element Type");
        }
    }

}
