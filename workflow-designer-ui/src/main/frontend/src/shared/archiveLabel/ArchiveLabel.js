import React from 'react';
import { I18n } from 'react-redux-i18n';

const ArchiveLabel = () => (
    <div className="archive-label">{I18n.t('workflow.overview.archived')}</div>
);

export default ArchiveLabel;
