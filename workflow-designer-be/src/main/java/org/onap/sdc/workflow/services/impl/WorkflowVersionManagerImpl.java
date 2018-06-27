package org.onap.sdc.workflow.services.impl;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.onap.sdc.workflow.services.exceptions.VersionNotFoundException;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.types.VersionCreationMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("workflowVersionManager")
public class WorkflowVersionManagerImpl  implements WorkflowVersionManager {

    private final VersioningManager versioningManager;

    @Autowired
    public WorkflowVersionManagerImpl(VersioningManager versioningManager) {
        this.versioningManager = versioningManager;
    }

    @Override
    public Collection<Version> list(String id) {
        return versioningManager.list(id);
    }

    @Override
    public Version get(String id,Version version) {

        try {
            return versioningManager.get(id, version);
        } catch (Exception e){
            throw new VersionNotFoundException(id,version.getId());
        }
    }

    @Override
    public Version create(String id, Version version) {
        if (Objects.nonNull(getLatestVersion(id)))
            version.setBaseId(getLatestVersion(id).getId());
        return versioningManager.create(id,version, VersionCreationMethod.major);
    }

    @Override
    public void update(String id,Version version) {

        versioningManager.updateVersion(id,version);
    }

    protected Version getLatestVersion(String itemId) {
        List<Version> list = versioningManager.list(itemId);
        return list.stream().max(Version::compareTo).orElse(null);
    }

}
