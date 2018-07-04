package org.onap.sdc.workflow.persistence.impl;

import static org.openecomp.core.zusammen.api.ZusammenUtil.buildStructuralElement;
import static org.openecomp.core.zusammen.api.ZusammenUtil.createSessionContext;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.SessionContext;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;
import org.apache.commons.io.IOUtils;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.openecomp.core.zusammen.api.ZusammenAdaptor;
import org.openecomp.core.zusammen.api.ZusammenAdaptorFactory;
import org.openecomp.sdc.datatypes.model.ElementType;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.springframework.stereotype.Repository;

@Repository
public class ArtifactRepositoryImpl implements ArtifactRepository {

    private static final String FILE_NAME_PROPERTY = "file_name";
    private ZusammenAdaptor zusammenAdaptor = ZusammenAdaptorFactory.getInstance().createInterface();


    @Override
    public void updateArtifact(String id, Version version, String fileNAme, InputStream artifactData) {

        ZusammenElement artifactElement = buildStructuralElement(ElementType.Artifact, Action.UPDATE);
        artifactElement.setData(artifactData);
        artifactElement.getInfo().addProperty(FILE_NAME_PROPERTY, fileNAme);

        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, version.getId());

        zusammenAdaptor.saveElement(context, elementContext, artifactElement, "Update Version Artifact Element");
    }

    @Override
    public Optional<InputStream> getArtifactData(String id, Version version) {
        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, version.getId());

        Optional<Element> artifactElement =
                zusammenAdaptor.getElementByName(context, elementContext, null, ElementType.Artifact.name());

        if (!artifactElement.isPresent() || hasEmptyData(artifactElement.get().getData())) {
          return Optional.empty();
        }

        return Optional.of((artifactElement.get().getData()));
    }

    @Override
    public Optional<String> getArtifactFileName(String id, Version version) {
        SessionContext context = createSessionContext();
        ElementContext elementContext = new ElementContext(id, version.getId());

        Optional<Element> artifactElement =
                zusammenAdaptor.getElementByName(context, elementContext, null, ElementType.Artifact.name());

        if (!artifactElement.isPresent() || hasEmptyData(artifactElement.get().getData())) {
            return Optional.empty();
        }

        return Optional.of((artifactElement.get().getInfo().getProperty(FILE_NAME_PROPERTY)));
    }

    @Override
    public void createArtifactStructure(String id, Version version) {
        SessionContext context = createSessionContext();
        ElementContext elementContext =
                new ElementContext(id, version.getId());

        ZusammenElement artifactElement = buildStructuralElement(ElementType.Artifact, Action.CREATE);

        zusammenAdaptor.saveElement(context, elementContext, artifactElement, "Create Version Artifact Element");

    }

    private boolean hasEmptyData(InputStream elementData) {
        if (Objects.isNull(elementData))
                  return true;

        String emptyData = "{}";
        byte[] byteElementData;
        try {
            byteElementData = IOUtils.toByteArray(elementData);
        } catch (IOException ex) {
            return false;
        }
        return Arrays.equals(emptyData.getBytes(), byteElementData);
    }
}
