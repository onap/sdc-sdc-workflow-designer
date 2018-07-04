package org.onap.sdc.workflow.persistence.impl;

import static org.openecomp.core.zusammen.api.ZusammenUtil.buildStructuralElement;
import static org.openecomp.core.zusammen.api.ZusammenUtil.createSessionContext;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.SessionContext;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Optional;
import org.apache.commons.io.IOUtils;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.openecomp.core.zusammen.api.ZusammenAdaptor;
import org.openecomp.core.zusammen.api.ZusammenAdaptorFactory;
import org.openecomp.sdc.datatypes.model.ElementType;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.springframework.stereotype.Repository;

@Repository
public class ArtifactRepositoryImpl implements ArtifactRepository {

    private static final String FILE_NAME_PROPERTY = "fileName";
    private static final String EMPTY_DATA = "{}";
    private ZusammenAdaptor zusammenAdaptor = ZusammenAdaptorFactory.getInstance().createInterface();


    @Override
    public void updateArtifact(String id, String versionId, String fileNAme, InputStream artifactData) {

        ZusammenElement artifactElement = buildStructuralElement(ElementType.Artifact, Action.UPDATE);
        artifactElement.setData(artifactData);
        artifactElement.getInfo().addProperty(FILE_NAME_PROPERTY, fileNAme);

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        zusammenAdaptor.saveElement(context, elementContext, artifactElement, "Update WorkflowVersion Artifact Element");
    }

    @Override
    public Optional<ArtifactEntity> getArtifact(String id, String versionId) {
        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, versionId);

        Optional<Element> elementOptional =
                zusammenAdaptor.getElementByName(context, elementContext, null, ElementType.Artifact.name());

        if (!elementOptional.isPresent() || hasEmptyData(elementOptional.get().getData())) {
          return Optional.empty();
        }

        Element artifactElement = elementOptional.get();

        ArtifactEntity artifact = new ArtifactEntity(artifactElement.getInfo().getProperty(FILE_NAME_PROPERTY),artifactElement.getData());

        return Optional.of(artifact);
    }

    @Override
    public void createArtifactStructure(String id, String versionId) {
        SessionContext context = createSessionContext();
        ElementContext elementContext =
                new ElementContext(id, versionId);

        ZusammenElement artifactElement = buildStructuralElement(ElementType.Artifact, Action.CREATE);
        artifactElement.setData(new ByteArrayInputStream(EMPTY_DATA.getBytes()));

        zusammenAdaptor.saveElement(context, elementContext, artifactElement, "Create WorkflowVersion Artifact Element");

    }

    private boolean hasEmptyData(InputStream elementData) {

        byte[] byteElementData;
        try {
            byteElementData = IOUtils.toByteArray(elementData);
        } catch (IOException ex) {
            return false;
        }
        return Arrays.equals(EMPTY_DATA.getBytes(), byteElementData);
    }
}
