import React from 'react';
import PropTypes from 'prop-types';
import { I18n } from 'react-redux-i18n';

export const LabeledValue = ({ title, value }) => (
    <React.Fragment>
        <div className="label">{title}</div>
        <div className="value">{value}</div>
    </React.Fragment>
);

LabeledValue.propTypes = {
    title: PropTypes.string,
    value: PropTypes.string
};

export const VersionInfo = ({ created, modified, children }) => (
    <div className="version-info-part">
        <LabeledValue
            title={I18n.t('workflow.general.created')}
            value={created}
        />
        <LabeledValue
            title={I18n.t('workflow.general.modified')}
            value={modified}
        />
        {children}
    </div>
);

VersionInfo.propTypes = {
    created: PropTypes.string,
    modified: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};
