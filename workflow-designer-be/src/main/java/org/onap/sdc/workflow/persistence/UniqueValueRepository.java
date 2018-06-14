package org.onap.sdc.workflow.persistence;

import org.onap.sdc.workflow.persistence.types.UniqueValueEntity;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UniqueValueRepository extends CassandraRepository<UniqueValueEntity, UniqueValueEntity> {

}
