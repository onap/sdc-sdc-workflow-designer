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

import static org.openecomp.core.zusammen.api.ZusammenUtil.buildElement;
import static org.openecomp.core.zusammen.api.ZusammenUtil.buildStructuralElement;
import static org.openecomp.core.zusammen.api.ZusammenUtil.createSessionContext;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ElementInfo;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.Id;
import com.amdocs.zusammen.datatypes.SessionContext;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import com.amdocs.zusammen.datatypes.item.Info;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.persistence.ParameterRepository;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterPropertyName;
import org.onap.sdc.workflow.persistence.types.ParameterRole;
import org.onap.sdc.workflow.persistence.types.ParameterType;
import org.onap.sdc.workflow.persistence.types.WorkflowElementType;
import org.openecomp.core.zusammen.api.ZusammenAdaptor;
import org.openecomp.core.zusammen.api.ZusammenAdaptorFactory;
import org.openecomp.types.ElementPropertyName;
import org.springframework.stereotype.Repository;

@Repository
public class ParameterRepositoryImpl implements ParameterRepository {

    private ZusammenAdaptor zusammenAdaptor = ZusammenAdaptorFactory.getInstance().createInterface();

    @Override
    public void createStructure(String id, String versionId) {

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement inputsElement = buildStructuralElement(WorkflowElementType.INPUTS.name(), Action.CREATE);
        ZusammenElement outputsElement = buildStructuralElement(WorkflowElementType.OUTPUTS.name(), Action.CREATE);

        zusammenAdaptor.saveElement(context, elementContext, inputsElement, "Create WorkflowVersion INPUTS Element");
        zusammenAdaptor.saveElement(context, elementContext, outputsElement, "Create WorkflowVersion OUTPUTS Element");
    }

    @Override
    public Collection<ParameterEntity> list(String id, String versionId, ParameterRole role) {

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        return zusammenAdaptor.listElementsByName(context, elementContext, null, getParentElementType(role)).stream()
                              .map(this::mapElementInfoToParameter).collect(Collectors.toList());

    }

    @Override
    public void deleteAll(String id, String versionId, ParameterRole role) {

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        Optional<ElementInfo> optionalParentElement =
                zusammenAdaptor.getElementInfoByName(context, elementContext, null, getParentElementType(role));

        if (!optionalParentElement.isPresent()) {
            return;
        }
        ZusammenElement parentElement = buildElement(optionalParentElement.get().getId(), Action.IGNORE);
        parentElement.setSubElements(optionalParentElement.get().getSubElements().stream()
                                                          .map(parameter -> buildElement(parameter.getId(),
                                                                  Action.DELETE)).collect(Collectors.toList()));

        zusammenAdaptor.saveElement(context, elementContext, parentElement, "Delete all " + role);
    }

    @Override
    public ParameterEntity get(String id, String versionId, String parameterId) {

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        Optional<ElementInfo> element = zusammenAdaptor.getElementInfo(context, elementContext, new Id(parameterId));

        return element.map(this::mapElementInfoToParameter).orElse(null);
    }

    @Override
    public void delete(String id, String versionId, String parameterId) {
        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement parameterElement = buildElement(new Id(parameterId), Action.DELETE);

        zusammenAdaptor.saveElement(context, elementContext, parameterElement,
                String.format("Delete Parameter with id %s", parameterId));

    }

    @Override
    public ParameterEntity create(String id, String versionId, ParameterRole role, ParameterEntity parameter) {

        ZusammenElement parameterElement = parameterToZusammenElement(parameter, role, Action.CREATE);
        ZusammenElement parentElement = buildStructuralElement(getParentElementType(role), Action.IGNORE);
        parentElement.addSubElement(parameterElement);

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        Element savedElement = zusammenAdaptor.saveElement(context, elementContext, parentElement,
                "Create WorkflowVersion Parameter Element");

        parameter.setId(savedElement.getSubElements().iterator().next().getElementId().getValue());
        return parameter;
    }

    @Override
    public void update(String id, String versionId, ParameterRole role, ParameterEntity parameter) {

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        ZusammenElement parameterElement = parameterToZusammenElement(parameter, role, Action.UPDATE);

        zusammenAdaptor.saveElement(context, elementContext, parameterElement, "Update WorkflowVersion Parameter");
    }

    private ZusammenElement parameterToZusammenElement(ParameterEntity parameter, ParameterRole role, Action action) {

        ZusammenElement parameterElement =
                buildElement(parameter.getId() == null ? null : new Id(parameter.getId()), action);
        Info info = new Info();
        info.setName(parameter.getName());
        info.addProperty(ElementPropertyName.elementType.name(), WorkflowElementType.valueOf(role.name()));
        info.addProperty(ParameterPropertyName.TYPE.name(), parameter.getType());
        info.addProperty(ParameterPropertyName.mandatory.name(), parameter.isMandatory());
        parameterElement.setInfo(info);

        return parameterElement;
    }

    private ParameterEntity mapElementInfoToParameter(ElementInfo elementInfo) {
        ParameterEntity parameterEntity = new ParameterEntity();
        parameterEntity.setId(elementInfo.getId().getValue());
        parameterEntity.setName(elementInfo.getInfo().getName());
        parameterEntity
                .setType(ParameterType.valueOf(elementInfo.getInfo().getProperty(ParameterPropertyName.TYPE.name())));
        parameterEntity.setMandatory(elementInfo.getInfo().getProperty(ParameterPropertyName.mandatory.name()));
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
